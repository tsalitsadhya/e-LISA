-- ============================================================
-- e-LISA Database Schema
-- PT. Bintang Toedjoe (A Kalbe Company)
-- Migration: 01_init_schema.sql
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENUM Types ───────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('admin', 'operator', 'qa', 'site_head', 'supervisor');
CREATE TYPE machine_type AS ENUM ('RVS', 'TOYO', 'WB', 'K1R', 'TS', 'DS', 'MF');
CREATE TYPE floor_rule AS ENUM ('rolling', 'hard_deadline');
CREATE TYPE cleaning_status AS ENUM ('draft', 'submitted', 'waiting_qa', 'approved', 'rejected');
CREATE TYPE qa_decision AS ENUM ('approved', 'rejected');
CREATE TYPE room_status AS ENUM ('ready', 'warning', 'out_of_spec');
CREATE TYPE notif_type AS ENUM ('cleaning_submitted', 'qa_approved', 'qa_rejected', 'room_warning', 'room_approved');
CREATE TYPE audit_action AS ENUM (
  'login', 'logout',
  'submit_cleaning', 'edit_cleaning',
  'qa_approve', 'qa_reject',
  'generate_report',
  'add_machine', 'edit_machine', 'delete_machine',
  'add_part', 'edit_part', 'delete_part',
  'edit_floor_config',
  'add_user', 'edit_user', 'deactivate_user',
  'room_approved', 'room_call_maintenance',
  'telegram_sent'
);

