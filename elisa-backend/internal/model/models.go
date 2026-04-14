package model

import (
	"time"

	"github.com/google/uuid"
)

// ─── Enums ────────────────────────────────────────────────────────────────────

type UserRole string
type MachineType string
type FloorRule string
type CleaningStatus string
type QADecision string
type RoomStatus string
type NotifType string
type AuditAction string

const (
	RoleAdmin      UserRole = "admin"
	RoleOperator   UserRole = "operator"
	RoleQA         UserRole = "qa"
	RoleSiteHead   UserRole = "site_head"
	RoleSupervisor UserRole = "supervisor"

	MachineRVS  MachineType = "RVS"
	MachineTOYO MachineType = "TOYO"
	MachineWB   MachineType = "WB"
	MachineK1R  MachineType = "K1R"
	MachineTS   MachineType = "TS"
	MachineDS   MachineType = "DS"
	MachineMF   MachineType = "MF"

	RuleRolling      FloorRule = "rolling"
	RuleHardDeadline FloorRule = "hard_deadline"

	StatusDraft     CleaningStatus = "draft"
	StatusSubmitted CleaningStatus = "submitted"
	StatusWaitingQA CleaningStatus = "waiting_qa"
	StatusApproved  CleaningStatus = "approved"
	StatusRejected  CleaningStatus = "rejected"

	QAApproved QADecision = "approved"
	QARejected QADecision = "rejected"

	RoomReady     RoomStatus = "ready"
	RoomWarning   RoomStatus = "warning"
	RoomOutOfSpec RoomStatus = "out_of_spec"
)

// ─── User ─────────────────────────────────────────────────────────────────────

type User struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	RoleID       int        `json:"role_id" db:"role_id"`
	RoleName     UserRole   `json:"role" db:"role_name"`
	FullName     string     `json:"full_name" db:"full_name"`
	Username     string     `json:"username" db:"username"`
	PasswordHash string     `json:"-" db:"password_hash"`
	Area         string     `json:"area" db:"area"`
	IsActive     bool       `json:"is_active" db:"is_active"`
	LastLogin    *time.Time `json:"last_login" db:"last_login"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}

type UserResponse struct {
	ID        uuid.UUID  `json:"id"`
	Role      UserRole   `json:"role"`
	FullName  string     `json:"full_name"`
	Username  string     `json:"username"`
	Area      string     `json:"area"`
	IsActive  bool       `json:"is_active"`
	LastLogin *time.Time `json:"last_login"`
	CreatedAt time.Time  `json:"created_at"`
}

// ─── User Requests ────────────────────────────────────────────────────────────

type CreateUserRequest struct {
	FullName string   `json:"full_name" binding:"required"`
	Username string   `json:"username" binding:"required"`
	Password string   `json:"password" binding:"required"`
	Role     UserRole `json:"role" binding:"required"`
	Area     string   `json:"area"`
}

type UpdateUserRequest struct {
	FullName string   `json:"full_name" binding:"required"`
	Role     UserRole `json:"role" binding:"required"`
	Area     string   `json:"area"`
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token     string       `json:"token"`
	ExpiresAt time.Time    `json:"expires_at"`
	User      UserResponse `json:"user"`
}

// ─── Area ─────────────────────────────────────────────────────────────────────

type Area struct {
	ID        int       `json:"id" db:"id"`
	AreaName  string    `json:"area_name" db:"area_name"`
	Floor     int       `json:"floor" db:"floor"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// ─── Floor Config ─────────────────────────────────────────────────────────────

type FloorConfig struct {
	ID               int        `json:"id" db:"id"`
	AreaID           int        `json:"area_id" db:"area_id"`
	AreaName         string     `json:"area_name" db:"area_name"`
	Floor            int        `json:"floor" db:"floor"`
	RuleType         FloorRule  `json:"rule_type" db:"rule_type"`
	WindowStartDays  int        `json:"window_start_days" db:"window_start_days"`
	WindowEndDays    int        `json:"window_end_days" db:"window_end_days"`
	OverdueAfterDays int        `json:"overdue_after_days" db:"overdue_after_days"`
	DueSoonFromDay   int        `json:"due_soon_from_day" db:"due_soon_from_day"`
	UpdatedBy        *uuid.UUID `json:"updated_by" db:"updated_by"`
	UpdatedAt        time.Time  `json:"updated_at" db:"updated_at"`
}

// ─── Machine ──────────────────────────────────────────────────────────────────

