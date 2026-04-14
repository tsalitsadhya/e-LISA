package handler

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/bintangtoedjoe/elisa-backend/internal/model"
	"github.com/bintangtoedjoe/elisa-backend/pkg/database"
	"github.com/gin-gonic/gin"
)

// GET /api/v1/audit-logs
func GetAuditLogs(c *gin.Context) {
	ctx := context.Background()

	page, perPage := 1, 20
	if p, err := strconv.Atoi(c.Query("page"));     err == nil && p > 0 { page    = p }
	if n, err := strconv.Atoi(c.Query("per_page")); err == nil && n > 0 { perPage = n }

	action   := c.Query("action")
	role     := c.Query("role")
	search   := c.Query("search") // user name
	dateFrom := c.Query("date_from") // YYYY-MM-DD
	dateTo   := c.Query("date_to")   // YYYY-MM-DD

	query := `
		SELECT
			al.id, al.user_id, COALESCE(u.full_name, 'System') AS user_name,
			COALESCE(r.name::text, 'system') AS user_role,
			al.action, al.target_type, al.target_id,
			al.ip_address, al.created_at
		FROM audit_logs al
		LEFT JOIN users u ON u.id = al.user_id
		LEFT JOIN roles r ON r.id = u.role_id
		WHERE 1=1
	`
	args := []interface{}{}
	i := 1

	if action != "" {
		query += fmt.Sprintf(" AND al.action = $%d", i)
		args = append(args, action)
		i++
	}
	if role != "" {
		query += fmt.Sprintf(" AND r.name = $%d", i)
		args = append(args, role)
		i++
	}
	if search != "" {
		query += fmt.Sprintf(" AND u.full_name ILIKE $%d", i)
		args = append(args, "%"+search+"%")
		i++
	}
	if dateFrom != "" {
		query += fmt.Sprintf(" AND al.created_at >= $%d", i)
		args = append(args, dateFrom)
		i++
	}
	if dateTo != "" {
		query += fmt.Sprintf(" AND al.created_at < ($%d::date + INTERVAL '1 day')", i)
		args = append(args, dateTo)
		i++
	}

	// Count
	var total int
	database.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM ("+query+") sub", args...).Scan(&total)

	query += fmt.Sprintf(" ORDER BY al.created_at DESC LIMIT $%d OFFSET $%d", i, i+1)
	args = append(args, perPage, (page-1)*perPage)

	rows, err := database.Pool.Query(ctx, query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal ambil audit logs"))
		return
	}
	defer rows.Close()

	type AuditRow struct {
		ID         string     `json:"id"`
		UserID     *string    `json:"user_id"`
		UserName   string     `json:"user_name"`
		UserRole   string     `json:"user_role"`
		Action     string     `json:"action"`
		TargetType string     `json:"target_type"`
		TargetID   string     `json:"target_id"`
		IPAddress  string     `json:"ip_address"`
		CreatedAt  time.Time  `json:"created_at"`
	}

	var logs []AuditRow
	for rows.Next() {
		var l AuditRow
		rows.Scan(
			&l.ID, &l.UserID, &l.UserName, &l.UserRole,
			&l.Action, &l.TargetType, &l.TargetID,
			&l.IPAddress, &l.CreatedAt,
		)
		logs = append(logs, l)
	}
	if logs == nil {
		logs = []AuditRow{}
	}

	totalPages := (total + perPage - 1) / perPage
	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"data":        logs,
		"total":       total,
		"page":        page,
		"per_page":    perPage,
		"total_pages": totalPages,
	})
}
