package main

import (
	"log"
	"os"

	httpserver "backend/root/internal/http"
)

func main() {
	router := httpserver.NewRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := router.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}