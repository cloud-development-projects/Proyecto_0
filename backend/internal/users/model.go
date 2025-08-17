package users

// User represents an application user. In a real implementation,
// this would be persisted to a database. The Password field contains the
// bcrypt hash of the user's password.
type User struct {
    ID           int64  `json:"id"`
    Username     string `json:"username"`
    Password     string `json:"-"`
}