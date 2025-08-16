package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "proyecto0/internal/models"
    "proyecto0/internal/repository"
)

type TareasHandler struct {
    Repo *repository.TareasRepository
}

func NewTareasHandler(repo *repository.TareasRepository) *TareasHandler {
    return &TareasHandler{Repo: repo}
}