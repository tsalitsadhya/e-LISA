package handler

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/bintangtoedjoe/elisa-backend/internal/model"
	"github.com/bintangtoedjoe/elisa-backend/pkg/database"
	"github.com/bintangtoedjoe/elisa-backend/pkg/telegram"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GET /api/v1/cleaning/schedule
func GetCleaningSchedule(c *gin.Context) {
	ctx := context.Background()

	// Filter params
	areaID    := c.Query("area_id")
	machineType := c.Query("machine_type")
	statusFilter := c.Query("status")

	query := `
		SELECT
			cs.id, cs.machine_id, m.machine_name, m.machine_type, m.machine_code,
			a.area_name, a.floor, l.line_name,
			cs.last_cleaned, cs.next_cleaning, cs.last_record_id, cs.updated_at,
			fc.rule_type, fc.window_start_days, fc.window_end_days, fc.overdue_after_days,
			COALESCE(cr.status::text, '') AS last_record_status
		FROM cleaning_schedule cs
		JOIN machines m ON m.id = cs.machine_id
		JOIN areas a ON a.id = m.area_id
		LEFT JOIN lines l ON l.id = m.line_id
		LEFT JOIN floor_config fc ON fc.area_id = m.area_id
		LEFT JOIN cleaning_records cr ON cr.id = cs.last_record_id
		WHERE m.is_active = TRUE
	`
	args := []interface{}{}
	i := 1
	if areaID != "" {
		query += fmt.Sprintf(" AND m.area_id = $%d", i)
		args = append(args, areaID)
		i++
	}
	if machineType != "" {
		query += fmt.Sprintf(" AND m.machine_type = $%d", i)
		args = append(args, machineType)
		i++
	}
	query += " ORDER BY a.floor, m.machine_name"

	rows, err := database.Pool.Query(ctx, query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal ambil jadwal"))
		return
	}
	defer rows.Close()

	var schedules []model.CleaningSchedule
	today := time.Now().Truncate(24 * time.Hour)

	for rows.Next() {
		var s model.CleaningSchedule
		var ruleType string
		var windowStart, windowEnd, overdueAfter int
		var lastRecordStatus string

		err := rows.Scan(
			&s.ID, &s.MachineID, &s.MachineName, &s.MachineType, &s.MachineCode,
			&s.AreaName, &s.Floor, &s.LineName,
			&s.LastCleaned, &s.NextCleaning, &s.LastRecordID, &s.UpdatedAt,
			&ruleType, &windowStart, &windowEnd, &overdueAfter,
			&lastRecordStatus,
		)
		if err != nil {
			continue
		}

		// Compute status
		s.Status = computeCleaningStatus(s.LastCleaned, s.NextCleaning, lastRecordStatus, today, overdueAfter, windowStart)
		s.ChecklistStatus = computeChecklistStatus(lastRecordStatus)

		if statusFilter == "" || s.Status == statusFilter {
			schedules = append(schedules, s)
		}
	}

	c.JSON(http.StatusOK, model.SuccessResponse("ok", schedules))
}

func computeCleaningStatus(lastCleaned, nextCleaning *time.Time, lastRecordStatus string, today time.Time, overdueAfter, dueSoonFrom int) string {
	if lastRecordStatus == "waiting_qa" { return "waiting_qa" }
	if lastRecordStatus == "submitted"  { return "inprogress"  }

	if lastCleaned == nil { return "overdue" }

	daysSince := int(today.Sub(*lastCleaned).Hours() / 24)
	if daysSince > overdueAfter { return "overdue" }
	if daysSince >= dueSoonFrom  { return "due"     }
	return "safe"
}

func computeChecklistStatus(lastRecordStatus string) string {
	switch lastRecordStatus {
	case "approved":    return "approved"
	case "waiting_qa", "submitted": return "pending"
	default:            return ""
	}
}

