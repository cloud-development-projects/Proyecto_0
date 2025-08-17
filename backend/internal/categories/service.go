package categories

import (
	"context"
	"errors"
	"strings"
)

// Service defines the interface for category business logic
type Service interface {
	Create(ctx context.Context, req CreateCategoryRequest) (*Category, error)
	GetByID(ctx context.Context, id int64) (*Category, error)
	GetAll(ctx context.Context) ([]*Category, error)
	Update(ctx context.Context, id int64, req UpdateCategoryRequest) (*Category, error)
	Delete(ctx context.Context, id int64) error
}

// service implements the Service interface
type service struct {
	repo Repository
}

// NewService creates a new category service
func NewService(repo Repository) Service {
	return &service{
		repo: repo,
	}
}

// Create creates a new category with validation
func (s *service) Create(ctx context.Context, req CreateCategoryRequest) (*Category, error) {
	// Validate and clean input
	name := strings.TrimSpace(req.Name)
	description := strings.TrimSpace(req.Description)
	
	if name == "" {
		return nil, errors.New("category name cannot be empty")
	}
	
	if len(name) > 100 {
		return nil, errors.New("category name cannot exceed 100 characters")
	}
	
	if len(description) > 500 {
		return nil, errors.New("category description cannot exceed 500 characters")
	}
	
	return s.repo.Create(ctx, name, description)
}

// GetByID retrieves a category by ID
func (s *service) GetByID(ctx context.Context, id int64) (*Category, error) {
	if id <= 0 {
		return nil, errors.New("invalid category ID")
	}
	
	return s.repo.GetByID(ctx, id)
}

// GetAll retrieves all categories
func (s *service) GetAll(ctx context.Context) ([]*Category, error) {
	return s.repo.GetAll(ctx)
}

// Update updates an existing category with validation
func (s *service) Update(ctx context.Context, id int64, req UpdateCategoryRequest) (*Category, error) {
	if id <= 0 {
		return nil, errors.New("invalid category ID")
	}
	
	// Validate and clean input
	name := strings.TrimSpace(req.Name)
	description := strings.TrimSpace(req.Description)
	
	if name == "" {
		return nil, errors.New("category name cannot be empty")
	}
	
	if len(name) > 100 {
		return nil, errors.New("category name cannot exceed 100 characters")
	}
	
	if len(description) > 500 {
		return nil, errors.New("category description cannot exceed 500 characters")
	}
	
	// Check if category exists
	exists, err := s.repo.Exists(ctx, id)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, errors.New("category not found")
	}
	
	return s.repo.Update(ctx, id, name, description)
}

// Delete removes a category by ID
func (s *service) Delete(ctx context.Context, id int64) error {
	if id <= 0 {
		return errors.New("invalid category ID")
	}
	
	// Check if category exists
	exists, err := s.repo.Exists(ctx, id)
	if err != nil {
		return err
	}
	if !exists {
		return errors.New("category not found")
	}
	
	return s.repo.Delete(ctx, id)
}