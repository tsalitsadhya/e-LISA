package main

import (
	"log"
	"os"

	"github.com/bintangtoedjoe/elisa-backend/internal/handler"
	"github.com/bintangtoedjoe/elisa-backend/internal/middleware"
	"github.com/bintangtoedjoe/elisa-backend/internal/model"
	"github.com/bintangtoedjoe/elisa-backend/pkg/bmsdb"
	"github.com/bintangtoedjoe/elisa-backend/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file, using environment variables")
	}

	// Connect PostgreSQL (main DB)
	if err := database.Connect(); err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	defer database.Close()
	log.Println("✓ Database connected")

	// Connect BMS SQL Server (optional — app continues if BMS is unreachable)
	if err := bmsdb.Connect(); err != nil {
		log.Printf("⚠ BMS connection failed (room readiness will be unavailable): %v", err)
	} else {
		defer bmsdb.Close()
		log.Println("✓ BMS (ICONICS) connected")
	}

	// Gin setup
	if os.Getenv("APP_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()
	r.Use(middleware.CORS())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, model.SuccessResponse("e-LISA API is running", gin.H{
			"version":       "1.0.0",
			"system":        "e-LISA — PT. Bintang Toedjoe",
			"bms_connected": bmsdb.IsConnected(),
		}))
	})

	api := r.Group("/api/v1")

	// ─── AUTH ─────────────────────────────
	auth := api.Group("/auth")
	{
		auth.POST("/login", handler.Login)
		auth.POST("/logout", middleware.AuthRequired(), handler.Logout)
		auth.GET("/me", middleware.AuthRequired(), handler.Me)
	}

	// ─── PROTECTED ────────────────────────
	protected := api.Group("/", middleware.AuthRequired())

	// ─── CLEANING ─────────────────────────
	cleaning := protected.Group("/cleaning")
	{
		cleaning.GET("/schedule", handler.GetCleaningSchedule)
		cleaning.GET("/records", handler.GetCleaningRecords)
		cleaning.GET("/records/:id", handler.GetCleaningRecordByID)
		cleaning.POST("/records", middleware.RoleRequired(model.RoleAdmin, model.RoleOperator), handler.CreateCleaningRecord)
		cleaning.POST("/records/:id/verify", middleware.QAOrAdmin(), handler.VerifyCleaningRecord)
	}

	// ─── MACHINES ─────────────────────────
	machines := protected.Group("/machines")
	{
		machines.GET("", handler.GetMachines)
		machines.GET("/:id", handler.GetMachineByID)
		machines.POST("", middleware.AdminOnly(), handler.CreateMachine)
		machines.PUT("/:id", middleware.AdminOnly(), handler.UpdateMachine)
		machines.DELETE("/:id", middleware.AdminOnly(), handler.DeleteMachine)
	}

	// ─── USERS ────────────────────────────
	users := protected.Group("/users", middleware.AdminOnly())
	{
		users.GET("", handler.GetUsers)
		users.GET("/:id", handler.GetUserByID)
		users.POST("", handler.CreateUser)
		users.PUT("/:id", handler.UpdateUser)
		users.PATCH("/:id/toggle", handler.ToggleUserStatus)
	}

	// ─── AUDIT LOGS ───────────────────────────────
	protected.GET("/audit-logs", middleware.AdminOnly(), handler.GetAuditLogs)

	// ─── ROOM / BMS ───────────────────────────────
	room := protected.Group("/room")
	{
		room.GET("/bms", handler.GetBMSData)
	}

	// Run server
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("✓ e-LISA API running on :%s", port)
	r.Run(":" + port)
}
