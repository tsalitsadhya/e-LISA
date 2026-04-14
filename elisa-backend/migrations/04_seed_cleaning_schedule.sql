-- ============================================================
-- e-LISA Seed: Cleaning Schedule
-- Source: Logbook Pembersihan Jalur Mesin GEA
--         Sheet "JAN-DEC 26 LT3" (last entries up to 03 Apr 2026)
-- window_end_days: Lt2 & Lt3 = 7 hari, Lt1 = 35 hari, Lt4 = 7 hari
-- ============================================================

-- ─── Lantai 3: TS-K1R (Tipping & Dumping Station) ────────────────────────────
-- Last K1R activity in logbook: 03-04-2026 (K1R2, K1R4, K1R7 ALL JALUR)
UPDATE cleaning_schedule
SET
    last_cleaned  = '2026-04-03',
    next_cleaning = '2026-04-10',   -- + 7 hari
    updated_at    = NOW()
WHERE machine_id = (SELECT id FROM machines WHERE machine_code = 'TS-K1R');

-- ─── Lantai 2: K1T Batching Stations ─────────────────────────────────────────
-- Per-station last cleaning date extracted from logbook

UPDATE cleaning_schedule
SET last_cleaned = '2026-04-03', next_cleaning = '2026-04-10', updated_at = NOW()
WHERE machine_id = (SELECT id FROM machines WHERE machine_code = 'K1T1');

UPDATE cleaning_schedule
SET last_cleaned = '2026-03-25', next_cleaning = '2026-04-01', updated_at = NOW()
WHERE machine_id = (SELECT id FROM machines WHERE machine_code = 'K1T2');

UPDATE cleaning_schedule
SET last_cleaned = '2026-04-03', next_cleaning = '2026-04-10', updated_at = NOW()
WHERE machine_id = (SELECT id FROM machines WHERE machine_code = 'K1T3');

UPDATE cleaning_schedule
SET last_cleaned = '2026-04-03', next_cleaning = '2026-04-10', updated_at = NOW()
WHERE machine_id = (SELECT id FROM machines WHERE machine_code = 'K1T4');

UPDATE cleaning_schedule
SET last_cleaned = '2026-04-03', next_cleaning = '2026-04-10', updated_at = NOW()
WHERE machine_id = (SELECT id FROM machines WHERE machine_code = 'K1T5');

-- K1T6: terakhir muncul 20-02-2026 (sudah >7 hari → overdue)
UPDATE cleaning_schedule
SET last_cleaned = '2026-02-20', next_cleaning = '2026-02-27', updated_at = NOW()
WHERE machine_id = (SELECT id FROM machines WHERE machine_code = 'K1T6');

UPDATE cleaning_schedule
SET last_cleaned = '2026-04-03', next_cleaning = '2026-04-10', updated_at = NOW()
WHERE machine_id = (SELECT id FROM machines WHERE machine_code = 'K1T7');

-- K1T8: terakhir 15-01-2026 (sudah sangat lama → overdue)
UPDATE cleaning_schedule
SET last_cleaned = '2026-01-15', next_cleaning = '2026-01-22', updated_at = NOW()
WHERE machine_id = (SELECT id FROM machines WHERE machine_code = 'K1T8');

-- K1T9: terakhir 15-02-2026 (sudah >7 hari → overdue)
UPDATE cleaning_schedule
SET last_cleaned = '2026-02-15', next_cleaning = '2026-02-22', updated_at = NOW()
WHERE machine_id = (SELECT id FROM machines WHERE machine_code = 'K1T9');

-- ─── Note: K1G (Discharge Stations) ──────────────────────────────────────────
-- Tidak ada di logbook LT3 sheet → last_cleaned tetap NULL (akan muncul sebagai overdue)
