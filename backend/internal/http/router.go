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
	"backend/root/internal/users"
)

// NewRouter creates and returns a configured Gin engine
func NewRouter(cfg *config.Config) *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

    // Wire dependencies for auth/users/categories modules based on configuration
    var userRepo users.Repository
    var categoryRepo categories.Repository
    
    if cfg.Database.Driver == "postgres" {
        // Initialize PostgreSQL connection directly
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
        
        userRepo = users.NewPostgresRepository(db)
        categoryRepo = categories.NewPostgresRepository(db)
        log.Printf("Using PostgreSQL database: %s@%s:%s/%s", 
            cfg.Database.User, cfg.Database.Host, cfg.Database.Port, cfg.Database.Name)
    } else {
        // Use in-memory repository for development/testing
        userRepo = users.NewInMemoryRepository()
        // Note: Categories module only supports PostgreSQL for now
        log.Println("Using in-memory database (development mode)")
        log.Println("Warning: Categories endpoints will not be available with in-memory database")
    }
    
    userSvc := users.NewService(userRepo)
    tokenMgr := auth.TokenManager{
        Secret: []byte(cfg.JWT.Secret), 
        Issuer: cfg.JWT.Issuer,
    }
    sessionStore := users.NewInMemorySessionStore()
    userHandler := users.NewHandler(userSvc, tokenMgr, sessionStore, cfg.JWT.Expiration)

    // Initialize categories components (only when using PostgreSQL)
    var categoryHandler *categories.Handler
    if categoryRepo != nil {
        categorySvc := categories.NewService(categoryRepo)
        categoryHandler = categories.NewHandler(categorySvc)
    }

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
            if categoryHandler != nil {
                categoriesGroup := protected.Group("/categories")
                categoriesGroup.POST("", categoryHandler.Create)
                categoriesGroup.GET("", categoryHandler.GetAll)
                categoriesGroup.GET("/:id", categoryHandler.GetByID)
                categoriesGroup.PUT("/:id", categoryHandler.Update)
                categoriesGroup.DELETE("/:id", categoryHandler.Delete)
            }
        }
    }

	return router
}