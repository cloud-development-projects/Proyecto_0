package tasks

import "time"

type Task struct {
	ID                int        `json:"id" db:"id"`
	UserID            int        `json:"user_id" db:"user_id"`
	CategoryID        int        `json:"category_id" db:"category_id"`
	Text              string     `json:"text" db:"text"`
	Status            string     `json:"status" db:"status"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	CompletionDueDate *time.Time `json:"completion_due_date,omitempty" db:"completion_due_date"`
}
