package tasks

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Handler handles HTTP requests for task operations
type Handler struct {
	service Service
}

// NewHandler creates a new task handler
func NewHandler(service Service) *Handler {
	return &Handler{
		service: service,
	}
}

// Create handles POST /tasks - creates a new task with optional category association
func (h *Handler) Create(c *gin.Context) {
	var req CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request: " + err.Error()})
		return
	}

	userID, err := h.getUserIDFromClaims(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Create the task
	task, err := h.service.Create(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, task)
}

// GetAll handles GET /tasks - retrieves all tasks for the authenticated user with optional filtering
func (h *Handler) GetAll(c *gin.Context) {
	userID, err := h.getUserIDFromClaims(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Parse optional query parameters for filtering
	var categoryID *int64
	var stateID *int64

	// Parse category_id query parameter
	if categoryIDStr := c.Query("category_id"); categoryIDStr != "" {
		catID, err := strconv.ParseInt(categoryIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid category_id parameter"})
			return
		}
		categoryID = &catID
	}

	// Parse state_id query parameter
	if stateIDStr := c.Query("state_id"); stateIDStr != "" {
		stID, err := strconv.ParseInt(stateIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid state_id parameter"})
			return
		}
		stateID = &stID
	}

	// Get tasks with optional filtering
	tasks, err := h.service.GetAllByUser(c.Request.Context(), userID, categoryID, stateID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tasks": tasks,
		"count": len(tasks),
	})
}

// GetByID handles GET /tasks/:id - retrieves task details by ID
func (h *Handler) GetByID(c *gin.Context) {
	taskID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid task ID"})
		return
	}

	userID, err := h.getUserIDFromClaims(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	task, err := h.service.GetByID(c.Request.Context(), taskID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, task)
}

// Update handles PUT /tasks/:id - updates an existing task
func (h *Handler) Update(c *gin.Context) {
	taskID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid task ID"})
		return
	}

	var req UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request: " + err.Error()})
		return
	}

	userID, err := h.getUserIDFromClaims(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	task, err := h.service.Update(c.Request.Context(), taskID, userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, task)
}

// Delete handles DELETE /tasks/:id - deletes a task
func (h *Handler) Delete(c *gin.Context) {
	taskID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid task ID"})
		return
	}

	userID, err := h.getUserIDFromClaims(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	err = h.service.Delete(c.Request.Context(), taskID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "task deleted successfully"})
}

// Helper function to extract user ID from JWT claims
func (h *Handler) getUserIDFromClaims(c *gin.Context) (int64, error) {
	claims, exists := c.Get("claims")
	if !exists {
		return 0, errors.New("user not authenticated")
	}

	claimsMap, ok := claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("invalid claims")
	}

	userIDInterface, exists := claimsMap["uid"]
	if !exists {
		return 0, errors.New("user ID not found in token")
	}

	// Convert userID to int64
	switch v := userIDInterface.(type) {
	case float64:
		return int64(v), nil
	case int64:
		return v, nil
	case int:
		return int64(v), nil
	default:
		return 0, errors.New("invalid user ID format")
	}
}