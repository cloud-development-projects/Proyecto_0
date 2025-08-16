package users

import (
	"context"
	"errors"

	"backend/root/internal/auth"
)

// Service provides user-related use cases.
type Service interface {
    Register(ctx context.Context, username, password string) (*User, error)
    Authenticate(ctx context.Context, username, password string) (*User, error)
}

type service struct {
    repo Repository
}

func NewService(repo Repository) Service {
    return &service{repo: repo}
}

func (s *service) Register(ctx context.Context, username, password string) (*User, error) {
    if username == "" || password == "" {
        return nil, errors.New("username and password are required")
    }
    hash, err := auth.HashPassword(password)
    if err != nil {
        return nil, err
    }
    return s.repo.Create(ctx, username, hash)
}

func (s *service) Authenticate(ctx context.Context, username, password string) (*User, error) {
    if username == "" || password == "" {
        return nil, errors.New("username and password are required")
    }
    user, err := s.repo.FindByUsername(ctx, username)
    if err != nil {
        return nil, errors.New("invalid credentials")
    }
    if err := auth.CheckPassword(user.PasswordHash, password); err != nil {
        return nil, errors.New("invalid credentials")
    }
    return user, nil
}

