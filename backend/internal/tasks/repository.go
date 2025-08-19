package tasks

import (
	"context"
	"database/sql"
	"time"
)

// Repository defines the interface for task data persistence
type Repository interface {
	Create(ctx context.Context, userID int64, taskText string, endDate *time.Time, categoryID *int64) (*Task, error)
	GetByID(ctx context.Context, id int64) (*Task, error)
	Delete(ctx context.Context, id int64) error
}

// PostgresRepository implements Repository using PostgreSQL
type PostgresRepository struct {
	db *sql.DB
}

// NewPostgresRepository creates a new PostgreSQL repository
func NewPostgresRepository(db *sql.DB) Repository {
	return &PostgresRepository{db: db}
}

// Create creates a new task (defaults to "Not Started" state)
func (r *PostgresRepository) Create(ctx context.Context, userID int64, taskText string, endDate *time.Time, categoryID *int64) (*Task, error) {
	query := `
		INSERT INTO tasks (task_text, end_date, id_state, id_category, id_user) 
		VALUES ($1, $2, $3, $4, $5) 
		RETURNING id, task_text, creation_date, end_date, id_state, id_category, id_user`
	
	var task Task
	err := r.db.QueryRowContext(ctx, query, taskText, endDate, StateNotStarted, categoryID, userID).Scan(
		&task.ID, &task.TaskText, &task.CreationDate, &task.EndDate, &task.StateID, &task.CategoryID, &task.UserID,
	)
	if err != nil {
		return nil, err
	}
	
	return &task, nil
}

// GetByID retrieves a task by ID
func (r *PostgresRepository) GetByID(ctx context.Context, id int64) (*Task, error) {
	query := `SELECT id, task_text, creation_date, end_date, id_state, id_category, id_user FROM tasks WHERE id = $1`
	
	var task Task
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&task.ID, &task.TaskText, &task.CreationDate, &task.EndDate, &task.StateID, &task.CategoryID, &task.UserID,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	
	return &task, nil
}

// Delete removes a task by ID
func (r *PostgresRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM tasks WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	
	return nil
}