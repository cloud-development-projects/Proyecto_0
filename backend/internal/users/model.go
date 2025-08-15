package users

import "time"

// User represents an application user. In a real implementation,
// this would be persisted to a database. The PasswordHash contains the
// bcrypt hash of the user's password.
type User struct {
    ID           int64     `json:"id"`
    Username     string    `json:"username"`
    PasswordHash string    `json:"-"`
    CreatedAt    time.Time `json:"created_at"`
}

