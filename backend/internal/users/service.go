package users

import (
	"context"
	"errors"

	"backend/root/internal/auth"
	"backend/root/internal/storage"
)

// Service provides user-related use cases.
type Service interface {
    Register(ctx context.Context, username, password string) (*User, error)
    Authenticate(ctx context.Context, username, password string) (*User, error)
}

type service struct {
    repo Repository
    profilePicService *storage.ProfilePictureService
}

func NewService(repo Repository, profilePicService *storage.ProfilePictureService) Service {
    return &service{
        repo: repo, 
        profilePicService: profilePicService,
    }
}

func (s *service) Register(ctx context.Context, username, password string) (*User, error) {
    if username == "" || password == "" {
        return nil, errors.New("username and password are required")
    }
    hash, err := auth.HashPassword(password)
    if err != nil {
        return nil, err
    }
    // Generate default profile picture
    defaultProfilePic := s.profilePicService.GetDefaultProfilePicture(username)
    return s.repo.Create(ctx, username, hash, defaultProfilePic)
}

func (s *service) Authenticate(ctx context.Context, username, password string) (*User, error) {
    if username == "" || password == "" {
        return nil, errors.New("username and password are required")
    }
    user, err := s.repo.FindByUsername(ctx, username)
    if err != nil {
        return nil, errors.New("invalid credentials")
    }
    if err := auth.CheckPassword(user.Password, password); err != nil {
        return nil, errors.New("invalid credentials")
    }
    return user, nil
}