-- ─── Roles ────────────────────────────────────────────────────────────────────
CREATE TABLE roles (
  id         SERIAL PRIMARY KEY,
  name       user_role UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (name) VALUES ('admin'), ('operator'), ('qa'), ('site_head'), ('supervisor');

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id       INTEGER NOT NULL REFERENCES roles(id),
  full_name     VARCHAR(150) NOT NULL,
  username      VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  area          VARCHAR(100),          -- Filling / Compounding / Packaging / Weighing
  is_active     BOOLEAN DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Areas (Lantai / Zona) ────────────────────────────────────────────────────
CREATE TABLE areas (
  id         SERIAL PRIMARY KEY,
  area_name  VARCHAR(100) NOT NULL,
  floor      INTEGER NOT NULL CHECK (floor BETWEEN 1 AND 4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO areas (area_name, floor) VALUES
  ('Filling - Lantai 1',        1),
  ('Compounding - Lantai 2',    2),
  ('Compounding - Lantai 3',    3),
  ('Compounding - Lantai 4',    4);

-- ─── Floor Config (aturan cleaning per lantai) ───────────────────────────────
CREATE TABLE floor_config (
  id                  SERIAL PRIMARY KEY,
  area_id             INTEGER NOT NULL REFERENCES areas(id),
  rule_type           floor_rule NOT NULL DEFAULT 'hard_deadline',
  window_start_days   INTEGER NOT NULL DEFAULT 30,
  window_end_days     INTEGER NOT NULL DEFAULT 35,
  overdue_after_days  INTEGER NOT NULL DEFAULT 35,
  due_soon_from_day   INTEGER NOT NULL DEFAULT 5,
  updated_by          UUID REFERENCES users(id),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Lantai 1: rolling 35 hari
INSERT INTO floor_config (area_id, rule_type, window_start_days, window_end_days, overdue_after_days, due_soon_from_day)
VALUES (1, 'rolling', 30, 35, 35, 30);
-- Lantai 2/3/4: hard deadline 7 hari
INSERT INTO floor_config (area_id, rule_type, window_start_days, window_end_days, overdue_after_days, due_soon_from_day)
VALUES (2, 'hard_deadline', 5, 7, 7, 5);
INSERT INTO floor_config (area_id, rule_type, window_start_days, window_end_days, overdue_after_days, due_soon_from_day)
VALUES (3, 'hard_deadline', 5, 7, 7, 5);
INSERT INTO floor_config (area_id, rule_type, window_start_days, window_end_days, overdue_after_days, due_soon_from_day)
VALUES (4, 'hard_deadline', 5, 7, 7, 5);

-- ─── Lines (khusus lantai 1) ──────────────────────────────────────────────────
CREATE TABLE lines (
  id         SERIAL PRIMARY KEY,
  area_id    INTEGER NOT NULL REFERENCES areas(id),
  line_name  VARCHAR(50) NOT NULL,    -- 'Line A', 'Line B', dst
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO lines (area_id, line_name) VALUES
  (1,'Line A'),(1,'Line B'),(1,'Line C'),(1,'Line D'),(1,'Line E'),
  (1,'Line F'),(1,'Line G'),(1,'Line H'),(1,'Line J'),(1,'Line K'),
  (1,'Line L'),(1,'Line M'),(1,'Line N'),(1,'Line S'),(1,'Line T'),(1,'Line P');

-- ─── Machines ─────────────────────────────────────────────────────────────────
CREATE TABLE machines (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id       INTEGER NOT NULL REFERENCES areas(id),
  line_id       INTEGER REFERENCES lines(id),   -- nullable (Lt 2/3/4 tidak pakai lines)
  machine_code  VARCHAR(50) UNIQUE NOT NULL,
  machine_name  VARCHAR(100) NOT NULL,
  machine_type  machine_type NOT NULL,
  sub_label     VARCHAR(100),
  is_active     BOOLEAN DEFAULT TRUE,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Machine Parts (jalur — khusus Lt 2/3/4) ─────────────────────────────────
CREATE TABLE machine_parts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id  UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  part_code   VARCHAR(100) NOT NULL,
  part_name   VARCHAR(100) NOT NULL,
  urutan      INTEGER DEFAULT 1,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Checklist Stages ─────────────────────────────────────────────────────────
CREATE TABLE checklist_stages (
  id          SERIAL PRIMARY KEY,
  stage_name  VARCHAR(100) NOT NULL,
  urutan      INTEGER NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE
);

INSERT INTO checklist_stages (stage_name, urutan) VALUES
  ('Pembongkaran',            1),
  ('Pencucian',               2),
  ('Pengeringan',             3),
  ('Pembersihan bagian lain', 4),
  ('Swab Test',               5),
  ('Pemasangan',              6),
  ('Pengencangan baut/klem',  7);

-- ─── Checklist Parts (template item per tipe mesin + tahap) ──────────────────
CREATE TABLE checklist_parts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_id     INTEGER NOT NULL REFERENCES checklist_stages(id),
  part_name    VARCHAR(100) NOT NULL,
  machine_type machine_type NOT NULL,
  urutan       INTEGER DEFAULT 1,
  is_active    BOOLEAN DEFAULT TRUE,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- RVS parts
INSERT INTO checklist_parts (stage_id, part_name, machine_type, urutan) VALUES
-- Pembongkaran (1)
(1,'Chamber','RVS',1),(1,'Nozzle','RVS',2),(1,'Auger','RVS',3),(1,'Stirrer','RVS',4),(1,'Slider','RVS',5),
-- Pencucian (2)
(2,'Chamber','RVS',1),(2,'Nozzle','RVS',2),(2,'Auger','RVS',3),(2,'Stirrer','RVS',4),(2,'Slider','RVS',5),
-- Pengeringan (3)
(3,'Chamber','RVS',1),(3,'Nozzle','RVS',2),(3,'Auger','RVS',3),(3,'Stirrer','RVS',4),(3,'Slider','RVS',5),
-- Pembersihan bagian lain (4)
(4,'Sealing','RVS',1),(4,'No Batch Roller','RVS',2),(4,'Scraper','RVS',3),(4,'Crown','RVS',4),(4,'Body Mesin','RVS',5),(4,'Conveyor','RVS',6),
-- Swab Test (5)
(5,'Flexible Hose','RVS',1),(5,'Chamber','RVS',2),(5,'Nozzle','RVS',3),(5,'Auger','RVS',4),(5,'Stirrer','RVS',5),(5,'Slider','RVS',6),(5,'Pipa After','RVS',7),(5,'Flexible Hose After','RVS',8),
-- Pemasangan (6)
(6,'Chamber','RVS',1),(6,'Nozzle','RVS',2),(6,'Auger','RVS',3),(6,'Stirrer','RVS',4),(6,'Slider','RVS',5),
-- Pengencangan (7)
(7,'Chamber','RVS',1),(7,'Nozzle','RVS',2),(7,'Auger','RVS',3),(7,'Stirrer','RVS',4),(7,'Slider','RVS',5);

-- TOYO parts
INSERT INTO checklist_parts (stage_id, part_name, machine_type, urutan) VALUES
-- Pembongkaran/Pencucian/Pengeringan/Pemasangan/Pengencangan (1,2,3,6,7)
(1,'Pipa Discharge','TOYO',1),(1,'Valve Limitter','TOYO',2),(1,'Flexible Hose','TOYO',3),(1,'Pipa After Flexible Hose','TOYO',4),(1,'Hopper','TOYO',5),(1,'Rotary Feeder','TOYO',6),(1,'Subhopper','TOYO',7),(1,'Filling Shutte','TOYO',8),
(2,'Pipa Discharge','TOYO',1),(2,'Valve Limitter','TOYO',2),(2,'Flexible Hose','TOYO',3),(2,'Pipa After Flexible Hose','TOYO',4),(2,'Hopper','TOYO',5),(2,'Rotary Feeder','TOYO',6),(2,'Subhopper','TOYO',7),(2,'Filling Shutte','TOYO',8),
(3,'Pipa Discharge','TOYO',1),(3,'Valve Limitter','TOYO',2),(3,'Flexible Hose','TOYO',3),(3,'Pipa After Flexible Hose','TOYO',4),(3,'Hopper','TOYO',5),(3,'Rotary Feeder','TOYO',6),(3,'Subhopper','TOYO',7),(3,'Filling Shutte','TOYO',8),
-- Pembersihan bagian lain (4)
(4,'Sealing','TOYO',1),(4,'No Batch Roller','TOYO',2),(4,'Cross Knife','TOYO',3),(4,'Body Mesin','TOYO',4),(4,'Transverse Feed Dust Collector','TOYO',5),
-- Swab (5)
(5,'Pipa Discharge','TOYO',1),(5,'Valve Limitter','TOYO',2),(5,'Flexible Hose','TOYO',3),(5,'Pipa After Flexible Hose','TOYO',4),(5,'Hopper','TOYO',5),(5,'Rotary Feeder','TOYO',6),(5,'Subhopper','TOYO',7),(5,'Filling Shutte','TOYO',8),
-- Pemasangan (6)
(6,'Pipa Discharge','TOYO',1),(6,'Valve Limitter','TOYO',2),(6,'Flexible Hose','TOYO',3),(6,'Pipa After Flexible Hose','TOYO',4),(6,'Hopper','TOYO',5),(6,'Rotary Feeder','TOYO',6),(6,'Subhopper','TOYO',7),(6,'Filling Shutte','TOYO',8),
-- Pengencangan (7)
(7,'Pipa Discharge','TOYO',1),(7,'Valve Limitter','TOYO',2),(7,'Flexible Hose','TOYO',3),(7,'Pipa After Flexible Hose','TOYO',4),(7,'Hopper','TOYO',5),(7,'Rotary Feeder','TOYO',6),(7,'Subhopper','TOYO',7),(7,'Filling Shutte','TOYO',8);

-- ─── Cleaning Records ─────────────────────────────────────────────────────────
CREATE TABLE cleaning_records (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id         UUID NOT NULL REFERENCES machines(id),
  area_id            INTEGER NOT NULL REFERENCES areas(id),
  operator_id        UUID NOT NULL REFERENCES users(id),
  cleaning_date      DATE NOT NULL,
  cleaning_type      VARCHAR(50),              -- 'Minor' / 'Mayor'
  produk_sebelumnya  VARCHAR(100),
  produk_sesudahnya  VARCHAR(100),
  waktu_mulai        TIME,
  waktu_selesai      TIME,
  durasi_menit       INTEGER,
  status             cleaning_status DEFAULT 'draft',
  catatan            TEXT,
  telegram_sent      BOOLEAN DEFAULT FALSE,
  telegram_sent_at   TIMESTAMPTZ,
  submitted_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Checklist Items (detail per sesi cleaning) ───────────────────────────────
CREATE TABLE checklist_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id       UUID NOT NULL REFERENCES cleaning_records(id) ON DELETE CASCADE,
  stage_id        INTEGER NOT NULL REFERENCES checklist_stages(id),
  part_id         UUID REFERENCES checklist_parts(id),
  part_name       VARCHAR(100) NOT NULL,       -- snapshot nama saat cleaning
  jam_mulai       TIME,
  jam_selesai     TIME,
  durasi_menit    INTEGER,
  is_checked      BOOLEAN DEFAULT FALSE,
  keterangan      VARCHAR(20),                 -- 'OK' / 'Others' / NULL
  notes           TEXT,
  signature_name  VARCHAR(100),
  signature_time  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Cleaning Schedule (next_cleaning auto-calc) ──────────────────────────────
CREATE TABLE cleaning_schedule (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id      UUID UNIQUE NOT NULL REFERENCES machines(id),
  last_cleaned    DATE,
  next_cleaning   DATE,
  last_record_id  UUID REFERENCES cleaning_records(id),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── QA Verifications ─────────────────────────────────────────────────────────
CREATE TABLE qa_verifications (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id          UUID UNIQUE NOT NULL REFERENCES cleaning_records(id),
  qa_id              UUID NOT NULL REFERENCES users(id),
  decision           qa_decision NOT NULL,
  remarks            TEXT,
  corrective_action  TEXT,
  report_url         VARCHAR(500),
  is_draft           BOOLEAN DEFAULT TRUE,
  verified_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Reports ──────────────────────────────────────────────────────────────────
CREATE TABLE reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id    UUID REFERENCES cleaning_records(id),
  report_name  VARCHAR(200) NOT NULL,
  report_type  VARCHAR(50),
  floor        INTEGER,
  start_date   DATE,
  end_date     DATE,
  report_url   VARCHAR(500),
  is_draft     BOOLEAN DEFAULT TRUE,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Suhu RH (BMS data) ───────────────────────────────────────────────────────
CREATE TABLE suhu_rh (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id       UUID REFERENCES machines(id),
  line_id          INTEGER REFERENCES lines(id),
  tagname          VARCHAR(200) NOT NULL,
  description      VARCHAR(200),
  timestamp_start  TIMESTAMPTZ,
  timestamp_end    TIMESTAMPTZ,
  suhu             DECIMAL(5,2),
  rh               DECIMAL(5,2),
  status           room_status DEFAULT 'ready',
  synced_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Room Readiness Reviews ───────────────────────────────────────────────────
CREATE TABLE room_readiness_reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suhu_rh_id    UUID NOT NULL REFERENCES suhu_rh(id),
  reviewed_by   UUID NOT NULL REFERENCES users(id),
  action        VARCHAR(50) NOT NULL,    -- 'mark_approved' / 'call_maintenance'
  notes         TEXT,
  telegram_sent BOOLEAN DEFAULT FALSE,
  reviewed_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Room Readiness Lembar Review ────────────────────────────────────────────
CREATE TABLE room_readiness_lembar_review (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site             VARCHAR(100),
  area_id          INTEGER REFERENCES areas(id),
  param_suhu       BOOLEAN DEFAULT TRUE,
  param_rh         BOOLEAN DEFAULT TRUE,
  param_dp         BOOLEAN DEFAULT FALSE,
  periode          VARCHAR(50),
  date_start       DATE,
  time_start       TIME,
  date_end         DATE,
  time_end         TIME,
  suhu_min         DECIMAL(5,2),
  suhu_max         DECIMAL(5,2),
  suhu_avg         DECIMAL(5,2),
  suhu_syarat      VARCHAR(50),
  rh_min           DECIMAL(5,2),
  rh_max           DECIMAL(5,2),
  rh_avg           DECIMAL(5,2),
  rh_syarat        VARCHAR(50),
  reviewed_by_1    VARCHAR(100),   -- Supervisor
  reviewed_by_2    VARCHAR(100),   -- Manager Area
  reviewed_by_3    VARCHAR(100),   -- Manager QA
  review_date      DATE,
  notes            TEXT,
  submitted_by     UUID REFERENCES users(id),
  report_url       VARCHAR(500),
  submitted_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Telegram Notifications ───────────────────────────────────────────────────
CREATE TABLE telegram_notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id     UUID REFERENCES cleaning_records(id),
  review_id     UUID REFERENCES room_readiness_reviews(id),
  notif_type    notif_type NOT NULL,
  message_text  TEXT NOT NULL,
  is_sent       BOOLEAN DEFAULT FALSE,
  chat_id       VARCHAR(100),
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Audit Logs ───────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES users(id),
  action       audit_action NOT NULL,
  target_type  VARCHAR(50),
  target_id    VARCHAR(100),
  old_value    JSONB,
  new_value    JSONB,
  ip_address   VARCHAR(50),
  user_agent   VARCHAR(300),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_cleaning_records_machine_id ON cleaning_records(machine_id);
CREATE INDEX idx_cleaning_records_status ON cleaning_records(status);
CREATE INDEX idx_cleaning_records_date ON cleaning_records(cleaning_date DESC);
CREATE INDEX idx_checklist_items_record_id ON checklist_items(record_id);
CREATE INDEX idx_suhu_rh_line_id ON suhu_rh(line_id);
CREATE INDEX idx_suhu_rh_synced_at ON suhu_rh(synced_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_machines_area_id ON machines(area_id);
CREATE INDEX idx_machines_is_active ON machines(is_active);
