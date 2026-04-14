package main

import (
	"log"

	"github.com/bintangtoedjoe/elisa-backend/config"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

// Seed script: hash semua password yang masih plain text (prefix $HASH$ sudah dihapus di 002_seed_users.sql)
// Jalankan sekali setelah docker compose up + migration selesai.
// Usage: go run cmd/seed/main.go

func main() {
	cfg := config.Load()

	db, err := sqlx.Connect("pgx", cfg.DSN())
	if err != nil {
		log.Fatalf("gagal connect DB: %v", err)
	}
	defer db.Close()

	// Ambil semua user yang passwordnya belum di-hash (belum diawali $2a$ bcrypt prefix)
	rows, err := db.Query(`SELECT id, password_hash FROM users WHERE password_hash NOT LIKE '$2a$%'`)
	if err != nil {
		log.Fatalf("gagal query users: %v", err)
	}
	defer rows.Close()

	type userRow struct {
		ID           string
		PasswordHash string
	}

	var users []userRow
	for rows.Next() {
		var u userRow
		if err := rows.Scan(&u.ID, &u.PasswordHash); err != nil {
			log.Printf("scan error: %v", err)
			continue
		}
		users = append(users, u)
	}

	log.Printf("Ditemukan %d user yang perlu di-hash passwordnya", len(users))

	for _, u := range users {
		plainPw := u.PasswordHash // nomor karyawan / password awal
		hashed, err := bcrypt.GenerateFromPassword([]byte(plainPw), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("gagal hash user %s: %v", u.ID, err)
			continue
		}
		_, err = db.Exec(`UPDATE users SET password_hash = $1 WHERE id = $2`, string(hashed), u.ID)
		if err != nil {
			log.Printf("gagal update user %s: %v", u.ID, err)
			continue
		}
	}

	log.Println("✅ Seeding password selesai! Semua password sudah di-hash dengan bcrypt.")
	log.Println("   Setiap user bisa login menggunakan nomor karyawan sebagai password awal.")
}