// POST /api/v1/cleaning/records
func CreateCleaningRecord(c *gin.Context) {
	var req model.CreateCleaningRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse(err.Error()))
		return
	}

	operatorID := c.MustGet("user_id").(uuid.UUID)
	ctx := context.Background()

	machineID, err := uuid.Parse(req.MachineID)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("machine_id tidak valid"))
		return
	}

	// Get area_id from machine
	var areaID int
	database.Pool.QueryRow(ctx, `SELECT area_id FROM machines WHERE id=$1`, machineID).Scan(&areaID)

	cleaningDate, err := time.Parse("2006-01-02", req.CleaningDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("format tanggal tidak valid (YYYY-MM-DD)"))
		return
	}

	tx, err := database.Pool.Begin(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal mulai transaksi"))
		return
	}
	defer tx.Rollback(ctx)

	// nullableTime converts "" to nil so PostgreSQL TIME columns get NULL not a parse error
	nullableTime := func(s string) *string {
		if s == "" {
			return nil
		}
		return &s
	}

	// Insert cleaning record
	var recordID uuid.UUID
	now := time.Now()
	err = tx.QueryRow(ctx, `
		INSERT INTO cleaning_records
		  (machine_id, area_id, operator_id, cleaning_date, cleaning_type,
		   produk_sebelumnya, produk_sesudahnya, waktu_mulai, waktu_selesai,
		   durasi_menit, status, catatan, submitted_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'submitted',$11,$12)
		RETURNING id
	`, machineID, areaID, operatorID, cleaningDate, req.CleaningType,
		req.ProdukSebelumnya, req.ProdukSesudahnya, nullableTime(req.WaktuMulai), nullableTime(req.WaktuSelesai),
		req.DurasiMenit, req.Catatan, now).Scan(&recordID)
	if err != nil {
		log.Printf("[CreateCleaningRecord] insert error: %v", err)
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal simpan cleaning record: "+err.Error()))
		return
	}

	// Insert checklist items
	for _, item := range req.Items {
		var partID *uuid.UUID
		if item.PartID != "" {
			if pid, err := uuid.Parse(item.PartID); err == nil {
				partID = &pid
			}
		}
		var signatureTime *time.Time
		if item.IsChecked {
			signatureTime = &now
		}
		tx.Exec(ctx, `
			INSERT INTO checklist_items
			  (record_id, stage_id, part_id, part_name, jam_mulai, jam_selesai,
			   durasi_menit, is_checked, keterangan, notes, signature_name, signature_time)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
		`, recordID, item.StageID, partID, item.PartName, nullableTime(item.JamMulai), nullableTime(item.JamSelesai),
			item.DurasiMenit, item.IsChecked, item.Keterangan, item.Notes, item.SignatureName, signatureTime)
	}

	// Update cleaning schedule
	// Hitung next_cleaning berdasarkan floor_config
	var ruleType string
	var windowEnd int
	tx.QueryRow(ctx, `
		SELECT fc.rule_type, fc.window_end_days FROM floor_config fc
		JOIN areas a ON a.id = fc.area_id
		JOIN machines m ON m.area_id = a.id
		WHERE m.id = $1
	`, machineID).Scan(&ruleType, &windowEnd)

	nextCleaning := cleaningDate.AddDate(0, 0, windowEnd)
	tx.Exec(ctx, `
		UPDATE cleaning_schedule
		SET last_cleaned=$1, next_cleaning=$2, last_record_id=$3, updated_at=NOW()
		WHERE machine_id=$4
	`, cleaningDate, nextCleaning, recordID, machineID)

	if err := tx.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal commit"))
		return
	}

	// Audit log
	go logAudit(operatorID, "submit_cleaning", "cleaning_record", recordID.String(), c.ClientIP(), nil, nil)

	// Telegram notification to QA
	go func(recID uuid.UUID, opID uuid.UUID, machID uuid.UUID, cleanDate time.Time) {
		bgCtx := context.Background()

		// Fetch machine name, area name, and operator name
		var machineName, areaName, operatorName string
		database.Pool.QueryRow(bgCtx, `
			SELECT m.machine_name, a.area_name
			FROM machines m JOIN areas a ON a.id = m.area_id
			WHERE m.id = $1
		`, machID).Scan(&machineName, &areaName)
		database.Pool.QueryRow(bgCtx, `SELECT full_name FROM users WHERE id=$1`, opID).Scan(&operatorName)

		msg := fmt.Sprintf(
			"🧹 <b>Notifikasi Cleaning Selesai</b>\n\n"+
				"📋 <b>Record ID:</b> <code>%s</code>\n"+
				"🏭 <b>Mesin:</b> %s\n"+
				"📍 <b>Area:</b> %s\n"+
				"👤 <b>Operator:</b> %s\n"+
				"📅 <b>Tanggal Cleaning:</b> %s\n\n"+
				"⚠️ Mohon segera lakukan <b>swab test</b> untuk verifikasi kebersihan mesin.\n"+
				"Akses QA Verification di sistem e-LISA untuk menyelesaikan proses verifikasi.",
			recID.String(),
			machineName,
			areaName,
			operatorName,
			cleanDate.Format("02 Jan 2006"),
		)

		if err := telegram.SendMessage(msg); err != nil {
			log.Printf("[Telegram] failed to send notification for record %s: %v", recID, err)
			return
		}

		// Mark telegram_sent = true
		database.Pool.Exec(bgCtx, `UPDATE cleaning_records SET telegram_sent=TRUE WHERE id=$1`, recID)
		log.Printf("[Telegram] notification sent for record %s", recID)
	}(recordID, operatorID, machineID, cleaningDate)

	c.JSON(http.StatusCreated, model.SuccessResponse("cleaning record berhasil dibuat", gin.H{"record_id": recordID}))
}

