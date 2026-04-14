-- ============================================================
-- e-LISA Database Schema
-- PT. Bintang Toedjoe (Kalbe Company)
-- Created: 2026
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ENUM TYPES ────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('admin', 'operator', 'qa', 'site_head');
CREATE TYPE machine_type AS ENUM ('RVS', 'TOYO', 'WB', 'K1R', 'TS', 'DS', 'MF');
CREATE TYPE floor_rule_type AS ENUM ('rolling', 'hard_deadline');
CREATE TYPE cleaning_status AS ENUM ('draft', 'submitted', 'waiting_qa', 'approved', 'rejected');
CREATE TYPE keterangan_type AS ENUM ('OK', 'Others');
CREATE TYPE room_status AS ENUM ('ready', 'warning', 'out_of_spec');
CREATE TYPE review_action AS ENUM ('mark_approved', 'call_maintenance');
CREATE TYPE notif_type AS ENUM ('cleaning_submitted', 'qa_result', 'room_warning', 'room_approved');
CREATE TYPE audit_action AS ENUM (
  'login', 'logout',
  'submit_cleaning', 'edit_cleaning', 'delete_cleaning',
  'qa_approve', 'qa_reject',
  'generate_report',
  'add_machine', 'edit_machine', 'delete_machine',
  'add_part', 'edit_part', 'delete_part',
  'edit_floor_config',
  'add_user', 'edit_user', 'deactivate_user',
  'room_review', 'send_telegram'
);

-- ── ROLES & USERS ─────────────────────────────────────────────────────────────

CREATE TABLE roles (
  id          SERIAL PRIMARY KEY,
  role_name   user_role UNIQUE NOT NULL,
  description TEXT
);

INSERT INTO roles (role_name, description) VALUES
  ('admin',     'Full system access: master data, users, audit trail'),
  ('operator',  'Input cleaning record & monitor room readiness'),
  ('qa',        'Verify cleaning, approve/reject, lembar review (termasuk supervisor & manager)'),
  ('site_head', 'View-only semua data + export report');

CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username     VARCHAR(100) UNIQUE NOT NULL,
  full_name    VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id      INTEGER NOT NULL REFERENCES roles(id),
  area         VARCHAR(100),           -- Filling, Compounding, Packaging, Weighing, dll
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  last_login   TIMESTAMP,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── AREAS & FLOORS ────────────────────────────────────────────────────────────