type Machine struct {
	ID          uuid.UUID     `json:"id" db:"id"`
	AreaID      int           `json:"area_id" db:"area_id"`
	AreaName    string        `json:"area_name" db:"area_name"`
	Floor       int           `json:"floor" db:"floor"`
	LineID      *int          `json:"line_id" db:"line_id"`
	LineName    *string       `json:"line_name" db:"line_name"`
	MachineCode string        `json:"machine_code" db:"machine_code"`
	MachineName string        `json:"machine_name" db:"machine_name"`
	MachineType MachineType   `json:"machine_type" db:"machine_type"`
	SubLabel    string        `json:"sub_label" db:"sub_label"`
	IsActive    bool          `json:"is_active" db:"is_active"`
	CreatedAt   time.Time     `json:"created_at" db:"created_at"`
	Parts       []MachinePart `json:"parts,omitempty"`
}

type MachinePart struct {
	ID        uuid.UUID `json:"id" db:"id"`
	MachineID uuid.UUID `json:"machine_id" db:"machine_id"`
	PartCode  string    `json:"part_code" db:"part_code"`
	PartName  string    `json:"part_name" db:"part_name"`
	Urutan    int       `json:"urutan" db:"urutan"`
	IsActive  bool      `json:"is_active" db:"is_active"`
}

// ─── Checklist ────────────────────────────────────────────────────────────────

type ChecklistStage struct {
	ID        int    `json:"id" db:"id"`
	StageName string `json:"stage_name" db:"stage_name"`
	Urutan    int    `json:"urutan" db:"urutan"`
	IsActive  bool   `json:"is_active" db:"is_active"`
}

type ChecklistPart struct {
	ID          uuid.UUID   `json:"id" db:"id"`
	StageID     int         `json:"stage_id" db:"stage_id"`
	StageName   string      `json:"stage_name" db:"stage_name"`
	PartName    string      `json:"part_name" db:"part_name"`
	MachineType MachineType `json:"machine_type" db:"machine_type"`
	Urutan      int         `json:"urutan" db:"urutan"`
	IsActive    bool        `json:"is_active" db:"is_active"`
}

// ─── Cleaning Record ──────────────────────────────────────────────────────────

type CleaningRecord struct {
	ID               uuid.UUID      `json:"id" db:"id"`
	MachineID        uuid.UUID      `json:"machine_id" db:"machine_id"`
	MachineName      string         `json:"machine_name" db:"machine_name"`
	MachineType      MachineType    `json:"machine_type" db:"machine_type"`
	AreaID           int            `json:"area_id" db:"area_id"`
	AreaName         string         `json:"area_name" db:"area_name"`
	OperatorID       uuid.UUID      `json:"operator_id" db:"operator_id"`
	OperatorName     string         `json:"operator_name" db:"operator_name"`
	CleaningDate     time.Time      `json:"cleaning_date" db:"cleaning_date"`
	CleaningType     string         `json:"cleaning_type" db:"cleaning_type"`
	ProdukSebelumnya string         `json:"produk_sebelumnya" db:"produk_sebelumnya"`
	ProdukSesudahnya string         `json:"produk_sesudahnya" db:"produk_sesudahnya"`
	WaktuMulai       *string        `json:"waktu_mulai" db:"waktu_mulai"`
	WaktuSelesai     *string        `json:"waktu_selesai" db:"waktu_selesai"`
	DurasiMenit      int            `json:"durasi_menit" db:"durasi_menit"`
	Status           CleaningStatus `json:"status" db:"status"`
	Catatan          string         `json:"catatan" db:"catatan"`
	TelegramSent     bool           `json:"telegram_sent" db:"telegram_sent"`
	SubmittedAt      *time.Time     `json:"submitted_at" db:"submitted_at"`
	CreatedAt        time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at" db:"updated_at"`
}

type CreateCleaningRequest struct {
	MachineID        string                 `json:"machine_id" binding:"required"`
	CleaningDate     string                 `json:"cleaning_date" binding:"required"`
	CleaningType     string                 `json:"cleaning_type"`
	ProdukSebelumnya string                 `json:"produk_sebelumnya"`
	ProdukSesudahnya string                 `json:"produk_sesudahnya"`
	WaktuMulai       string                 `json:"waktu_mulai"`
	WaktuSelesai     string                 `json:"waktu_selesai"`
	DurasiMenit      int                    `json:"durasi_menit"`
	Catatan          string                 `json:"catatan"`
	Items            []ChecklistItemRequest `json:"items"`
}