// GET /api/v1/cleaning/records
func GetCleaningRecords(c *gin.Context) {
	ctx := context.Background()

	// Pagination
	page, perPage := 1, 20
	if p, err := strconv.Atoi(c.Query("page"));     err == nil && p > 0 { page    = p }
	if n, err := strconv.Atoi(c.Query("per_page")); err == nil && n > 0 { perPage = n }

	// Filters
	statusFilter := c.Query("status")   // approved|rejected|submitted|waiting_qa
	search        := c.Query("search")  // machine name
	areaID        := c.Query("area_id")
	month         := c.Query("month")   // "01".."12"

	query := `
		SELECT cr.id, cr.machine_id, m.machine_name, m.machine_type, cr.area_id, a.area_name,
		       cr.operator_id, u.full_name AS operator_name,
		       cr.cleaning_date, cr.cleaning_type, cr.produk_sebelumnya, cr.produk_sesudahnya,
		       cr.waktu_mulai::text, cr.waktu_selesai::text, cr.durasi_menit,
		       cr.status, cr.catatan, cr.telegram_sent, cr.submitted_at, cr.created_at, cr.updated_at
		FROM cleaning_records cr
		JOIN machines m ON m.id = cr.machine_id
		JOIN areas a ON a.id = cr.area_id
		JOIN users u ON u.id = cr.operator_id
		WHERE 1=1
	`
	args := []interface{}{}
	i := 1

	if statusFilter != "" {
		query += fmt.Sprintf(" AND cr.status = $%d", i)
		args = append(args, statusFilter)
		i++
	}
	if search != "" {
		query += fmt.Sprintf(" AND m.machine_name ILIKE $%d", i)
		args = append(args, "%"+search+"%")
		i++
	}
	if areaID != "" {
		query += fmt.Sprintf(" AND cr.area_id = $%d", i)
		args = append(args, areaID)
		i++
	}
	if month != "" {
		query += fmt.Sprintf(" AND TO_CHAR(cr.cleaning_date, 'MM') = $%d", i)
		args = append(args, month)
		i++
	}

	// Count total (wrap filtered query as subquery)
	var total int
	database.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM ("+query+") sub", args...).Scan(&total)

	query += fmt.Sprintf(" ORDER BY cr.cleaning_date DESC, cr.created_at DESC LIMIT $%d OFFSET $%d", i, i+1)
	args = append(args, perPage, (page-1)*perPage)

	rows, err := database.Pool.Query(ctx, query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal ambil records"))
		return
	}
	defer rows.Close()

	var records []model.CleaningRecord
	for rows.Next() {
		var r model.CleaningRecord
		rows.Scan(
			&r.ID, &r.MachineID, &r.MachineName, &r.MachineType, &r.AreaID, &r.AreaName,
			&r.OperatorID, &r.OperatorName,
			&r.CleaningDate, &r.CleaningType, &r.ProdukSebelumnya, &r.ProdukSesudahnya,
			&r.WaktuMulai, &r.WaktuSelesai, &r.DurasiMenit,
			&r.Status, &r.Catatan, &r.TelegramSent, &r.SubmittedAt, &r.CreatedAt, &r.UpdatedAt,
		)
		records = append(records, r)
	}
	if records == nil {
		records = []model.CleaningRecord{}
	}

	totalPages := (total + perPage - 1) / perPage
	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"data":        records,
		"total":       total,
		"page":        page,
		"per_page":    perPage,
		"total_pages": totalPages,
	})
}

