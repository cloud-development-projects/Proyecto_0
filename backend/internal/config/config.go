package config

import (
	"os"
	"strconv"
	"time"
)

// Config holds all configuration for the application
type Config struct {
	Server ServerConfig
	JWT    JWTConfig
	App    AppConfig
}

type ServerConfig struct {
	Port string
	Host string
	Mode string // gin mode: debug, release, test
}

type JWTConfig struct {
	Secret     string
	Issuer     string
	Expiration time.Duration
}

type AppConfig struct {
	Name    string
	Version string
	Env     string // development, staging, production
}

// Load reads configuration from environment variables with sensible defaults
func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
			Host: getEnv("HOST", "0.0.0.0"),
			Mode: getEnv("GIN_MODE", "debug"),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET", "dev-secret-change-me-in-production"),
			Issuer:     getEnv("JWT_ISSUER", "Proyecto_0"),
			Expiration: getEnvDuration("JWT_EXPIRATION", "24h"),
		},
		App: AppConfig{
			Name:    getEnv("APP_NAME", "Proyecto_0"),
			Version: getEnv("APP_VERSION", "1.0.0"),
			Env:     getEnv("APP_ENV", "development"),
		},
	}
}

// getEnv gets an environment variable with a fallback default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvInt gets an environment variable as integer with a fallback default
func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// getEnvBool gets an environment variable as boolean with a fallback default
func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

// getEnvDuration gets an environment variable as time.Duration with a fallback default
func getEnvDuration(key, defaultValue string) time.Duration {
	value := getEnv(key, defaultValue)
	if duration, err := time.ParseDuration(value); err == nil {
		return duration
	}
	// If parsing fails, try to parse as defaultValue
	if duration, err := time.ParseDuration(defaultValue); err == nil {
		return duration
	}
	return 24 * time.Hour // ultimate fallback
}