CREATE TABLE areas (
  id          SERIAL PRIMARY KEY,
  area_name   VARCHAR(100) NOT NULL,
  floor       INTEGER NOT NULL CHECK (floor BETWEEN 1 AND 4),
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO areas (area_name, floor, description) VALUES
  ('Filing - Lantai 1',        1, 'Area filling mesin RVS & TOYO'),
  ('Compounding - Lantai 2',   2, 'Area batching station K1T'),
  ('Compounding - Lantai 3',   3, 'Area tipping & dumping station K1R'),
  ('Compounding - Lantai 4',   4, 'Area weighing booth');

-- ── FLOOR CONFIG (aturan cleaning per lantai) ─────────────────────────────────

CREATE TABLE floor_config (
  id                  SERIAL PRIMARY KEY,
  area_id             INTEGER NOT NULL REFERENCES areas(id),
  rule_type           floor_rule_type NOT NULL DEFAULT 'rolling',
  window_start_days   INTEGER NOT NULL DEFAULT 30,  -- mulai "Due Soon"
  window_end_days     INTEGER NOT NULL DEFAULT 35,  -- batas akhir window
  overdue_after_days  INTEGER NOT NULL DEFAULT 35,  -- lewat ini = Overdue
  due_soon_from_day   INTEGER NOT NULL DEFAULT 5,   -- khusus hard_deadline
  updated_by          UUID REFERENCES users(id),
  updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO floor_config (area_id, rule_type, window_start_days, window_end_days, overdue_after_days, due_soon_from_day) VALUES
  (1, 'rolling',       30, 35, 35, 30),
  (2, 'hard_deadline',  5,  7,  7,  5),
  (3, 'hard_deadline',  5,  7,  7,  5),
  (4, 'hard_deadline',  5,  7,  7,  5);

-- ── LINES ─────────────────────────────────────────────────────────────────────

CREATE TABLE lines (
  id         SERIAL PRIMARY KEY,
  area_id    INTEGER NOT NULL REFERENCES areas(id),
  line_name  VARCHAR(20) NOT NULL,   -- "Line A", "Line B", ...
  line_code  VARCHAR(10),            -- "A", "B", ...
  is_active  BOOLEAN NOT NULL DEFAULT TRUE
);

-- Lantai 1: 16 lines (A-P, tanpa I, O, Q)
INSERT INTO lines (area_id, line_name, line_code) VALUES
  (1,'Line A','A'),(1,'Line B','B'),(1,'Line C','C'),(1,'Line D','D'),
  (1,'Line E','E'),(1,'Line F','F'),(1,'Line G','G'),(1,'Line H','H'),
  (1,'Line J','J'),(1,'Line K','K'),(1,'Line L','L'),(1,'Line M','M'),
  (1,'Line N','N'),(1,'Line S','S'),(1,'Line T','T'),(1,'Line P','P');

-- ── MACHINES ─────────────────────────────────────────────────────────────────

CREATE TABLE machines (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_code  VARCHAR(50) UNIQUE NOT NULL,
  machine_name  VARCHAR(100) NOT NULL,
  machine_type  machine_type NOT NULL,
  area_id       INTEGER NOT NULL REFERENCES areas(id),
  line_id       INTEGER REFERENCES lines(id),
  sub_label     VARCHAR(100),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- RVS A-N (Lantai 1)
INSERT INTO machines (machine_code, machine_name, machine_type, area_id, sub_label) VALUES
  ('RVS-A','RVS A','RVS',1,'Filing - Lantai 1'),
  ('RVS-B','RVS B','RVS',1,'Filing - Lantai 1'),
  ('RVS-C','RVS C','RVS',1,'Filing - Lantai 1'),
  ('RVS-D','RVS D','RVS',1,'Filing - Lantai 1'),
  ('RVS-E','RVS E','RVS',1,'Filing - Lantai 1'),
  ('RVS-F','RVS F','RVS',1,'Filing - Lantai 1'),
  ('RVS-G','RVS G','RVS',1,'Filing - Lantai 1'),
  ('RVS-H','RVS H','RVS',1,'Filing - Lantai 1'),
  ('RVS-I','RVS I','RVS',1,'Filing - Lantai 1'),
  ('RVS-J','RVS J','RVS',1,'Filing - Lantai 1'),
  ('RVS-K','RVS K','RVS',1,'Filing - Lantai 1'),
  ('RVS-L','RVS L','RVS',1,'Filing - Lantai 1'),
  ('RVS-M','RVS M','RVS',1,'Filing - Lantai 1'),
  ('RVS-N','RVS N','RVS',1,'Filing - Lantai 1');

-- TOYO Lines (Lantai 1)
INSERT INTO machines (machine_code, machine_name, machine_type, area_id, sub_label) VALUES
  ('TOYO-A','TOYO Line A','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-B','TOYO Line B','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-C','TOYO Line C','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-D','TOYO Line D','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-E','TOYO Line E','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-F','TOYO Line F','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-G','TOYO Line G','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-H','TOYO Line H','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-J','TOYO Line J','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-K','TOYO Line K','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-L','TOYO Line L','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-M','TOYO Line M','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-N','TOYO Line N','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-S','TOYO Line S','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-T','TOYO Line T','TOYO',1,'Filing - Lantai 1'),
  ('TOYO-P','TOYO Line P','TOYO',1,'Filing - Lantai 1');

-- Lantai 2: Batching Station K1T1-K1T8
INSERT INTO machines (machine_code, machine_name, machine_type, area_id, sub_label) VALUES
  ('BS-K1T1','Batching Station K1T1','TS',2,'Compounding - Lantai 2'),
  ('BS-K1T2','Batching Station K1T2','TS',2,'Compounding - Lantai 2'),
  ('BS-K1T3','Batching Station K1T3','TS',2,'Compounding - Lantai 2'),
  ('BS-K1T4','Batching Station K1T4','TS',2,'Compounding - Lantai 2'),
  ('BS-K1T5','Batching Station K1T5','TS',2,'Compounding - Lantai 2'),
  ('BS-K1T6','Batching Station K1T6','TS',2,'Compounding - Lantai 2'),
  ('BS-K1T7','Batching Station K1T7','TS',2,'Compounding - Lantai 2'),
  ('BS-K1T8','Batching Station K1T8','TS',2,'Compounding - Lantai 2');

-- Lantai 3: Tipping Station K1R1-K1R8 + Dumping Station
INSERT INTO machines (machine_code, machine_name, machine_type, area_id, sub_label) VALUES
  ('TS-K1R1','Tipping Station K1R1','TS',3,'Compounding - Lantai 3'),
  ('TS-K1R2','Tipping Station K1R2','TS',3,'Compounding - Lantai 3'),
  ('TS-K1R3','Tipping Station K1R3','TS',3,'Compounding - Lantai 3'),
  ('TS-K1R4','Tipping Station K1R4','TS',3,'Compounding - Lantai 3'),
  ('TS-K1R5','Tipping Station K1R5','TS',3,'Compounding - Lantai 3'),
  ('TS-K1R6','Tipping Station K1R6','TS',3,'Compounding - Lantai 3'),
  ('TS-K1R7','Tipping Station K1R7','TS',3,'Compounding - Lantai 3'),
  ('TS-K1R8','Tipping Station K1R8','TS',3,'Compounding - Lantai 3'),
  ('DS-001','Dumping Station','DS',3,'Compounding - Lantai 3');

-- Lantai 4: Weighing Booth WB1-3 + Peralatan Timbang
INSERT INTO machines (machine_code, machine_name, machine_type, area_id, sub_label) VALUES
  ('WB-1','Weighing Booth WB1','WB',4,'Compounding - Lantai 4'),
  ('WB-2','Weighing Booth WB2','WB',4,'Compounding - Lantai 4'),
  ('WB-3','Weighing Booth WB3','WB',4,'Compounding - Lantai 4'),
  ('PT-CENTONG','Peralatan Timbang (Centong)','MF',4,'Compounding - Lantai 4');

-- ── MACHINE JALUR (Lt 2/3/4) ─────────────────────────────────────────────────

CREATE TABLE machine_jalur (
  id           SERIAL PRIMARY KEY,
  machine_id   UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  jalur_code   VARCHAR(50) NOT NULL,
  jalur_name   VARCHAR(100),
  urutan       INTEGER NOT NULL DEFAULT 1,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE
);

-- Jalur untuk Tipping Station K1R1-K1R8
DO $$
DECLARE
  mid UUID;
  i   INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    SELECT id INTO mid FROM machines WHERE machine_code = 'TS-K1R' || i;
    INSERT INTO machine_jalur (machine_id, jalur_code, urutan) VALUES
      (mid, 'K1R' || i || 'P01DP001', 1),
      (mid, 'K1R' || i || 'P02DP001', 2),
      (mid, 'K1R' || i || 'P03DP001', 3),
      (mid, 'K1R' || i || 'P04DP001', 4);
  END LOOP;
END $$;

-- Jalur untuk Batching Station K1T1-K1T8
DO $$
DECLARE
  mid UUID;
  i   INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    SELECT id INTO mid FROM machines WHERE machine_code = 'BS-K1T' || i;
    INSERT INTO machine_jalur (machine_id, jalur_code, urutan) VALUES
      (mid, 'K1T' || i || 'P01DP001', 1),
      (mid, 'K1T' || i || 'P02DP001', 2),
      (mid, 'K1T' || i || 'P03DP001', 3);
  END LOOP;
END $$;

-- Jalur WB
DO $$
DECLARE
  mid UUID;
  i   INTEGER;
BEGIN
  FOR i IN 1..3 LOOP
    SELECT id INTO mid FROM machines WHERE machine_code = 'WB-' || i;
    INSERT INTO machine_jalur (machine_id, jalur_code, urutan) VALUES
      (mid, 'WB' || i || 'P01DP001', 1),
      (mid, 'WB' || i || 'P02DP001', 2);
  END LOOP;
END $$;

-- ── CHECKLIST STAGES ──────────────────────────────────────────────────────────

CREATE TABLE checklist_stages (
  id          SERIAL PRIMARY KEY,
  urutan      INTEGER NOT NULL,
  stage_name  VARCHAR(100) NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO checklist_stages (urutan, stage_name) VALUES
  (1, 'Pembongkaran'),
  (2, 'Pencucian'),
  (3, 'Pengeringan'),
  (4, 'Pembersihan bagian lain'),
  (5, 'Swab Test'),
  (6, 'Pemasangan'),
  (7, 'Pengencangan baut/klem');

-- ── CHECKLIST PARTS ──────────────────────────────────────────────────────────

CREATE TABLE checklist_parts (
  id           SERIAL PRIMARY KEY,
  part_name    VARCHAR(150) NOT NULL,
  machine_type machine_type NOT NULL,
  stage_id     INTEGER NOT NULL REFERENCES checklist_stages(id),
  urutan       INTEGER NOT NULL DEFAULT 1,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- RVS parts
DO $$
DECLARE
  stage_id_val INTEGER;
BEGIN
  -- Pembongkaran, Pencucian, Pengeringan, Pemasangan, Pengencangan: Chamber, Nozzle, Auger, Stirrer, Slider
  FOREACH stage_id_val IN ARRAY ARRAY[1,2,3,6,7] LOOP
    INSERT INTO checklist_parts (part_name, machine_type, stage_id, urutan) VALUES
      ('Chamber','RVS', stage_id_val, 1),
      ('Nozzle', 'RVS', stage_id_val, 2),
      ('Auger',  'RVS', stage_id_val, 3),
      ('Stirrer','RVS', stage_id_val, 4),
      ('Slider', 'RVS', stage_id_val, 5);
  END LOOP;
  -- Pembersihan bagian lain (stage 4)
  INSERT INTO checklist_parts (part_name, machine_type, stage_id, urutan) VALUES
    ('Sealing',        'RVS', 4, 1),
    ('No Batch Roller','RVS', 4, 2),
    ('Scraper',        'RVS', 4, 3),
    ('Crown',          'RVS', 4, 4),
    ('Body Mesin',     'RVS', 4, 5),
    ('Conveyor',       'RVS', 4, 6);
  -- Swab Test (stage 5)
  INSERT INTO checklist_parts (part_name, machine_type, stage_id, urutan) VALUES
    ('Flexible Hose',  'RVS', 5, 1),
    ('Chamber',        'RVS', 5, 2),
    ('Nozzle',         'RVS', 5, 3),
    ('Auger',          'RVS', 5, 4),
    ('Stirrer',        'RVS', 5, 5),
    ('Slider',         'RVS', 5, 6),
    ('Pipa After',     'RVS', 5, 7),
    ('Flexible Hose After','RVS', 5, 8);
END $$;

-- TOYO parts
DO $$
DECLARE
  stage_id_val INTEGER;
BEGIN
  -- Pembongkaran, Pencucian, Pengeringan, Swab Test, Pemasangan, Pengencangan
  FOREACH stage_id_val IN ARRAY ARRAY[1,2,3,5,6,7] LOOP
    INSERT INTO checklist_parts (part_name, machine_type, stage_id, urutan) VALUES
      ('Pipa Discharge',          'TOYO', stage_id_val, 1),
      ('Valve Limitter',          'TOYO', stage_id_val, 2),
      ('Flexible Hose',           'TOYO', stage_id_val, 3),
      ('Pipa After Flexible Hose','TOYO', stage_id_val, 4),
      ('Hopper',                  'TOYO', stage_id_val, 5),
      ('Rotary Feeder',           'TOYO', stage_id_val, 6),
      ('Subhopper',               'TOYO', stage_id_val, 7),
      ('Filling Shutte',          'TOYO', stage_id_val, 8);
  END LOOP;
  -- Pembersihan bagian lain (stage 4)
  INSERT INTO checklist_parts (part_name, machine_type, stage_id, urutan) VALUES
    ('Sealing',                      'TOYO', 4, 1),
    ('No Batch Roller',              'TOYO', 4, 2),
    ('Cross Knife',                  'TOYO', 4, 3),
    ('Body Mesin',                   'TOYO', 4, 4),
    ('Transverse Feed Dust Collector','TOYO', 4, 5);
END $$;

-- ── CLEANING RECORDS ──────────────────────────────────────────────────────────

CREATE TABLE cleaning_records (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id        UUID NOT NULL REFERENCES machines(id),
  area_id           INTEGER NOT NULL REFERENCES areas(id),
  operator_id       UUID NOT NULL REFERENCES users(id),
  cleaning_date     DATE NOT NULL,
  cleaning_type     VARCHAR(20) NOT NULL DEFAULT 'Minor',  -- Minor / Mayor
  produk_sebelumnya VARCHAR(100),
  produk_sesudahnya VARCHAR(100),
  waktu_mulai       TIME,
  waktu_selesai     TIME,
  durasi_menit      INTEGER,
  catatan           TEXT,
  status            cleaning_status NOT NULL DEFAULT 'draft',
  telegram_sent     BOOLEAN NOT NULL DEFAULT FALSE,
  telegram_sent_at  TIMESTAMP,
  submitted_at      TIMESTAMP,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index untuk query jadwal
CREATE INDEX idx_cleaning_machine ON cleaning_records(machine_id);
CREATE INDEX idx_cleaning_date ON cleaning_records(cleaning_date DESC);
CREATE INDEX idx_cleaning_status ON cleaning_records(status);

-- ── CHECKLIST ITEMS ───────────────────────────────────────────────────────────

CREATE TABLE checklist_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id       UUID NOT NULL REFERENCES cleaning_records(id) ON DELETE CASCADE,
  stage_id        INTEGER NOT NULL REFERENCES checklist_stages(id),
  part_id         INTEGER REFERENCES checklist_parts(id),
  part_name       VARCHAR(150) NOT NULL,  -- snapshot nama part saat itu
  jam_mulai       TIME,
  jam_selesai     TIME,
  durasi_menit    INTEGER,
  is_checked      BOOLEAN NOT NULL DEFAULT FALSE,
  keterangan      keterangan_type,
  notes           TEXT,
  signature_name  VARCHAR(150),
  signature_time  TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checklist_record ON checklist_items(record_id);

-- ── QA VERIFICATIONS ──────────────────────────────────────────────────────────

CREATE TABLE qa_verif (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id         UUID NOT NULL UNIQUE REFERENCES cleaning_records(id),
  qa_id             UUID NOT NULL REFERENCES users(id),
  machine_id        UUID NOT NULL REFERENCES machines(id),
  decision          VARCHAR(20) NOT NULL CHECK (decision IN ('approved','rejected')),
  form_feedback     TEXT,
  corrective_action TEXT,
  report_generated  BOOLEAN NOT NULL DEFAULT FALSE,
  report_url        VARCHAR(500),
  is_draft_report   BOOLEAN NOT NULL DEFAULT TRUE,
  verified_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── REPORT ────────────────────────────────────────────────────────────────────

CREATE TABLE report (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id   UUID NOT NULL REFERENCES cleaning_records(id),
  report_name VARCHAR(200) NOT NULL,
  report_type VARCHAR(50),
  floor       INTEGER,
  start_date  DATE,
  end_date    DATE,
  report_url  VARCHAR(500),
  is_draft    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── CLEANING SCHEDULE (next cleaning calculation) ─────────────────────────────

CREATE TABLE cleaning_ms (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id    UUID NOT NULL UNIQUE REFERENCES machines(id),
  area_id       INTEGER NOT NULL REFERENCES areas(id),
  last_cleaning DATE,
  next_cleaning DATE,
  last_record_id UUID REFERENCES cleaning_records(id),
  status        VARCHAR(30) NOT NULL DEFAULT 'safe',
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── SUHU_RH (BMS Data) ────────────────────────────────────────────────────────

CREATE TABLE suhu_rh (
  id              SERIAL PRIMARY KEY,
  machine_id      UUID REFERENCES machines(id),
  tagname         VARCHAR(200) NOT NULL,
  description     VARCHAR(200),
  timestamp_start TIMESTAMP,
  timestamp_end   TIMESTAMP,
  suhu            DECIMAL(5,2),
  rh              DECIMAL(5,2),
  status          room_status NOT NULL DEFAULT 'ready',
  synced_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suhu_rh_machine ON suhu_rh(machine_id);
CREATE INDEX idx_suhu_rh_synced ON suhu_rh(synced_at DESC);

-- ── ROOM READINESS REVIEW ────────────────────────────────────────────────────

CREATE TABLE room_readiness_review (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suhu_rh_id      INTEGER NOT NULL REFERENCES suhu_rh(id),
  reviewed_by     UUID NOT NULL REFERENCES users(id),
  action          review_action NOT NULL,
  notes           TEXT,
  telegram_sent   BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── LEMBAR REVIEW ────────────────────────────────────────────────────────────

CREATE TABLE lembar_review (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site            VARCHAR(100) NOT NULL DEFAULT 'Cikarang',
  area            VARCHAR(100) NOT NULL,
  parameter_suhu  BOOLEAN NOT NULL DEFAULT TRUE,
  parameter_rh    BOOLEAN NOT NULL DEFAULT TRUE,
  parameter_dp    BOOLEAN NOT NULL DEFAULT FALSE,
  periode         VARCHAR(50),
  date_start      DATE,
  time_start      TIME,
  date_end        DATE,
  time_end        TIME,
  suhu_min        DECIMAL(5,2),
  suhu_max        DECIMAL(5,2),
  suhu_avg        DECIMAL(5,2),
  suhu_syarat     VARCHAR(50),
  rh_min          DECIMAL(5,2),
  rh_max          DECIMAL(5,2),
  rh_avg          DECIMAL(5,2),
  rh_syarat       VARCHAR(50),
  reviewed_by_supervisor  VARCHAR(150),
  approved_by_manager     VARCHAR(150),
  reviewed_by_qa          VARCHAR(150),
  review_date     DATE,
  notes           TEXT,
  report_url      VARCHAR(500),
  submitted_by    UUID NOT NULL REFERENCES users(id),
  submitted_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── TELEGRAM NOTIFICATIONS ────────────────────────────────────────────────────

CREATE TABLE telegram_notif (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id       UUID REFERENCES cleaning_records(id),
  review_id       UUID REFERENCES room_readiness_review(id),
  notif_type      notif_type NOT NULL,
  message_text    TEXT NOT NULL,
  is_sent         BOOLEAN NOT NULL DEFAULT FALSE,
  telegram_chat_id VARCHAR(100),
  sent_at         TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── AUDIT LOGS ───────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  action      audit_action NOT NULL,
  target_type VARCHAR(50),
  target_id   VARCHAR(100),
  old_value   JSONB,
  new_value   JSONB,
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(255),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
