package handler

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/bintangtoedjoe/elisa-backend/internal/model"
	"github.com/bintangtoedjoe/elisa-backend/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// GET /api/v1/users
func GetUsers(c *gin.Context) {
	ctx := context.Background()

	roleFilter := c.Query("role")
	search := c.Query("search")

	query := `
		SELECT u.id, u.role_id, r.name AS role_name, u.full_name, u.username,
		       u.area, u.is_active, u.last_login, u.created_at, u.updated_at
		FROM users u
		JOIN roles r ON r.id = u.role_id
		WHERE 1=1
	`
	args := []interface{}{}
	i := 1

	if roleFilter != "" {
		query += ` AND r.name = $` + strconv.Itoa(i)
		args = append(args, roleFilter)
		i++
	}
	if search != "" {
		query += ` AND (u.full_name ILIKE $` + strconv.Itoa(i) + ` OR u.username ILIKE $` + strconv.Itoa(i) + `)`
		args = append(args, "%"+search+"%")
		i++
	}

	query += ` ORDER BY r.name, u.full_name`

	rows, err := database.Pool.Query(ctx, query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal ambil data user"))
		return
	}
	defer rows.Close()

	var users []model.UserResponse
	for rows.Next() {
		var u model.User
		err := rows.Scan(
			&u.ID, &u.RoleID, &u.RoleName, &u.FullName, &u.Username,
			&u.Area, &u.IsActive, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt,
		)
		if err != nil {
			continue
		}
		users = append(users, model.UserResponse{
			ID:        u.ID,
			Role:      u.RoleName,
			FullName:  u.FullName,
			Username:  u.Username,
			Area:      u.Area,
			IsActive:  u.IsActive,
			LastLogin: u.LastLogin,
			CreatedAt: u.CreatedAt,
		})
	}

	if users == nil {
		users = []model.UserResponse{}
	}

	c.JSON(http.StatusOK, model.SuccessResponse("ok", users))
}

// GET /api/v1/users/:id
func GetUserByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("id tidak valid"))
		return
	}
	ctx := context.Background()

	var u model.User
	err = database.Pool.QueryRow(ctx, `
		SELECT u.id, u.role_id, r.name AS role_name, u.full_name, u.username,
		       u.area, u.is_active, u.last_login, u.created_at, u.updated_at
		FROM users u
		JOIN roles r ON r.id = u.role_id
		WHERE u.id = $1
	`, id).Scan(
		&u.ID, &u.RoleID, &u.RoleName, &u.FullName, &u.Username,
		&u.Area, &u.IsActive, &u.LastLogin, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		c.JSON(http.StatusNotFound, model.ErrorResponse("user tidak ditemukan"))
		return
	}

	c.JSON(http.StatusOK, model.SuccessResponse("ok", model.UserResponse{
		ID:        u.ID,
		Role:      u.RoleName,
		FullName:  u.FullName,
		Username:  u.Username,
		Area:      u.Area,
		IsActive:  u.IsActive,
		LastLogin: u.LastLogin,
		CreatedAt: u.CreatedAt,
	}))
}

// POST /api/v1/users
func CreateUser(c *gin.Context) {
	var req model.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse(err.Error()))
		return
	}

	req.Username = strings.TrimSpace(strings.ToLower(req.Username))

	ctx := context.Background()

	// Get role_id
	var roleID int
	err := database.Pool.QueryRow(ctx, `SELECT id FROM roles WHERE name = $1`, req.Role).Scan(&roleID)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("role tidak valid"))
		return
	}

	// Hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal hash password"))
		return
	}

	var newID uuid.UUID
	err = database.Pool.QueryRow(ctx, `
		INSERT INTO users (role_id, full_name, username, password_hash, area, is_active)
		VALUES ($1, $2, $3, $4, $5, TRUE)
		RETURNING id
	`, roleID, req.FullName, req.Username, string(hashed), req.Area).Scan(&newID)
	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			c.JSON(http.StatusConflict, model.ErrorResponse("username sudah digunakan"))
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal buat user"))
		return
	}

	// Audit
	adminID, _ := c.Get("user_id")
	if uid, ok := adminID.(uuid.UUID); ok {
		go logAudit(uid, "add_user", "user", newID.String(), c.ClientIP(), nil, gin.H{
			"username": req.Username, "role": req.Role,
		})
	}

	c.JSON(http.StatusCreated, model.SuccessResponse("user berhasil dibuat", gin.H{"id": newID}))
}

// PUT /api/v1/users/:id
func UpdateUser(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("id tidak valid"))
		return
	}

	var req model.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse(err.Error()))
		return
	}

	ctx := context.Background()

	// Get role_id
	var roleID int
	err = database.Pool.QueryRow(ctx, `SELECT id FROM roles WHERE name = $1`, req.Role).Scan(&roleID)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("role tidak valid"))
		return
	}

	_, err = database.Pool.Exec(ctx, `
		UPDATE users SET role_id=$1, full_name=$2, area=$3, updated_at=$4
		WHERE id=$5
	`, roleID, req.FullName, req.Area, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal update user"))
		return
	}

	// Audit
	adminID, _ := c.Get("user_id")
	if uid, ok := adminID.(uuid.UUID); ok {
		go logAudit(uid, "edit_user", "user", id.String(), c.ClientIP(), nil, gin.H{
			"full_name": req.FullName, "role": req.Role,
		})
	}

	c.JSON(http.StatusOK, model.SuccessResponse("user berhasil diupdate", nil))
}

// PATCH /api/v1/users/:id/toggle
func ToggleUserStatus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("id tidak valid"))
		return
	}

	ctx := context.Background()

	var currentStatus bool
	err = database.Pool.QueryRow(ctx, `SELECT is_active FROM users WHERE id=$1`, id).Scan(&currentStatus)
	if err != nil {
		c.JSON(http.StatusNotFound, model.ErrorResponse("user tidak ditemukan"))
		return
	}

	newStatus := !currentStatus
	_, err = database.Pool.Exec(ctx, `
		UPDATE users SET is_active=$1, updated_at=NOW() WHERE id=$2
	`, newStatus, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal update status"))
		return
	}

	// Audit
	adminID, _ := c.Get("user_id")
	if uid, ok := adminID.(uuid.UUID); ok {
		action := "edit_user"
		go logAudit(uid, action, "user", id.String(), c.ClientIP(),
			gin.H{"is_active": currentStatus},
			gin.H{"is_active": newStatus},
		)
	}

	status := "diaktifkan"
	if !newStatus {
		status = "dinonaktifkan"
	}
	c.JSON(http.StatusOK, model.SuccessResponse("user berhasil "+status, gin.H{"is_active": newStatus}))
}