// GET /api/v1/cleaning/records/:id
func GetCleaningRecordByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("id tidak valid"))
		return
	}
	ctx := context.Background()

	var r model.CleaningRecord
	err = database.Pool.QueryRow(ctx, `
		SELECT cr.id, cr.machine_id, m.machine_name, m.machine_type, cr.area_id, a.area_name,
		       cr.operator_id, u.full_name AS operator_name,
		       cr.cleaning_date, cr.cleaning_type, cr.produk_sebelumnya, cr.produk_sesudahnya,
		       cr.waktu_mulai::text, cr.waktu_selesai::text, cr.durasi_menit,
		       cr.status, cr.catatan, cr.telegram_sent, cr.submitted_at, cr.created_at, cr.updated_at
		FROM cleaning_records cr
		JOIN machines m ON m.id = cr.machine_id
		JOIN areas a ON a.id = cr.area_id
		JOIN users u ON u.id = cr.operator_id
		WHERE cr.id = $1
	`, id).Scan(
		&r.ID, &r.MachineID, &r.MachineName, &r.MachineType, &r.AreaID, &r.AreaName,
		&r.OperatorID, &r.OperatorName,
		&r.CleaningDate, &r.CleaningType, &r.ProdukSebelumnya, &r.ProdukSesudahnya,
		&r.WaktuMulai, &r.WaktuSelesai, &r.DurasiMenit,
		&r.Status, &r.Catatan, &r.TelegramSent, &r.SubmittedAt, &r.CreatedAt, &r.UpdatedAt,
	)
	if err != nil {
		c.JSON(http.StatusNotFound, model.ErrorResponse("record tidak ditemukan"))
		return
	}

	c.JSON(http.StatusOK, model.SuccessResponse("ok", r))
}

// POST /api/v1/cleaning/records/:id/verify (QA)
func VerifyCleaningRecord(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse("id tidak valid"))
		return
	}

	var req model.QAVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse(err.Error()))
		return
	}

	qaID := c.MustGet("user_id").(uuid.UUID)
	ctx  := context.Background()

	// Update status cleaning_record
	newStatus := "approved"
	if req.Decision == "rejected" {
		newStatus = "rejected"
	}

	_, err = database.Pool.Exec(ctx, `
		UPDATE cleaning_records SET status=$1, updated_at=NOW() WHERE id=$2
	`, newStatus, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal update status"))
		return
	}

	// Insert QA verification
	var verifyID uuid.UUID
	err = database.Pool.QueryRow(ctx, `
		INSERT INTO qa_verifications (record_id, qa_id, decision, remarks, corrective_action, is_draft)
		VALUES ($1,$2,$3,$4,$5,FALSE) RETURNING id
	`, id, qaID, req.Decision, req.Remarks, req.CorrectiveAction).Scan(&verifyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse("gagal simpan verifikasi"))
		return
	}

	// Audit
	action := model.AuditAction("qa_approve")
	if req.Decision == "rejected" {
		action = "qa_reject"
	}
	go logAudit(qaID, string(action), "cleaning_record", id.String(), c.ClientIP(), nil, gin.H{"decision": req.Decision})

	c.JSON(http.StatusOK, model.SuccessResponse("verifikasi berhasil", gin.H{
		"verify_id": verifyID,
		"decision":  req.Decision,
		"status":    newStatus,
	}))
}
