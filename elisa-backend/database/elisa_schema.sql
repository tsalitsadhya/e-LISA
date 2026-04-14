-- ============================================================
-- e-LISA (ICMS) - Database Schema for PostgreSQL
-- Integrated Cleaning and Maintenance Management System
-- ============================================================
-- Description:
--   Production readiness system combining:
--   1. Machine Readiness (Cleaning + e-AM monitoring)
--   2. Room Readiness (Temperature & RH from BMS database)
--   Output: Production Readiness (Line Clearance)
-- ============================================================

-- Enable UUID extension (optional, jika mau pakai UUID di masa depan)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE roles (
    roles_id    SERIAL PRIMARY KEY,
    roles_name  VARCHAR(50) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE roles IS 'Daftar role user: Administrator, Operator, QA Inspector';

-- Seed data
INSERT INTO roles (roles_name) VALUES
    ('Administrator'),
    ('Operator'),
    ('QA Inspector');

-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE users (
    users_id    SERIAL PRIMARY KEY,
    roles_id    INT NOT NULL REFERENCES roles(roles_id),
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    pass_hash   VARCHAR(255) NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_roles_id ON users(roles_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

COMMENT ON TABLE users IS 'Data user sistem: Operator, QA Inspector, Administrator';

-- ============================================================
-- 3. AREAS (Floors)
-- ============================================================
CREATE TABLE areas (
    areas_id    SERIAL PRIMARY KEY,
    areas_name  VARCHAR(100) NOT NULL,
    floor       INT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE areas IS 'Area/lantai produksi (Floor 1-4)';

-- ============================================================
-- 4. LINES (Production Lines - hanya Floor 1)
-- ============================================================
CREATE TABLE lines (
    lines_id    SERIAL PRIMARY KEY,
    areas_id    INT NOT NULL REFERENCES areas(areas_id),
    lines_name  VARCHAR(100) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lines_areas_id ON lines(areas_id);

COMMENT ON TABLE lines IS 'Production lines, hanya ada di Floor 1 (areas). Relasi 1:M dari Areas ke Lines';

-- ============================================================
-- 5. MACHINES
-- ============================================================
CREATE TABLE machines (
    machines_id     SERIAL PRIMARY KEY,
    lines_id        INT REFERENCES lines(lines_id),       -- nullable, karena mesin di floor 2-4 tidak punya line
    areas_id        INT NOT NULL REFERENCES areas(areas_id),
    machines_code   VARCHAR(50) NOT NULL UNIQUE,
    machines_name   VARCHAR(100) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_machines_lines_id ON machines(lines_id);
CREATE INDEX idx_machines_areas_id ON machines(areas_id);
CREATE INDEX idx_machines_is_active ON machines(is_active);

COMMENT ON TABLE machines IS 'Data mesin produksi. lines_id nullable karena mesin di Floor 2-4 tidak memiliki production line';
COMMENT ON COLUMN machines.machines_code IS 'Kode unik mesin, misal: K1R1P01DP001';

-- ============================================================
-- 6. CLEANING_MS (Cleaning Management Schedule)
-- ============================================================
CREATE TABLE cleaning_ms (
    cms_id          SERIAL PRIMARY KEY,
    date            DATE NOT NULL,
    machines_id     INT NOT NULL REFERENCES machines(machines_id),
    areas_id        INT NOT NULL REFERENCES areas(areas_id),
    type            VARCHAR(50) NOT NULL,                   -- 'routine' atau 'changeover'
    status          VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, completed, overdue
    frequency       VARCHAR(50) NOT NULL,                   -- 'daily', 'weekly', 'monthly', 'periodic'
    duration        INT,                                    -- durasi dalam menit
    users_id        INT REFERENCES users(users_id),         -- operator yang ditugaskan
    next_cleaning   DATE,
    last_cleaning   DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cms_machines_id ON cleaning_ms(machines_id);
CREATE INDEX idx_cms_areas_id ON cleaning_ms(areas_id);
CREATE INDEX idx_cms_status ON cleaning_ms(status);
CREATE INDEX idx_cms_next_cleaning ON cleaning_ms(next_cleaning);
CREATE INDEX idx_cms_date ON cleaning_ms(date);

COMMENT ON TABLE cleaning_ms IS 'Jadwal cleaning mesin. Menyimpan schedule, frekuensi, dan tracking next/last cleaning';
COMMENT ON COLUMN cleaning_ms.type IS 'Tipe cleaning: routine, changeover';
COMMENT ON COLUMN cleaning_ms.frequency IS 'Frekuensi: daily, weekly, monthly, periodic';

-- ============================================================
-- 7. CLEANING_RECORDS
-- ============================================================
CREATE TABLE cleaning_records (
    record_id       SERIAL PRIMARY KEY,
    date            DATE NOT NULL,
    machines_id     INT NOT NULL REFERENCES machines(machines_id),
    areas_id        INT NOT NULL REFERENCES areas(areas_id),
    cleaning_type   VARCHAR(50) NOT NULL,                   -- 'routine', 'changeover', 're-cleaning'
    status          VARCHAR(50) NOT NULL DEFAULT 'submitted', -- submitted, approved, declined, delayed
    user_id         INT NOT NULL REFERENCES users(users_id), -- operator yang submit
    times_start     TIME NOT NULL,
    times_end       TIME NOT NULL,
    duration        INT,                                     -- durasi dalam menit (bisa di-compute)
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cr_machines_id ON cleaning_records(machines_id);
CREATE INDEX idx_cr_areas_id ON cleaning_records(areas_id);
CREATE INDEX idx_cr_user_id ON cleaning_records(user_id);
CREATE INDEX idx_cr_status ON cleaning_records(status);
CREATE INDEX idx_cr_date ON cleaning_records(date);

COMMENT ON TABLE cleaning_records IS 'Record cleaning yang diinput operator setelah cleaning selesai';
COMMENT ON COLUMN cleaning_records.status IS 'Status: submitted (baru diinput), approved (QA approve), declined (QA tolak), delayed (outstanding, perlu re-cleaning)';
COMMENT ON COLUMN cleaning_records.cleaning_type IS 'Tipe: routine, changeover, re-cleaning';

-- ============================================================
-- 8. QA_VERIF (QA Verification)
-- ============================================================
CREATE TABLE qa_verif (
    verif_id        SERIAL PRIMARY KEY,
    record_id       INT NOT NULL REFERENCES cleaning_records(record_id), -- relasi ke cleaning record yang diverifikasi
    user_id         INT NOT NULL REFERENCES users(users_id),             -- QA Inspector yang verifikasi
    machine_id      INT NOT NULL REFERENCES machines(machines_id),
    floor           INT NOT NULL,
    date            DATE NOT NULL,
    notif_qa        VARCHAR(100),                                        -- status notifikasi ke QA
    form_feedback   TEXT,                                                -- feedback/corrective action dari QA
    status          VARCHAR(50) NOT NULL,                                -- 'approved', 'declined'
    verified_at     TIMESTAMPTZ,                                         -- waktu verifikasi dilakukan
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qav_record_id ON qa_verif(record_id);
CREATE INDEX idx_qav_user_id ON qa_verif(user_id);
CREATE INDEX idx_qav_machine_id ON qa_verif(machine_id);
CREATE INDEX idx_qav_status ON qa_verif(status);
CREATE INDEX idx_qav_date ON qa_verif(date);

COMMENT ON TABLE qa_verif IS 'Hasil verifikasi QA terhadap cleaning record. Jika declined, QA wajib isi form_feedback (corrective action)';
COMMENT ON COLUMN qa_verif.record_id IS 'FK ke cleaning_records yang diverifikasi';
COMMENT ON COLUMN qa_verif.form_feedback IS 'Corrective action / alasan penolakan dari QA';
COMMENT ON COLUMN qa_verif.verified_at IS 'Timestamp saat QA melakukan verifikasi (untuk hitung verification time lag)';

-- ============================================================
-- 9. SUHU_RH (Temperature & Relative Humidity dari BMS)
-- ============================================================
CREATE TABLE suhu_rh (
    tagname_id      SERIAL PRIMARY KEY,
    tag_name        VARCHAR(100) NOT NULL,                  -- identifier sensor dari BMS
    description     VARCHAR(255),                           -- deskripsi lokasi/sensor
    areas_id        INT REFERENCES areas(areas_id),         -- relasi ke area mana sensor ini berada
    timestamp_start TIMESTAMPTZ NOT NULL,                   -- waktu mulai pengukuran (periodik)
    timestamp_end   TIMESTAMPTZ NOT NULL,                   -- waktu akhir pengukuran
    suhu            DECIMAL(5,2),                           -- nilai suhu (°C)
    rh              DECIMAL(5,2),                           -- nilai relative humidity (%)
    status_level    VARCHAR(10),                            -- 'green', 'yellow', 'red' (diklasifikasi sistem)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suhu_rh_areas_id ON suhu_rh(areas_id);
CREATE INDEX idx_suhu_rh_timestamp ON suhu_rh(timestamp_start, timestamp_end);
CREATE INDEX idx_suhu_rh_status ON suhu_rh(status_level);
CREATE INDEX idx_suhu_rh_tag_name ON suhu_rh(tag_name);

COMMENT ON TABLE suhu_rh IS 'Data suhu & RH dari BMS database, di-fetch periodik. Diklasifikasi ke Green/Yellow/Red berdasarkan threshold';
COMMENT ON COLUMN suhu_rh.tag_name IS 'Identifier sensor dari BMS, misal: TEMP_FLOOR1_LINE_A';
COMMENT ON COLUMN suhu_rh.status_level IS 'Klasifikasi otomatis: green (normal), yellow (warning), red (critical)';
COMMENT ON COLUMN suhu_rh.areas_id IS 'FK ke areas, menunjukkan sensor ini di area/floor mana';

-- ============================================================
-- 10. REPORT
-- ============================================================
CREATE TABLE report (
    report_id       SERIAL PRIMARY KEY,
    report_name     VARCHAR(100) NOT NULL,
    report_type     VARCHAR(100) NOT NULL,                  -- 'cleaning_status', 'verification_status', 'production_readiness'
    floor           INT,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    generated_by    INT REFERENCES users(users_id),         -- user yang generate report
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_type ON report(report_type);
CREATE INDEX idx_report_dates ON report(start_date, end_date);

COMMENT ON TABLE report IS 'Metadata report yang di-generate sistem (cleaning status, verification status, dll)';

-- ============================================================
-- 11. AUDIT_LOGS (Audit Trail)
-- ============================================================
CREATE TABLE audit_logs (
    log_id          BIGSERIAL PRIMARY KEY,
    user_id         INT REFERENCES users(users_id),         -- user yang melakukan aksi (nullable untuk system action)
    action          VARCHAR(50) NOT NULL,                    -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'VERIFY'
    entity_type     VARCHAR(50) NOT NULL,                    -- 'cleaning_record', 'qa_verif', 'user', 'report', dll
    entity_id       INT,                                     -- ID dari entity yang terdampak
    old_value       JSONB,                                   -- nilai sebelum perubahan
    new_value       JSONB,                                   -- nilai setelah perubahan
    ip_address      INET,                                    -- IP address user
    user_agent      TEXT,                                     -- browser/device info
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_al_user_id ON audit_logs(user_id);
CREATE INDEX idx_al_action ON audit_logs(action);
CREATE INDEX idx_al_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_al_created_at ON audit_logs(created_at);

COMMENT ON TABLE audit_logs IS 'Audit trail: mencatat semua aktivitas user (siapa, action apa, kapan, data apa yang berubah)';
COMMENT ON COLUMN audit_logs.old_value IS 'Snapshot data sebelum perubahan (JSONB)';
COMMENT ON COLUMN audit_logs.new_value IS 'Snapshot data setelah perubahan (JSONB)';
COMMENT ON COLUMN audit_logs.entity_type IS 'Tabel/entity yang terdampak: cleaning_record, qa_verif, user, report, suhu_rh, machine';

-- ============================================================
-- 12. THRESHOLD CONFIGURATION (untuk klasifikasi Green/Yellow/Red)
-- ============================================================
CREATE TABLE threshold_config (
    threshold_id    SERIAL PRIMARY KEY,
    areas_id        INT NOT NULL REFERENCES areas(areas_id),
    parameter       VARCHAR(20) NOT NULL,                   -- 'suhu' atau 'rh'
    green_min       DECIMAL(5,2) NOT NULL,
    green_max       DECIMAL(5,2) NOT NULL,
    yellow_min      DECIMAL(5,2) NOT NULL,
    yellow_max      DECIMAL(5,2) NOT NULL,
    -- red = di luar range yellow
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(areas_id, parameter)
);

COMMENT ON TABLE threshold_config IS 'Konfigurasi threshold suhu & RH per area untuk klasifikasi Green/Yellow/Red. Red = di luar range Yellow';
COMMENT ON COLUMN threshold_config.parameter IS 'Parameter: suhu atau rh';

-- ============================================================
-- HELPER: Function untuk auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ke semua tabel yang punya updated_at
CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_areas_updated_at
    BEFORE UPDATE ON areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_lines_updated_at
    BEFORE UPDATE ON lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_machines_updated_at
    BEFORE UPDATE ON machines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cms_updated_at
    BEFORE UPDATE ON cleaning_ms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cr_updated_at
    BEFORE UPDATE ON cleaning_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_qav_updated_at
    BEFORE UPDATE ON qa_verif
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_threshold_updated_at
    BEFORE UPDATE ON threshold_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
