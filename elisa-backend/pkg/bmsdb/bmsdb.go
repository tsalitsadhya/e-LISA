package bmsdb

import (
	"database/sql"
	"fmt"
	"net/url"
	"os"

	_ "github.com/microsoft/go-mssqldb"
)

var DB *sql.DB

func Connect() error {
	u := &url.URL{
		Scheme: "sqlserver",
		User:   url.UserPassword(os.Getenv("BMS_USER"), os.Getenv("BMS_PASSWORD")),
		Host:   fmt.Sprintf("%s:%s", os.Getenv("BMS_HOST"), os.Getenv("BMS_PORT")),
	}
	query := url.Values{}
	query.Set("database", os.Getenv("BMS_DB"))
	query.Set("encrypt", "disable")
	query.Set("TrustServerCertificate", "true")
	u.RawQuery = query.Encode()

	db, err := sql.Open("sqlserver", u.String())
	if err != nil {
		return fmt.Errorf("bmsdb open: %w", err)
	}
	if err = db.Ping(); err != nil {
		return fmt.Errorf("bmsdb ping: %w", err)
	}
	db.SetMaxOpenConns(20)
	db.SetMaxIdleConns(10)
	DB = db
	return nil
}

func Close() {
	if DB != nil {
		DB.Close()
	}
}

func IsConnected() bool {
	return DB != nil && DB.Ping() == nil
}