type ChecklistItemRequest struct {
	StageID       int    `json:"stage_id"`
	PartID        string `json:"part_id"`
	PartName      string `json:"part_name"`
	JamMulai      string `json:"jam_mulai"`
	JamSelesai    string `json:"jam_selesai"`
	DurasiMenit   int    `json:"durasi_menit"`
	IsChecked     bool   `json:"is_checked"`
	Keterangan    string `json:"keterangan"`
	Notes         string `json:"notes"`
	SignatureName string `json:"signature_name"`
}

// ─── QA Verification ─────────────────────────────────────────────────────────

type QAVerification struct {
	ID               uuid.UUID  `json:"id" db:"id"`
	RecordID         uuid.UUID  `json:"record_id" db:"record_id"`
	QAID             uuid.UUID  `json:"qa_id" db:"qa_id"`
	QAName           string     `json:"qa_name" db:"qa_name"`
	Decision         QADecision `json:"decision" db:"decision"`
	Remarks          string     `json:"remarks" db:"remarks"`
	CorrectiveAction string     `json:"corrective_action" db:"corrective_action"`
	ReportURL        string     `json:"report_url" db:"report_url"`
	IsDraft          bool       `json:"is_draft" db:"is_draft"`
	VerifiedAt       time.Time  `json:"verified_at" db:"verified_at"`
}

type QAVerifyRequest struct {
	Decision         string `json:"decision" binding:"required,oneof=approved rejected"`
	Remarks          string `json:"remarks"`
	CorrectiveAction string `json:"corrective_action"`
}

// ─── Cleaning Schedule ────────────────────────────────────────────────────────

type CleaningSchedule struct {
	ID              uuid.UUID   `json:"id" db:"id"`
	MachineID       uuid.UUID   `json:"machine_id" db:"machine_id"`
	MachineName     string      `json:"machine_name" db:"machine_name"`
	MachineType     MachineType `json:"machine_type" db:"machine_type"`
	MachineCode     string      `json:"machine_code" db:"machine_code"`
	AreaName        string      `json:"area_name" db:"area_name"`
	Floor           int         `json:"floor" db:"floor"`
	LineName        *string     `json:"line_name" db:"line_name"`
	LastCleaned     *time.Time  `json:"last_cleaned" db:"last_cleaned"`
	NextCleaning    *time.Time  `json:"next_cleaning" db:"next_cleaning"`
	Status          string      `json:"status"`           // computed: safe/due/overdue/waiting_qa/inprogress
	ChecklistStatus string      `json:"checklist_status"` // approved/pending/null
	LastRecordID    *uuid.UUID  `json:"last_record_id" db:"last_record_id"`
	UpdatedAt       time.Time   `json:"updated_at" db:"updated_at"`
}

// ─── Suhu RH ─────────────────────────────────────────────────────────────────

type SuhuRH struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	MachineID      *uuid.UUID `json:"machine_id" db:"machine_id"`
	LineID         *int       `json:"line_id" db:"line_id"`
	LineName       *string    `json:"line_name" db:"line_name"`
	Tagname        string     `json:"tagname" db:"tagname"`
	Description    string     `json:"description" db:"description"`
	TimestampStart *time.Time `json:"timestamp_start" db:"timestamp_start"`
	TimestampEnd   *time.Time `json:"timestamp_end" db:"timestamp_end"`
	Suhu           *float64   `json:"suhu" db:"suhu"`
	RH             *float64   `json:"rh" db:"rh"`
	Status         RoomStatus `json:"status" db:"status"`
	SyncedAt       time.Time  `json:"synced_at" db:"synced_at"`
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

type AuditLog struct {
	ID         uuid.UUID   `json:"id" db:"id"`
	UserID     *uuid.UUID  `json:"user_id" db:"user_id"`
	UserName   string      `json:"user_name" db:"user_name"`
	UserRole   UserRole    `json:"user_role" db:"user_role"`
	Action     AuditAction `json:"action" db:"action"`
	TargetType string      `json:"target_type" db:"target_type"`
	TargetID   string      `json:"target_id" db:"target_id"`
	OldValue   interface{} `json:"old_value" db:"old_value"`
	NewValue   interface{} `json:"new_value" db:"new_value"`
	IPAddress  string      `json:"ip_address" db:"ip_address"`
	CreatedAt  time.Time   `json:"created_at" db:"created_at"`
}

// ─── Common Response ──────────────────────────────────────────────────────────

type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type PaginatedResponse struct {
	Success    bool        `json:"success"`
	Data       interface{} `json:"data"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	PerPage    int         `json:"per_page"`
	TotalPages int         `json:"total_pages"`
}

func SuccessResponse(message string, data interface{}) Response {
	return Response{Success: true, Message: message, Data: data}
}

func ErrorResponse(message string) Response {
	return Response{Success: false, Message: message}
}
