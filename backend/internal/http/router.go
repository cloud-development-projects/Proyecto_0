package httpserver

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq" // PostgreSQL driver

	"backend/root/internal/auth"
	"backend/root/internal/categories"
	"backend/root/internal/config"
	"backend/root/internal/storage"
	"backend/root/internal/tasks"
	"backend/root/internal/users"
)

// NewRouter creates and returns a configured Gin engine
func NewRouter(cfg *config.Config) *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

    // Ensure PostgreSQL is configured
    if cfg.Database.Driver != "postgres" {
        log.Fatalf("Only PostgreSQL database is supported. Set DB_DRIVER=postgres")
    }

    // Initialize PostgreSQL connection
    dsn := fmt.Sprintf(
        "host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
        cfg.Database.Host, cfg.Database.Port, cfg.Database.User, 
        cfg.Database.Password, cfg.Database.Name, cfg.Database.SSLMode,
    )

    db, err := sql.Open("postgres", dsn)
    if err != nil {
        log.Fatalf("Failed to open database: %v", err)
    }

    // Configure connection pool
    db.SetMaxOpenConns(cfg.Database.MaxOpenConns)
    db.SetMaxIdleConns(cfg.Database.MaxIdleConns)
    db.SetConnMaxLifetime(time.Hour)

    // Test connection
    if err := db.Ping(); err != nil {
        log.Fatalf("Failed to ping database: %v", err)
    }
    
    // Initialize repositories
    userRepo := users.NewPostgresRepository(db)
    categoryRepo := categories.NewPostgresRepository(db)
    taskRepo := tasks.NewPostgresRepository(db)
    log.Printf("Using PostgreSQL database: %s@%s:%s/%s", 
        cfg.Database.User, cfg.Database.Host, cfg.Database.Port, cfg.Database.Name)
    
    // Initialize profile picture service
    profilePicService := storage.NewProfilePictureService()
    userSvc := users.NewService(userRepo, profilePicService)
    tokenMgr := auth.TokenManager{
        Secret: []byte(cfg.JWT.Secret), 
        Issuer: cfg.JWT.Issuer,
    }
    sessionStore := users.NewInMemorySessionStore()
    userHandler := users.NewHandler(userSvc, tokenMgr, sessionStore, cfg.JWT.Expiration)

    // Initialize service components
    categorySvc := categories.NewService(categoryRepo)
    categoryHandler := categories.NewHandler(categorySvc)
    
    taskSvc := tasks.NewService(taskRepo, categoryRepo)
    taskHandler := tasks.NewHandler(taskSvc)

    api := router.Group("/api")
    {
        authGroup := api.Group("/auth")
        authGroup.POST("/register", userHandler.Register)
        authGroup.POST("/login", userHandler.Login)
        authGroup.POST("/logout", userHandler.Logout)

        // Protected routes requiring authentication
        protected := api.Group("/protected")
        protected.Use(AuthMiddleware(tokenMgr, sessionStore.IsRevoked))
        {
            // User profile endpoint
            protected.GET("/me", func(c *gin.Context) {
                claims, _ := c.Get("claims")
                c.JSON(200, gin.H{"claims": claims, "app": cfg.App.Name})
            })

            // Protected Categories endpoints
            categoriesGroup := protected.Group("/categories")
            categoriesGroup.POST("", categoryHandler.Create)
            categoriesGroup.GET("", categoryHandler.GetAll)
            categoriesGroup.GET("/:id", categoryHandler.GetByID)
            categoriesGroup.PUT("/:id", categoryHandler.Update)
            categoriesGroup.DELETE("/:id", categoryHandler.Delete)

            // Task endpoints
            protected.POST("/tasks", taskHandler.Create)       // Create task with category association
            protected.GET("/tasks", taskHandler.GetAll)        // Get all tasks with optional filtering
            protected.DELETE("/tasks/:id", taskHandler.Delete) // Delete task
        }
    }

	return router
}