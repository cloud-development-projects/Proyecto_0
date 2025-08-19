package tasks

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

// Repository defines the interface for task data persistence
type Repository interface {
	Create(ctx context.Context, userID int64, taskText string, endDate *time.Time, categoryID *int64) (*Task, error)
	GetByID(ctx context.Context, id int64) (*Task, error)
	GetAllByUser(ctx context.Context, userID int64, categoryID *int64, stateID *int64) ([]*TaskResponse, error)
	GetByIDWithDetails(ctx context.Context, id int64) (*TaskResponse, error)
	Update(ctx context.Context, id int64, taskText string, endDate *time.Time, stateID *int64) (*Task, error)
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

// GetByIDWithDetails retrieves a task by ID with its related state and category information
func (r *PostgresRepository) GetByIDWithDetails(ctx context.Context, id int64) (*TaskResponse, error) {
	query := `
		SELECT 
			t.id, t.task_text, t.creation_date, t.end_date, t.id_user,
			s.id as state_id, s.description as state_description,
			c.id as category_id, c.name as category_name, c.description as category_description
		FROM tasks t
		LEFT JOIN states s ON t.id_state = s.id
		LEFT JOIN categories c ON t.id_category = c.id
		WHERE t.id = $1`
	
	var resp TaskResponse
	var stateID, categoryID sql.NullInt64
	var stateDesc, categoryName, categoryDesc sql.NullString
	
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&resp.ID, &resp.TaskText, &resp.CreationDate, &resp.EndDate, &resp.UserID,
		&stateID, &stateDesc,
		&categoryID, &categoryName, &categoryDesc,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	
	// Populate state info if available
	if stateID.Valid {
		resp.State = &StateInfo{
			ID:          stateID.Int64,
			Description: stateDesc.String,
		}
	}
	
	// Populate category info if available
	if categoryID.Valid {
		resp.Category = &CategoryInfo{
			ID:          categoryID.Int64,
			Name:        categoryName.String,
			Description: categoryDesc.String,
		}
	}
	
	return &resp, nil
}

// GetAllByUser retrieves all tasks for a user with optional filtering by category and state
func (r *PostgresRepository) GetAllByUser(ctx context.Context, userID int64, categoryID *int64, stateID *int64) ([]*TaskResponse, error) {
	query := `
		SELECT 
			t.id, t.task_text, t.creation_date, t.end_date, t.id_user,
			s.id as state_id, s.description as state_description,
			c.id as category_id, c.name as category_name, c.description as category_description
		FROM tasks t
		LEFT JOIN states s ON t.id_state = s.id
		LEFT JOIN categories c ON t.id_category = c.id
		WHERE t.id_user = $1`
	
	var args []interface{}
	args = append(args, userID)
	argIndex := 2
	
	// Add category filter if provided
	if categoryID != nil {
		query += fmt.Sprintf(" AND t.id_category = $%d", argIndex)
		args = append(args, *categoryID)
		argIndex++
	}
	
	// Add state filter if provided
	if stateID != nil {
		query += fmt.Sprintf(" AND t.id_state = $%d", argIndex)
		args = append(args, *stateID)
		argIndex++
	}
	
	query += " ORDER BY t.creation_date DESC"
	
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var tasks []*TaskResponse
	for rows.Next() {
		var resp TaskResponse
		var stateID, categoryID sql.NullInt64
		var stateDesc, categoryName, categoryDesc sql.NullString
		
		err := rows.Scan(
			&resp.ID, &resp.TaskText, &resp.CreationDate, &resp.EndDate, &resp.UserID,
			&stateID, &stateDesc,
			&categoryID, &categoryName, &categoryDesc,
		)
		if err != nil {
			return nil, err
		}
		
		// Populate state info if available
		if stateID.Valid {
			resp.State = &StateInfo{
				ID:          stateID.Int64,
				Description: stateDesc.String,
			}
		}
		
		// Populate category info if available
		if categoryID.Valid {
			resp.Category = &CategoryInfo{
				ID:          categoryID.Int64,
				Name:        categoryName.String,
				Description: categoryDesc.String,
			}
		}
		
		tasks = append(tasks, &resp)
	}
	
	return tasks, nil
}

// Update updates an existing task's text, end date, and state
func (r *PostgresRepository) Update(ctx context.Context, id int64, taskText string, endDate *time.Time, stateID *int64) (*Task, error) {
	query := `
		UPDATE tasks 
		SET task_text = $1, end_date = $2, id_state = $3 
		WHERE id = $4 
		RETURNING id, task_text, creation_date, end_date, id_state, id_category, id_user`
	
	var task Task
	err := r.db.QueryRowContext(ctx, query, taskText, endDate, stateID, id).Scan(
		&task.ID, &task.TaskText, &task.CreationDate, &task.EndDate, &task.StateID, &task.CategoryID, &task.UserID,
	)
	if err != nil {
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