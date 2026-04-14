package handler

import (
	"context"
	"net/http"

	"github.com/bintangtoedjoe/elisa-backend/internal/model"
	"github.com/bintangtoedjoe/elisa-backend/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetMachines(c *gin.Context) {
	ctx := context.Background()
	areaID      := c.Query("area_id")
	machineType := c.Query("machine_type")
	isActive    := c.DefaultQuery("is_active", "true")

	query := `
		SELECT m.id, m.area_id, a.area_name, a.floor, m.line_id, l.line_name,
		       m.machine_code, m.machine_name, m.machine_type, m.sub_label, m.is_active, m.created_at
		FROM machines m
		JOIN areas a ON a.id = m.area_id
		LEFT JOIN lines l ON l.id = m.line_id
		WHERE m.is_active = $1
	`
	args := []interface{}{isActive == "true"}
	i := 2
	if areaID != "" {
		query += " AND m.area_id = $" + string(rune('0'+i))
		args = append(args, areaID); i++
	}
	if machineType != "" {
		query += " AND m.machine_type = $" + string(rune('0'+i))
		args = append(args, machineType)
	}
	query += " ORDER BY a.floor, m.machine_name"

	rows, err := database.Pool.Query(ctx, query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal ambil data mesin"))
		return
	}
	defer rows.Close()

	var machines []model.Machine
	for rows.Next() {
		var m model.Machine
		rows.Scan(&m.ID, &m.AreaID, &m.AreaName, &m.Floor, &m.LineID, &m.LineName,
			&m.MachineCode, &m.MachineName, &m.MachineType, &m.SubLabel, &m.IsActive, &m.CreatedAt)
		machines = append(machines, m)
	}
	c.JSON(http.StatusOK, model.SuccessResponse("ok", machines))
}

func GetMachineByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil { c.JSON(http.StatusBadRequest, model.ErrorResponse("id tidak valid")); return }
	ctx := context.Background()

	var m model.Machine
	err = database.Pool.QueryRow(ctx, `
		SELECT m.id, m.area_id, a.area_name, a.floor, m.line_id, l.line_name,
		       m.machine_code, m.machine_name, m.machine_type, m.sub_label, m.is_active, m.created_at
		FROM machines m JOIN areas a ON a.id=m.area_id LEFT JOIN lines l ON l.id=m.line_id
		WHERE m.id=$1
	`, id).Scan(&m.ID, &m.AreaID, &m.AreaName, &m.Floor, &m.LineID, &m.LineName,
		&m.MachineCode, &m.MachineName, &m.MachineType, &m.SubLabel, &m.IsActive, &m.CreatedAt)
	if err != nil { c.JSON(http.StatusNotFound, model.ErrorResponse("mesin tidak ditemukan")); return }

	// Load parts
	rows, _ := database.Pool.Query(ctx, `SELECT id, machine_id, part_code, part_name, urutan, is_active FROM machine_parts WHERE machine_id=$1 AND is_active=TRUE ORDER BY urutan`, id)
	defer rows.Close()
	for rows.Next() {
		var p model.MachinePart
		rows.Scan(&p.ID, &p.MachineID, &p.PartCode, &p.PartName, &p.Urutan, &p.IsActive)
		m.Parts = append(m.Parts, p)
	}

	c.JSON(http.StatusOK, model.SuccessResponse("ok", m))
}

func CreateMachine(c *gin.Context) {
	var req struct {
		AreaID      int    `json:"area_id" binding:"required"`
		LineID      *int   `json:"line_id"`
		MachineCode string `json:"machine_code" binding:"required"`
		MachineName string `json:"machine_name" binding:"required"`
		MachineType string `json:"machine_type" binding:"required"`
		SubLabel    string `json:"sub_label"`
		Parts       []struct {
			PartCode string `json:"part_code"`
			PartName string `json:"part_name"`
			Urutan   int    `json:"urutan"`
		} `json:"parts"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse(err.Error())); return
	}

	createdBy := c.MustGet("user_id").(uuid.UUID)
	ctx := context.Background()
	tx, _ := database.Pool.Begin(ctx)
	defer tx.Rollback(ctx)

	var machineID uuid.UUID
	err := tx.QueryRow(ctx, `
		INSERT INTO machines (area_id, line_id, machine_code, machine_name, machine_type, sub_label, created_by)
		VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id
	`, req.AreaID, req.LineID, req.MachineCode, req.MachineName, req.MachineType, req.SubLabel, createdBy).Scan(&machineID)
	if err != nil { c.JSON(http.StatusConflict, model.ErrorResponse("machine_code sudah digunakan")); return }

	for _, p := range req.Parts {
		tx.Exec(ctx, `INSERT INTO machine_parts (machine_id, part_code, part_name, urutan) VALUES ($1,$2,$3,$4)`,
			machineID, p.PartCode, p.PartName, p.Urutan)
	}

	// Init schedule
	tx.Exec(ctx, `INSERT INTO cleaning_schedule (machine_id) VALUES ($1)`, machineID)

	tx.Commit(ctx)
	go logAudit(createdBy, "add_machine", "machine", machineID.String(), c.ClientIP(), nil, req)
	c.JSON(http.StatusCreated, model.SuccessResponse("mesin berhasil ditambahkan", gin.H{"id": machineID}))
}

func UpdateMachine(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil { c.JSON(http.StatusBadRequest, model.ErrorResponse("id tidak valid")); return }

	var req struct {
		MachineName string `json:"machine_name"`
		SubLabel    string `json:"sub_label"`
		IsActive    *bool  `json:"is_active"`
	}
	c.ShouldBindJSON(&req)
	updatedBy := c.MustGet("user_id").(uuid.UUID)
	ctx := context.Background()

	database.Pool.Exec(ctx, `
		UPDATE machines SET machine_name=COALESCE(NULLIF($1,''), machine_name),
		sub_label=COALESCE(NULLIF($2,''), sub_label),
		is_active=COALESCE($3, is_active), updated_at=NOW() WHERE id=$4
	`, req.MachineName, req.SubLabel, req.IsActive, id)

	go logAudit(updatedBy, "edit_machine", "machine", id.String(), c.ClientIP(), nil, req)
	c.JSON(http.StatusOK, model.SuccessResponse("mesin berhasil diupdate", nil))
}

func DeleteMachine(c *gin.Context) {
	id, _ := uuid.Parse(c.Param("id"))
	deletedBy := c.MustGet("user_id").(uuid.UUID)
	ctx := context.Background()
	database.Pool.Exec(ctx, `UPDATE machines SET is_active=FALSE, updated_at=NOW() WHERE id=$1`, id)
	go logAudit(deletedBy, "delete_machine", "machine", id.String(), c.ClientIP(), nil, nil)
	c.JSON(http.StatusOK, model.SuccessResponse("mesin berhasil dinonaktifkan", nil))
}
