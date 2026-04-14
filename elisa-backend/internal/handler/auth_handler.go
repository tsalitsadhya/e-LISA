package handler

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/bintangtoedjoe/elisa-backend/internal/auth"
	"github.com/bintangtoedjoe/elisa-backend/internal/model"
	"github.com/bintangtoedjoe/elisa-backend/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// POST /api/v1/auth/login
func Login(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("invalid request body"))
		return
	}

	req.Username = strings.TrimSpace(strings.ToLower(req.Username))

	ctx := context.Background()
	var user model.User
	err := database.Pool.QueryRow(ctx, `
		SELECT u.id, u.role_id, r.name AS role_name, u.full_name, u.username,
		       u.password_hash, u.area, u.is_active, u.last_login, u.created_at, u.updated_at
		FROM users u
		JOIN roles r ON r.id = u.role_id
		WHERE u.username = $1 AND u.is_active = TRUE
	`, req.Username).Scan(
		&user.ID, &user.RoleID, &user.RoleName, &user.FullName,
		&user.Username, &user.PasswordHash, &user.Area, &user.IsActive,
		&user.LastLogin, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse("username atau password salah"))
		return
	}

	// Cek password: bcrypt jika hash, plain jika belum di-hash
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		// fallback: plain text comparison (untuk user yang belum di-hash)
		if user.PasswordHash != req.Password {
			c.JSON(http.StatusUnauthorized, model.ErrorResponse("username atau password salah"))
			return
		}
		// Auto-upgrade plain text ke bcrypt
		hashed, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		database.Pool.Exec(ctx, `UPDATE users SET password_hash=$1 WHERE id=$2`, string(hashed), user.ID)
	}

	// Update last_login
	now := time.Now()
	database.Pool.Exec(ctx, `UPDATE users SET last_login=$1 WHERE id=$2`, now, user.ID)

	// Generate JWT
	token, expiresAt, err := auth.GenerateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal generate token"))
		return
	}

	// Audit log
	go logAudit(user.ID, "login", "user", user.ID.String(), c.ClientIP(), nil, nil)

	c.JSON(http.StatusOK, model.SuccessResponse("login berhasil", model.LoginResponse{
		Token:     token,
		ExpiresAt: expiresAt,
		User: model.UserResponse{
			ID:        user.ID,
			Role:      user.RoleName,
			FullName:  user.FullName,
			Username:  user.Username,
			Area:      user.Area,
			IsActive:  user.IsActive,
			LastLogin: &now,
			CreatedAt: user.CreatedAt,
		},
	}))
}

// POST /api/v1/auth/logout
func Logout(c *gin.Context) {
	userID, _ := c.Get("user_id")
	if uid, ok := userID.(uuid.UUID); ok {
		go logAudit(uid, "logout", "user", uid.String(), c.ClientIP(), nil, nil)
	}
	c.JSON(http.StatusOK, model.SuccessResponse("logout berhasil", nil))
}

// GET /api/v1/auth/me
func Me(c *gin.Context) {
	userID := c.MustGet("user_id").(uuid.UUID)
	ctx := context.Background()

	var user model.UserResponse
	err := database.Pool.QueryRow(ctx, `
		SELECT u.id, r.name AS role, u.full_name, u.username, u.area, u.is_active, u.last_login, u.created_at
		FROM users u JOIN roles r ON r.id = u.role_id
		WHERE u.id = $1
	`, userID).Scan(&user.ID, &user.Role, &user.FullName, &user.Username, &user.Area, &user.IsActive, &user.LastLogin, &user.CreatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, model.ErrorResponse("user tidak ditemukan"))
		return
	}

	c.JSON(http.StatusOK, model.SuccessResponse("ok", user))
}

// Helper: fire-and-forget audit log
func logAudit(userID uuid.UUID, action, targetType, targetID, ip string, oldVal, newVal interface{}) {
	ctx := context.Background()
	database.Pool.Exec(ctx, `
		INSERT INTO audit_logs (user_id, action, target_type, target_id, old_value, new_value, ip_address)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, userID, action, targetType, targetID, oldVal, newVal, ip)
}
