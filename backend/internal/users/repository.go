package users

import (
	"context"
	"errors"
	"sync"
	"time"
)

// Repository abstracts user persistence. Swap this in-memory implementation with DB-backed repo later.
type Repository interface {
    Create(ctx context.Context, username, passwordHash string) (*User, error)
    FindByUsername(ctx context.Context, username string) (*User, error)
}

// InMemoryRepository is a goroutine-safe in-memory user repository. Replace with Postgres implementation later.
type InMemoryRepository struct {
    mu               sync.RWMutex
    nextID           int64
    usersByUsername  map[string]*User
}

func NewInMemoryRepository() *InMemoryRepository {
    return &InMemoryRepository{
        nextID:          1,
        usersByUsername: make(map[string]*User),
    }
}

func (r *InMemoryRepository) Create(ctx context.Context, username, passwordHash string) (*User, error) {
    r.mu.Lock()
    defer r.mu.Unlock()

    if _, exists := r.usersByUsername[username]; exists {
        return nil, errors.New("username already exists")
    }

    user := &User{
        ID:           r.nextID,
        Username:     username,
        PasswordHash: passwordHash,
        CreatedAt:    time.Now(),
    }
    r.usersByUsername[username] = user
    r.nextID++

    // DB NOTE: Here you would insert the user into the database and return the persisted record.
    return user, nil
}

func (r *InMemoryRepository) FindByUsername(ctx context.Context, username string) (*User, error) {
    r.mu.RLock()
    defer r.mu.RUnlock()

    user, ok := r.usersByUsername[username]
    if !ok {
        return nil, errors.New("user not found")
    }
    // DB NOTE: Here you would perform a SELECT query to retrieve the user by username.
    return user, nil
}

