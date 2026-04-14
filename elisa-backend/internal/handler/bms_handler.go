package handler

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/bintangtoedjoe/elisa-backend/pkg/bmsdb"
	"github.com/gin-gonic/gin"
)

// tagLine maps a pair of BMS tagnames to a display line
type tagLine struct {
	TempTag string
	RHTag   string
	LineID  string
	Display string
}

// TAG_LINES defines all monitored Filling lines on 1st Floor (Filling area)
// T and RH for each filling are in the same AHU group prefix:
//
//	Filling  1– 7 → 1stF/R_AHUGF04/
//	Filling  8–14 → 1stF/R_AHUGF03/
//	Filling 15–24 → 1stF/R_AHUGF02/
var TAG_LINES = []tagLine{
	// ─── AHU GF04 — Filling 1–7 ─────────────────────────────────────────────
	{"1stF/R_AHUGF04/Filling_1_T", "1stF/R_AHUGF04/Filling_1_RH", "filling_1", "Filling 1"},
	{"1stF/R_AHUGF04/Filling_2_T", "1stF/R_AHUGF04/Filling_2_RH", "filling_2", "Filling 2"},
	{"1stF/R_AHUGF04/Filling_3_T", "1stF/R_AHUGF04/Filling_3_RH", "filling_3", "Filling 3"},
	{"1stF/R_AHUGF04/Filling_4_T", "1stF/R_AHUGF04/Filling_4_RH", "filling_4", "Filling 4"},
	{"1stF/R_AHUGF04/Filling_5_T", "1stF/R_AHUGF04/Filling_5_RH", "filling_5", "Filling 5"},
	{"1stF/R_AHUGF04/Filling_6_T", "1stF/R_AHUGF04/Filling_6_RH", "filling_6", "Filling 6"},
	{"1stF/R_AHUGF04/Filling_7_T", "1stF/R_AHUGF04/Filling_7_RH", "filling_7", "Filling 7"},
	// ─── AHU GF03 — Filling 8–14 ────────────────────────────────────────────
	{"1stF/R_AHUGF03/Filling_8_T", "1stF/R_AHUGF03/Filling_8_RH", "filling_8", "Filling 8"},
	{"1stF/R_AHUGF03/Filling_9_T", "1stF/R_AHUGF03/Filling_9_RH", "filling_9", "Filling 9"},
	{"1stF/R_AHUGF03/Filling_10_T", "1stF/R_AHUGF03/Filling_10_RH", "filling_10", "Filling 10"},
	{"1stF/R_AHUGF03/Filling_11_T", "1stF/R_AHUGF03/Filling_11_RH", "filling_11", "Filling 11"},
	{"1stF/R_AHUGF03/Filling_12_T", "1stF/R_AHUGF03/Filling_12_RH", "filling_12", "Filling 12"},
	{"1stF/R_AHUGF03/Filling_13_T", "1stF/R_AHUGF03/Filling_13_RH", "filling_13", "Filling 13"},
	{"1stF/R_AHUGF03/Filling_14_T", "1stF/R_AHUGF03/Filling_14_RH", "filling_14", "Filling 14"},
	// ─── AHU GF02 — Filling 15–24 ───────────────────────────────────────────
	{"1stF/R_AHUGF02/Filling_15_T", "1stF/R_AHUGF02/Filling_15_RH", "filling_15", "Filling 15"},
	{"1stF/R_AHUGF02/Filling_16_T", "1stF/R_AHUGF02/Filling_16_RH", "filling_16", "Filling 16"},
	{"1stF/R_AHUGF02/Filling_17_T", "1stF/R_AHUGF02/Filling_17_RH", "filling_17", "Filling 17"},
	{"1stF/R_AHUGF02/Filling_18_T", "1stF/R_AHUGF02/Filling_18_RH", "filling_18", "Filling 18"},
	{"1stF/R_AHUGF02/Filling_19_T", "1stF/R_AHUGF02/Filling_19_RH", "filling_19", "Filling 19"},
	{"1stF/R_AHUGF02/Filling_20_T", "1stF/R_AHUGF02/Filling_20_RH", "filling_20", "Filling 20"},
	{"1stF/R_AHUGF02/Filling_21_T", "1stF/R_AHUGF02/Filling_21_RH", "filling_21", "Filling 21"},
	{"1stF/R_AHUGF02/Filling_22_T", "1stF/R_AHUGF02/Filling_22_RH", "filling_22", "Filling 22"},
	{"1stF/R_AHUGF02/Filling_23_T", "1stF/R_AHUGF02/Filling_23_RH", "filling_23", "Filling 23"},
	{"1stF/R_AHUGF02/Filling_24_T", "1stF/R_AHUGF02/Filling_24_RH", "filling_24", "Filling 24"},
}

