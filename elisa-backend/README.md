# e-LISA Backend — Setup Guide

## Tech Stack
- **Golang** (Gin framework)
- **PostgreSQL 15** (dalam Docker)
- **JWT** untuk autentikasi

## Cara Menjalankan

### 1. Jalankan Docker (PostgreSQL + pgAdmin)
```bash
docker compose up -d
```
PostgreSQL berjalan di `localhost:5432`
pgAdmin berjalan di `http://localhost:5050`
- Email: admin@bintangtoedjoe.com
- Password: admin123

### 2. Tunggu DB siap, lalu cek migration
Migration SQL otomatis dijalankan saat container pertama kali naik:
- `001_create_tables.sql` → buat semua tabel + data master
- `002_seed_users.sql` → seed 176 user dari file Excel

### 3. Hash semua password dengan bcrypt
```bash
go run cmd/seed/main.go
```
Ini akan hash semua password user (nomor karyawan) menggunakan bcrypt.

### 4. Jalankan server
```bash
go run cmd/server/main.go
```
Server berjalan di `http://localhost:8080`

### 5. Test login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

## Role System

| Role | Akses |
|---|---|
| `admin` | Full access: master data, users, audit trail |
| `operator` | Input cleaning record, monitor room readiness |
| `qa` | Verify cleaning (approve/reject), lembar review (**termasuk Supervisor & Manager**) |
| `site_head` | View-only + export report |

## Default Password
Semua user menggunakan **nomor karyawan** sebagai password awal.
User dengan area "Developer" menggunakan password: `bintang7`
User admin sistem: `admin123`

---

## Struktur Folder
```
elisa-backend/
├── cmd/
│   ├── server/main.go     ← entry point server
│   └── seed/main.go       ← seed script bcrypt
├── config/config.go       ← env config
├── db/migrations/
│   ├── 001_create_tables.sql
│   └── 002_seed_users.sql
├── internal/
│   ├── auth/jwt.go        ← JWT generate & validate
│   ├── handler/           ← HTTP handlers
│   ├── middleware/auth.go  ← JWT middleware + role guard
│   ├── model/user.go      ← data models
│   └── repository/        ← database queries
├── docker-compose.yml
└── .env
```

## API Endpoints (saat ini)

| Method | Endpoint | Role | Keterangan |
|---|---|---|---|
| POST | /api/auth/login | Public | Login, return JWT token |
| GET | /api/auth/me | Semua | Info user yang login |
| POST | /api/auth/change-password | Semua | Ganti password |
| GET | /api/users | admin | List semua user |
| GET | /api/cleaning/schedule | operator, qa, admin | Jadwal cleaning |
| GET | /api/qa/pending | qa, admin | Cleaning pending QA |
| GET | /api/master/machines | admin | Master data mesin |
| GET | /api/audit-trail | admin | Audit trail |
