package repository

import (
	"context"

	"github.com/bintangtoedjoe/elisa-backend/internal/model"
	"github.com/jmoiron/sqlx"
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindByUsername(ctx context.Context, username string) (*model.User, error) {
	var user model.User
	query := `
		SELECT u.id, u.username, u.full_name, u.password_hash,
		       u.role_id, ro.name AS role_name, u.area, u.is_active,
		       u.last_login, u.created_at, u.updated_at
		FROM users u
		JOIN roles ro ON ro.id = u.role_id
		WHERE LOWER(u.username) = LOWER($1) AND u.is_active = TRUE
	`
	if err := r.db.GetContext(ctx, &user, query, username); err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*model.User, error) {
	var user model.User
	query := `
		SELECT u.id, u.username, u.full_name, u.password_hash,
		       u.role_id, ro.name AS role_name, u.area, u.is_active,
		       u.last_login, u.created_at, u.updated_at
		FROM users u
		JOIN roles ro ON ro.id = u.role_id
		WHERE u.id = $1
	`
	if err := r.db.GetContext(ctx, &user, query, id); err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) UpdateLastLogin(ctx context.Context, userID string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE users SET last_login = NOW() WHERE id = $1`, userID)
	return err
}

func (r *UserRepository) UpdatePassword(ctx context.Context, userID, hashedPw string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
		hashedPw, userID)
	return err
}

func (r *UserRepository) ListAll(ctx context.Context) ([]model.User, error) {
	var users []model.User
	query := `
		SELECT u.id, u.username, u.full_name, u.password_hash,
		       u.role_id, ro.name AS role_name, u.area, u.is_active,
		       u.last_login, u.created_at, u.updated_at
		FROM users u
		JOIN roles ro ON ro.id = u.role_id
		ORDER BY ro.name, u.full_name
	`
	if err := r.db.SelectContext(ctx, &users, query); err != nil {
		return nil, err
	}
	return users, nil
}

func (r *UserRepository) ToggleActive(ctx context.Context, userID string, active bool) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2`, active, userID)
	return err
}
