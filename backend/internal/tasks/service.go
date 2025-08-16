package tasks

import "errors"

type Service struct {
	repo Repository
}

func NewService(r Repository) *Service {
	return &Service{repo: r}
}

func (s *Service) CreateTask(t *Task) error {
	if t.Text == "" {
		return errors.New("text is required")
	}
	return s.repo.Create(t)
}

func (s *Service) GetTask(id int) (*Task, error) {
	return s.repo.GetByID(id)
}

func (s *Service) ListTasks(userID int, categoryID *int, status *string) ([]*Task, error) {
	return s.repo.GetAll(userID, categoryID, status)
}

func (s *Service) UpdateTask(t *Task) error {
	return s.repo.Update(t)
}

func (s *Service) DeleteTask(id int) error {
	return s.repo.Delete(id)
}
