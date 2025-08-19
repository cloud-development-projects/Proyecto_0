package users

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"backend/root/internal/auth"
)

// Handler wires HTTP with user and auth services.
type Handler struct {
    users       Service
    tokens      auth.TokenManager
    // sessions stores invalidated token IDs (jti) to simulate logout.
    sessions    *InMemorySessionStore
    jwtExpiry   time.Duration
}

type InMemorySessionStore struct {
    // For simplicity, we store token string in a set to invalidate on logout.
    // In production, use a blacklist with TTL in Redis, or rotate tokens with server-side sessions.
    revoked map[string]time.Time
}

func NewInMemorySessionStore() *InMemorySessionStore {
    return &InMemorySessionStore{revoked: make(map[string]time.Time)}
}

// IsRevoked returns true if the token is found in the revoked set.
func (s *InMemorySessionStore) IsRevoked(token string) bool {
    _, ok := s.revoked[token]
    return ok
}

func NewHandler(users Service, tokens auth.TokenManager, sessions *InMemorySessionStore, jwtExpiry time.Duration) *Handler {
    return &Handler{
        users:     users, 
        tokens:    tokens, 
        sessions:  sessions,
        jwtExpiry: jwtExpiry,
    }
}

type registerRequest struct {
    Username string `json:"username"`
    Password string `json:"password"`
}

type loginRequest struct {
    Username string `json:"username"`
    Password string `json:"password"`
}

// Register handles user registration.
func (h *Handler) Register(c *gin.Context) {
    var req registerRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
        return
    }
    user, err := h.users.Register(c.Request.Context(), req.Username, req.Password)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusCreated, gin.H{
        "id": user.ID, 
        "username": user.Username, 
        "profile_img": user.ProfileImg,
    })
}

// Login authenticates user and issues a JWT.
func (h *Handler) Login(c *gin.Context) {
    var req loginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
        return
    }
    user, err := h.users.Authenticate(c.Request.Context(), req.Username, req.Password)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
        return
    }
    token, err := h.tokens.CreateToken(
        req.Username,
        h.jwtExpiry,
        map[string]any{"uid": user.ID, "username": user.Username},
    )
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create token"})
        return
    }
    c.JSON(http.StatusOK, gin.H{
        "token":       token,
        "id":          user.ID,
        "username":    user.Username,
        "profile_img": user.ProfileImg, // adjust to your field name
    })
}

// Logout invalidates the provided JWT by adding it to a revoked set (simulated server-side invalidation).
func (h *Handler) Logout(c *gin.Context) {
    // Typical logout for stateless JWT is performed on client by discarding the token.
    // When server-side invalidation is required, a token blacklist/denylist is necessary.
    // Here we simulate that using an in-memory map.
    authHeader := c.GetHeader("Authorization")
    if authHeader == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "authorization header required"})
        return
    }
    // Expecting format: "Bearer <token>"
    const prefix = "Bearer "
    if len(authHeader) <= len(prefix) || authHeader[:len(prefix)] != prefix {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid authorization header"})
        return
    }
    token := authHeader[len(prefix):]
    h.sessions.revoked[token] = time.Now().Add(24 * time.Hour)
    c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}




