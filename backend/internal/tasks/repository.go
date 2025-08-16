package task

import (
	"database/sql"
	"errors"
	"time"
)

type Repository interface {
	Create(t *Task) error
	GetByID(id int) (*Task, error)
	GetAll(userID int, categoryID *int, status *string) ([]*Task, error)
	Update(t *Task) error
	Delete(id int) error
}

// ==========================
// InMemory Repository
// ==========================
type InMemoryRepository struct {
	data map[int]*Task
	last int
}

func NewInMemoryRepository() *InMemoryRepository {
	return &InMemoryRepository{data: make(map[int]*Task)}
}

func (r *InMemoryRepository) Create(t *Task) error {
	r.last++
	t.ID = r.last
	t.CreatedAt = time.Now()
	if t.Status == "" {
		t.Status = "Sin Empezar"
	}
	r.data[t.ID] = t
	return nil
}

func (r *InMemoryRepository) GetByID(id int) (*Task, error) {
	if task, ok := r.data[id]; ok {
		return task, nil
	}
	return nil, errors.New("task not found")
}

func (r *InMemoryRepository) GetAll(userID int, categoryID *int, status *string) ([]*Task, error) {
	var result []*Task
	for _, t := range r.data {
		if t.UserID != userID {
			continue
		}
		if categoryID != nil && t.CategoryID != *categoryID {
			continue
		}
		if status != nil && t.Status != *status {
			continue
		}
		result = append(result, t)
	}
	return result, nil
}

func (r *InMemoryRepository) Update(t *Task) error {
	if _, ok := r.data[t.ID]; !ok {
		return errors.New("task not found")
	}
	r.data[t.ID] = t
	return nil
}

func (r *InMemoryRepository) Delete(id int) error {
	delete(r.data, id)
	return nil
}

// ==========================
// Postgres Repository
// ==========================
type PostgresRepository struct {
	DB *sql.DB
}

func NewPostgresRepository(db *sql.DB) *PostgresRepository {
	return &PostgresRepository{DB: db}
}

func (r *PostgresRepository) Create(t *Task) error {
	query := `
		INSERT INTO tareas (usuario_id, categoria_id, texto, estado, fecha_creacion, fecha_finalizacion)
		VALUES ($1, $2, $3, COALESCE($4, 'Sin Empezar'), NOW(), $5)
		RETURNING id, fecha_creacion
	`
	return r.DB.QueryRow(query, t.UserID, t.CategoryID, t.Text, t.Status, t.CompletionDueDate).
		Scan(&t.ID, &t.CreatedAt)
}

func (r *PostgresRepository) GetByID(id int) (*Task, error) {
	query := `SELECT id, usuario_id, categoria_id, texto, estado, fecha_creacion, fecha_finalizacion FROM tareas WHERE id=$1`
	t := &Task{}
	err := r.DB.QueryRow(query, id).Scan(&t.ID, &t.UserID, &t.CategoryID, &t.Text, &t.Status, &t.CreatedAt, &t.CompletionDueDate)
	if err != nil {
		return nil, err
	}
	return t, nil
}

func (r *PostgresRepository) GetAll(userID int, categoryID *int, status *string) ([]*Task, error) {
	query := `SELECT id, usuario_id, categoria_id, texto, estado, fecha_creacion, fecha_finalizacion FROM tareas WHERE usuario_id=$1`
	args := []interface{}{userID}

	if categoryID != nil {
		query += " AND categoria_id=$2"
		args = append(args, *categoryID)
	}
	if status != nil {
		query += " AND estado=$3"
		args = append(args, *status)
	}

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []*Task
	for rows.Next() {
		t := &Task{}
		err := rows.Scan(&t.ID, &t.UserID, &t.CategoryID, &t.Text, &t.Status, &t.CreatedAt, &t.CompletionDueDate)
		if err != nil {
			return nil, err
		}
		result = append(result, t)
	}
	return result, nil
}

func (r *PostgresRepository) Update(t *Task) error {
	query := `
		UPDATE tareas SET texto=$1, estado=$2, fecha_finalizacion=$3
		WHERE id=$4
	`
	_, err := r.DB.Exec(query, t.Text, t.Status, t.CompletionDueDate, t.ID)
	return err
}

func (r *PostgresRepository) Delete(id int) error {
	_, err := r.DB.Exec("DELETE FROM tareas WHERE id=$1", id)
	return err
}
