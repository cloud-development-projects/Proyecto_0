package categories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

// Repository defines the interface for category data operations
type Repository interface {
	Create(ctx context.Context, name, description string) (*Category, error)
	GetByID(ctx context.Context, id int64) (*Category, error)
	GetAll(ctx context.Context) ([]*Category, error)
	Update(ctx context.Context, id int64, name, description string) (*Category, error)
	Delete(ctx context.Context, id int64) error
	Exists(ctx context.Context, id int64) (bool, error)
}

// PostgresRepository implements Repository using PostgreSQL
type PostgresRepository struct {
	db *sql.DB
}

// NewPostgresRepository creates a new PostgreSQL categories repository
func NewPostgresRepository(db *sql.DB) *PostgresRepository {
	return &PostgresRepository{db: db}
}

// Create creates a new category
func (r *PostgresRepository) Create(ctx context.Context, name, description string) (*Category, error) {
	query := `
		INSERT INTO categories (name, description) 
		VALUES ($1, $2) 
		RETURNING id, name, description`
	
	var category Category
	err := r.db.QueryRowContext(ctx, query, name, description).Scan(
		&category.ID, &category.Name, &category.Description,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create category: %w", err)
	}
	
	return &category, nil
}

// GetByID retrieves a category by its ID
func (r *PostgresRepository) GetByID(ctx context.Context, id int64) (*Category, error) {
	query := `SELECT id, name, description FROM categories WHERE id = $1`
	
	var category Category
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&category.ID, &category.Name, &category.Description,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("category not found")
		}
		return nil, fmt.Errorf("failed to get category: %w", err)
	}
	
	return &category, nil
}

// GetAll retrieves all categories
func (r *PostgresRepository) GetAll(ctx context.Context) ([]*Category, error) {
	query := `SELECT id, name, description FROM categories ORDER BY name`
	
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}
	defer rows.Close()
	
	var categories []*Category
	for rows.Next() {
		var category Category
		err := rows.Scan(&category.ID, &category.Name, &category.Description)
		if err != nil {
			return nil, fmt.Errorf("failed to scan category: %w", err)
		}
		categories = append(categories, &category)
	}
	
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating categories: %w", err)
	}
	
	return categories, nil
}

// Update updates an existing category
func (r *PostgresRepository) Update(ctx context.Context, id int64, name, description string) (*Category, error) {
	query := `
		UPDATE categories 
		SET name = $2, description = $3 
		WHERE id = $1 
		RETURNING id, name, description`
	
	var category Category
	err := r.db.QueryRowContext(ctx, query, id, name, description).Scan(
		&category.ID, &category.Name, &category.Description,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("category not found")
		}
		return nil, fmt.Errorf("failed to update category: %w", err)
	}
	
	return &category, nil
}

// Delete removes a category by ID
func (r *PostgresRepository) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM categories WHERE id = $1`
	
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	
	if rowsAffected == 0 {
		return errors.New("category not found")
	}
	
	return nil
}

// Exists checks if a category exists by ID
func (r *PostgresRepository) Exists(ctx context.Context, id int64) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM categories WHERE id = $1)`
	
	var exists bool
	err := r.db.QueryRowContext(ctx, query, id).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check category existence: %w", err)
	}
	
	return exists, nil
}