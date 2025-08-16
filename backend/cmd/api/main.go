package main

import (
	"log"

	"backend/root/internal/config"
	httpserver "backend/root/internal/http"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration from environment variables
	cfg := config.Load()

	// Set Gin mode based on configuration
	gin.SetMode(cfg.Server.Mode)

	// Create router with configuration
	router := httpserver.NewRouter(cfg)

	// Start server
	addr := cfg.Server.Host + ":" + cfg.Server.Port
	log.Printf("Starting %s v%s on %s (env: %s)", 
		cfg.App.Name, cfg.App.Version, addr, cfg.App.Env)

	if err := router.Run(addr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}