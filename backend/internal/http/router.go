package httpserver

import (
	"log"

	"github.com/gin-gonic/gin"

	"backend/root/internal/auth"
	"backend/root/internal/config"
	"backend/root/internal/database"
	"backend/root/internal/users"
)

// NewRouter creates and returns a configured Gin engine
func NewRouter(cfg *config.Config) *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

	// Wire dependencies for auth/users module based on configuration
	var userRepo users.Repository
	var taskRepo task.Repository

	if cfg.Database.Driver == "postgres" {
		// Initialize PostgreSQL connection
		db, err := database.NewPostgresConnection(cfg.Database)
		if err != nil {
			log.Fatalf("Failed to connect to PostgreSQL: %v", err)
		}

		// Create tables if they don't exist
		if err := database.CreateTables(db); err != nil {
			log.Fatalf("Failed to create database tables: %v", err)
		}

		userRepo = users.NewPostgresRepository(db)
		taskRepo = task.NewPostgresRepository(db)

		log.Printf("Using PostgreSQL database: %s@%s:%s/%s",
			cfg.Database.User, cfg.Database.Host, cfg.Database.Port, cfg.Database.Name)
	} else {
		// Use in-memory repository for development/testing
		userRepo = users.NewInMemoryRepository()
		taskRepo = task.NewInMemoryRepository()
		log.Println("Using in-memory database (development mode)")
	}

	userSvc := users.NewService(userRepo)
	tokenMgr := auth.TokenManager{
		Secret: []byte(cfg.JWT.Secret),
		Issuer: cfg.JWT.Issuer,
	}
	sessionStore := users.NewInMemorySessionStore()
	userHandler := users.NewHandler(userSvc, tokenMgr, sessionStore, cfg.JWT.Expiration)

	// Task
	taskSvc := task.NewService(taskRepo)
	taskHandler := task.NewHandler(taskSvc)

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
			c.JSON(200, gin.H{"claims": claims, "app": cfg.App.Name})
		})

		// Task paths
		taskGroup := api.Group("/task")
		{
			taskGroup.POST("/", taskHandler.CreateTarea)
			taskGroup.GET("/", taskHandler.GetTareas)
			taskGroup.GET("/:id", taskHandler.GetTareaByID)
			taskGroup.PUT("/:id", taskHandler.UpdateTarea)
			taskGroup.DELETE("/:id", taskHandler.DeleteTarea)
		}
	}

	return router
}
