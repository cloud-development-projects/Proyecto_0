package tasks

import (
	"context"
	"errors"
	"strings"
	"time"
)

// Service defines the interface for task business logic
type Service interface {
	Create(ctx context.Context, userID int64, req CreateTaskRequest) (*TaskResponse, error)
	GetByID(ctx context.Context, taskID int64, userID int64) (*TaskResponse, error)
	GetAllByUser(ctx context.Context, userID int64, categoryID *int64, stateID *int64) ([]*TaskResponse, error)
	Update(ctx context.Context, taskID int64, userID int64, req UpdateTaskRequest) (*TaskResponse, error)
	Delete(ctx context.Context, taskID int64, userID int64) error
}

// service implements the Service interface
type service struct {
	repo     Repository
	catRepo  CategoryRepository // For validating category exists
}

// CategoryRepository defines the minimal interface needed to validate categories
type CategoryRepository interface {
	Exists(ctx context.Context, id int64) (bool, error)
}

// NewService creates a new task service
func NewService(repo Repository, catRepo CategoryRepository) Service {
	return &service{
		repo:    repo,
		catRepo: catRepo,
	}
}

// Create creates a new task with validation
func (s *service) Create(ctx context.Context, userID int64, req CreateTaskRequest) (*TaskResponse, error) {
	// Validate and clean input
	taskText := strings.TrimSpace(req.TaskText)
	if taskText == "" {
		return nil, errors.New("task text cannot be empty")
	}
	
	if len(taskText) > 1000 {
		return nil, errors.New("task text cannot exceed 1000 characters")
	}
	
	// Parse and validate end date if provided
	var endDate *time.Time
	if req.EndDate != "" {
		parsedDate, err := time.Parse("2006-01-02", req.EndDate)
		if err != nil {
			return nil, errors.New("invalid end date format, use YYYY-MM-DD")
		}
		
		// Check that end date is not in the past
		if parsedDate.Before(time.Now().Truncate(24 * time.Hour)) {
			return nil, errors.New("end date cannot be in the past")
		}
		
		endDate = &parsedDate
	}
	
	// Validate category if provided
	if req.CategoryID != nil {
		exists, err := s.catRepo.Exists(ctx, *req.CategoryID)
		if err != nil {
			return nil, errors.New("failed to validate category")
		}
		if !exists {
			return nil, errors.New("category does not exist")
		}
	}
	
	// Create the task
	task, err := s.repo.Create(ctx, userID, taskText, endDate, req.CategoryID)
	if err != nil {
		return nil, err
	}
	
	// Return the task with complete details (state and category info)
	return s.repo.GetByIDWithDetails(ctx, task.ID)
}

// GetByID retrieves a task by ID with ownership validation
func (s *service) GetByID(ctx context.Context, taskID int64, userID int64) (*TaskResponse, error) {
	if taskID <= 0 {
		return nil, errors.New("invalid task ID")
	}
	
	// First check if task exists and belongs to user
	existingTask, err := s.repo.GetByID(ctx, taskID)
	if err != nil {
		return nil, err
	}
	if existingTask == nil {
		return nil, errors.New("task not found")
	}
	if existingTask.UserID != userID {
		return nil, errors.New("task not found")
	}
	
	// Return the task with detailed information
	return s.repo.GetByIDWithDetails(ctx, taskID)
}

// GetAllByUser retrieves all tasks for a user with optional filtering
func (s *service) GetAllByUser(ctx context.Context, userID int64, categoryID *int64, stateID *int64) ([]*TaskResponse, error) {
	// Validate category if provided
	if categoryID != nil && *categoryID > 0 {
		exists, err := s.catRepo.Exists(ctx, *categoryID)
		if err != nil {
			return nil, errors.New("failed to validate category")
		}
		if !exists {
			return nil, errors.New("category does not exist")
		}
	}
	
	// Validate state if provided
	if stateID != nil && *stateID > 0 {
		if !IsValidState(*stateID) {
			return nil, errors.New("invalid state ID")
		}
	}
	
	// Get tasks from repository
	return s.repo.GetAllByUser(ctx, userID, categoryID, stateID)
}

// Update updates an existing task with validation
func (s *service) Update(ctx context.Context, taskID int64, userID int64, req UpdateTaskRequest) (*TaskResponse, error) {
	if taskID <= 0 {
		return nil, errors.New("invalid task ID")
	}
	
	// Check if task exists and belongs to user
	existingTask, err := s.repo.GetByID(ctx, taskID)
	if err != nil {
		return nil, err
	}
	if existingTask == nil {
		return nil, errors.New("task not found")
	}
	if existingTask.UserID != userID {
		return nil, errors.New("task not found")
	}
	
	// Validate and clean input
	taskText := strings.TrimSpace(req.TaskText)
	if taskText == "" {
		return nil, errors.New("task text cannot be empty")
	}
	
	if len(taskText) > 1000 {
		return nil, errors.New("task text cannot exceed 1000 characters")
	}
	
	// Parse and validate end date if provided
	var endDate *time.Time
	if req.EndDate != "" {
		parsedDate, err := time.Parse("2006-01-02", req.EndDate)
		if err != nil {
			return nil, errors.New("invalid end date format, use YYYY-MM-DD")
		}
		
		// Check that end date is not in the past
		if parsedDate.Before(time.Now().Truncate(24 * time.Hour)) {
			return nil, errors.New("end date cannot be in the past")
		}
		
		endDate = &parsedDate
	}
	// If req.EndDate is empty string, endDate will be nil (clears the date)
	
	// Validate state if provided
	if req.StateID != nil {
		if !IsValidState(*req.StateID) {
			return nil, errors.New("invalid state ID")
		}
	}
	
	// Update the task
	_, err = s.repo.Update(ctx, taskID, taskText, req.CategoryID, endDate, req.StateID)
	if err != nil {
		return nil, err
	}
	
	// Return the updated task with detailed information
	return s.repo.GetByIDWithDetails(ctx, taskID)
}

// Delete removes a task (only if it belongs to the user)
func (s *service) Delete(ctx context.Context, taskID int64, userID int64) error {
	if taskID <= 0 {
		return errors.New("invalid task ID")
	}
	
	// Check if task exists and belongs to user
	existingTask, err := s.repo.GetByID(ctx, taskID)
	if err != nil {
		return err
	}
	if existingTask == nil {
		return errors.New("task not found")
	}
	if existingTask.UserID != userID {
		return errors.New("task not found")
	}
	
	return s.repo.Delete(ctx, taskID)
}