package httpserver

import (
	"github.com/gin-gonic/gin"

	"backend/root/internal/auth"
	"backend/root/internal/users"
)

// NewRouter creates and returns a configured Gin engine
func NewRouter() *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

    // Wire in-memory dependencies for auth/users module
    userRepo := users.NewInMemoryRepository()
    userSvc := users.NewService(userRepo)
    tokenMgr := auth.TokenManager{Secret: []byte("dev-secret-change-me"), Issuer: "Proyecto_0"}
    sessionStore := users.NewInMemorySessionStore()
    userHandler := users.NewHandler(userSvc, tokenMgr, sessionStore)

    api := router.Group("/api")
    {
        authGroup := api.Group("/auth")
        authGroup.POST("/register", userHandler.Register)
        authGroup.POST("/login", userHandler.Login)
        authGroup.POST("/logout", userHandler.Logout)

        // Example protected route using project-level middleware
        protected := api.Group("/protected")
        protected.Use(AuthMiddleware(tokenMgr, sessionStore.IsRevoked))
        protected.GET("/me", func(c *gin.Context) {
            claims, _ := c.Get("claims")
            c.JSON(200, gin.H{"claims": claims})
        })
    }

	return router
}


