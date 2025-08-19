package tasks

import (
        "net/http"
        "strconv"

        "github.com/gin-gonic/gin"
)

type Handler struct {
        svc *Service
}

func NewHandler(s *Service) *Handler {
        return &Handler{svc: s}
}

// POST /api/task
func (h *Handler) CreateTarea(c *gin.Context) {
        var req Task
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        // Simulación: obtén el userID desde JWT en un futuro
        req.UserID = 1

        if err := h.svc.CreateTask(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }
        c.JSON(http.StatusCreated, req)
}

// GET /api/task/:id
func (h *Handler) GetTareaByID(c *gin.Context) {
        id, _ := strconv.Atoi(c.Param("id"))
        task, err := h.svc.GetTask(id)
        if err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
                return
        }
        c.JSON(http.StatusOK, task)
}

// GET /api/task
func (h *Handler) GetTareas(c *gin.Context) {
        userID := 1 // debería obtenerse del JWT

        var categoryID *int
        if cid := c.Query("category_id"); cid != "" {
                v, _ := strconv.Atoi(cid)
                categoryID = &v
        }

        var status *string
        if s := c.Query("status"); s != "" {
                status = &s
        }

        tasks, err := h.svc.ListTasks(userID, categoryID, status)
        if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
                return
        }
        c.JSON(http.StatusOK, tasks)
}

// PUT /api/task/:id
func (h *Handler) UpdateTarea(c *gin.Context) {
        id, _ := strconv.Atoi(c.Param("id"))

        var req Task
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }
        req.ID = id

        if err := h.svc.UpdateTask(&req); err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
                return
        }
        c.JSON(http.StatusOK, req)
}

// DELETE /api/task/:id
func (h *Handler) DeleteTarea(c *gin.Context) {
        id, _ := strconv.Atoi(c.Param("id"))
        if err := h.svc.DeleteTask(id); err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
                return
        }
        c.JSON(http.StatusOK, gin.H{"deleted": id})
}