// Threshold for pharmaceutical production (GMP standard)
const (
	TEMP_GREEN   = 25.0
	TEMP_WARNING = 27.0
	RH_GREEN     = 65.0
	RH_WARNING   = 70.0
)

type SensorReading struct {
	Value     *float64   `json:"value"`
	Timestamp *time.Time `json:"timestamp"`
	Status    string     `json:"status"` // "ready" | "warning" | "out_of_spec" | "no_data"
}

type BMSLineResult struct {
	LineID      string        `json:"line_id"`
	DisplayName string        `json:"display_name"`
	Temperature SensorReading `json:"temperature"`
	Humidity    SensorReading `json:"humidity"`
	Status      string        `json:"status"`
}

// GET /api/v1/room/bms
func GetBMSData(c *gin.Context) {
	if !bmsdb.IsConnected() {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"success": false,
			"message": "BMS connection not available",
		})
		return
	}

	linkedServer := os.Getenv("BMS_LINKED_SERVER")
	if linkedServer == "" {
		linkedServer = "HH2"
	}

	// 15-second total timeout for all BMS queries
	ctx, cancel := context.WithTimeout(c.Request.Context(), 15*time.Second)
	defer cancel()

	results := make([]BMSLineResult, len(TAG_LINES))
	var wg sync.WaitGroup

	for i, line := range TAG_LINES {
		wg.Add(1)
		go func(i int, line tagLine) {
			defer wg.Done()
			result := BMSLineResult{
				LineID:      line.LineID,
				DisplayName: line.Display,
				Temperature: queryLatest(ctx, linkedServer, line.TempTag, TEMP_GREEN, TEMP_WARNING),
				Humidity:    queryLatest(ctx, linkedServer, line.RHTag, RH_GREEN, RH_WARNING),
			}
			result.Status = worstStatus(result.Temperature.Status, result.Humidity.Status)
			results[i] = result
		}(i, line)
	}

	wg.Wait()

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"data":       results,
		"count":      len(results),
		"fetched_at": time.Now(),
	})
}

// queryLatest fetches the most recent value for a tagname from ICONICS rawdata.
// Uses QueryRowContext so it respects the caller's timeout.
func queryLatest(ctx context.Context, linkedServer, tagname string, greenThreshold, warningThreshold float64) SensorReading {
	query := fmt.Sprintf(`
		SELECT TOP 1 VALUE, TIMESTAMP
		FROM OPENQUERY([%s],
			'SELECT TAGNAME, TIMESTAMP, VALUE FROM rawdata WHERE TAGNAME = ''%s'''
		)
		ORDER BY TIMESTAMP DESC
	`, linkedServer, escapeSingleQuote(tagname))

	row := bmsdb.DB.QueryRowContext(ctx, query)

	var value float64
	var ts time.Time
	if err := row.Scan(&value, &ts); err != nil {
		return SensorReading{Status: "no_data"}
	}

	return SensorReading{
		Value:     &value,
		Timestamp: &ts,
		Status:    thresholdStatus(value, greenThreshold, warningThreshold),
	}
}

func thresholdStatus(value, green, warning float64) string {
	if value <= green {
		return "ready"
	} else if value <= warning {
		return "warning"
	}
	return "out_of_spec"
}

func worstStatus(a, b string) string {
	rank := map[string]int{"ready": 0, "no_data": 1, "warning": 2, "out_of_spec": 3}
	if rank[a] >= rank[b] {
		return a
	}
	return b
}

func escapeSingleQuote(s string) string {
	return strings.ReplaceAll(s, "'", "''")
}
