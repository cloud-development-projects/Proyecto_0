package tasks

import (
	"time"
)

// Task represents a task in the system
type Task struct {
	ID           int64      `json:"id" db:"id"`
	TaskText     string     `json:"task_text" db:"task_text"`
	CreationDate time.Time  `json:"creation_date" db:"creation_date"`
	EndDate      *time.Time `json:"end_date" db:"end_date"`
	StateID      *int64     `json:"state_id" db:"id_state"`
	CategoryID   *int64     `json:"category_id" db:"id_category"`
	UserID       int64      `json:"user_id" db:"id_user"`
}

// CreateTaskRequest represents the request payload for creating a task
type CreateTaskRequest struct {
	TaskText   string `json:"task_text" binding:"required,min=1,max=1000"`
	EndDate    string `json:"end_date,omitempty"` // Optional, format: "2006-01-02"
	CategoryID *int64 `json:"category_id,omitempty"`
}

// TaskResponse represents the response format for task data with related information
type TaskResponse struct {
	ID           int64             `json:"id"`
	TaskText     string            `json:"task_text"`
	CreationDate time.Time         `json:"creation_date"`
	EndDate      *time.Time        `json:"end_date"`
	State        *StateInfo        `json:"state"`
	Category     *CategoryInfo     `json:"category"`
	UserID       int64             `json:"user_id"`
}

// StateInfo represents basic state information
type StateInfo struct {
	ID          int64  `json:"id"`
	Description string `json:"description"`
}

// CategoryInfo represents basic category information  
type CategoryInfo struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

// TaskState constants
const (
	StateNotStarted = int64(1) // 'Not Started'
	StateInProgress = int64(2) // 'In Progress'
	StateCompleted  = int64(3) // 'Completed'
)

// ToResponse converts a Task to TaskResponse
func (t *Task) ToResponse() TaskResponse {
	return TaskResponse{
		ID:           t.ID,
		TaskText:     t.TaskText,
		CreationDate: t.CreationDate,
		EndDate:      t.EndDate,
		UserID:       t.UserID,
		// State and Category will be populated separately when fetching related data
	}
}

// IsValidState checks if the provided state ID is valid
func IsValidState(stateID int64) bool {
	return stateID == StateNotStarted || stateID == StateInProgress || stateID == StateCompleted
}

// GetStateName returns the English name for a state ID
func GetStateName(stateID int64) string {
	switch stateID {
	case StateNotStarted:
		return "Not Started"
	case StateInProgress:
		return "In Progress"
	case StateCompleted:
		return "Completed"
	default:
		return "Unknown"
	}
}