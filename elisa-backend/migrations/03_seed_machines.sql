


INSERT INTO machines (area_id, line_id, machine_code, machine_name, machine_type, sub_label) VALUES
  (1, (SELECT id FROM lines WHERE line_name='Line A' AND area_id=1), 'RVS-A',  'RVS A',  'RVS',  'Mesin Filling Sachet RVS 6 line (A)'),
  (1, (SELECT id FROM lines WHERE line_name='Line B' AND area_id=1), 'RVS-B',  'RVS B',  'RVS',  'Mesin Filling Sachet RVS 6 line (B)'),
  (1, (SELECT id FROM lines WHERE line_name='Line C' AND area_id=1), 'TOYO-C', 'TOYO C', 'TOYO', 'Mesin Filling Sachet TOYO 10 line (C)'),
  (1, (SELECT id FROM lines WHERE line_name='Line D' AND area_id=1), 'RVS-D',  'RVS D',  'RVS',  'Mesin Filling Sachet RVS 6 line (D)'),
  (1, (SELECT id FROM lines WHERE line_name='Line E' AND area_id=1), 'RVS-E',  'RVS E',  'RVS',  'Mesin Filling Sachet RVS 6 line (E)'),
  (1, (SELECT id FROM lines WHERE line_name='Line F' AND area_id=1), 'RVS-F',  'RVS F',  'RVS',  'Mesin Filling Sachet RVS 6 line (F)'),
  (1, (SELECT id FROM lines WHERE line_name='Line G' AND area_id=1), 'RVS-G',  'RVS G',  'RVS',  'Mesin Filling Sachet RVS 6 line (G)'),
  (1, (SELECT id FROM lines WHERE line_name='Line H' AND area_id=1), 'RVS-H',  'RVS H',  'RVS',  'Mesin Filling Sachet RVS 6 line (H)'),
  (1, (SELECT id FROM lines WHERE line_name='Line J' AND area_id=1), 'RVS-J',  'RVS J',  'RVS',  'Mesin Filling Sachet RVS 6 line (J)'),
  (1, (SELECT id FROM lines WHERE line_name='Line K' AND area_id=1), 'RVS-K',  'RVS K',  'RVS',  'Mesin Filling Sachet RVS 6 line (K)'),
  (1, (SELECT id FROM lines WHERE line_name='Line L' AND area_id=1), 'RVS-L',  'RVS L',  'RVS',  'Mesin Filling Sachet RVS 6 line (L)'),
  (1, (SELECT id FROM lines WHERE line_name='Line M' AND area_id=1), 'RVS-M',  'RVS M',  'RVS',  'Mesin Filling Sachet RVS 6 line (M)'),
  (1, (SELECT id FROM lines WHERE line_name='Line N' AND area_id=1), 'RVS-N',  'RVS N',  'RVS',  'Mesin Filling Sachet RVS 6 line (N)'),
  (1, (SELECT id FROM lines WHERE line_name='Line S' AND area_id=1), 'RVS-S',  'RVS S',  'RVS',  'Mesin Filling Sachet RVS 6 line (S)'),
  (1, (SELECT id FROM lines WHERE line_name='Line T' AND area_id=1), 'RVS-T',  'RVS T',  'RVS',  'Mesin Filling Sachet RVS 6 line (T)'),
  (1, (SELECT id FROM lines WHERE line_name='Line P' AND area_id=1), 'RVS-P',  'RVS P',  'RVS',  'Mesin Filling Sachet RVS 6 line (P)');

-- MF (Stickpack) — tidak terikat line
INSERT INTO machines (area_id, machine_code, machine_name, machine_type, sub_label) VALUES
  (1, 'MF-1', 'MF 1', 'MF', 'Mesin Filling Stickpack (V)'),
  (1, 'MF-2', 'MF 2', 'MF', 'Mesin Filling Stickpack (W)');

-- ─── LANTAI 2 — Compounding (Batching Station) ────────────────────────────────
-- 9 Batching Station, masing-masing 1 jalur (P01)

INSERT INTO machines (area_id, machine_code, machine_name, machine_type, sub_label) VALUES
  (2, 'K1T1', 'Batching Station Sodium Bicarbonate 1', 'TS', 'Compounding - Lantai 2'),
  (2, 'K1T2', 'Batching Station Sodium Bicarbonate 2', 'TS', 'Compounding - Lantai 2'),
  (2, 'K1T3', 'Batching Station Minor 1',              'TS', 'Compounding - Lantai 2'),
  (2, 'K1T4', 'Batching Station Minor Active',         'TS', 'Compounding - Lantai 2'),
  (2, 'K1T5', 'Batching Station Minor 2',              'TS', 'Compounding - Lantai 2'),
  (2, 'K1T6', 'Batching Station Minor 3',              'TS', 'Compounding - Lantai 2'),
  (2, 'K1T7', 'Batching Station Citric',               'TS', 'Compounding - Lantai 2'),
  (2, 'K1T8', 'Batching Station Sucrose',              'TS', 'Compounding - Lantai 2'),
  (2, 'K1T9', 'Batching Station Material 4',           'TS', 'Compounding - Lantai 2');

INSERT INTO machine_parts (machine_id, part_code, part_name, urutan) VALUES
  ((SELECT id FROM machines WHERE machine_code='K1T1'), 'K1T1P01', 'K1T1P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1T2'), 'K1T2P01', 'K1T2P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1T3'), 'K1T3P01', 'K1T3P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1T4'), 'K1T4P01', 'K1T4P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1T5'), 'K1T5P01', 'K1T5P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1T6'), 'K1T6P01', 'K1T6P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1T7'), 'K1T7P01', 'K1T7P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1T8'), 'K1T8P01', 'K1T8P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1T9'), 'K1T9P01', 'K1T9P01', 1);

-- ─── LANTAI 2 — Compounding (Discharge Station) ───────────────────────────────
-- 25 Discharge Station, masing-masing 1 jalur (P01)

INSERT INTO machines (area_id, machine_code, machine_name, machine_type, sub_label) VALUES
  (2, 'K1G1',  'Discharge Station 1 (A)',      'DS', 'Compounding - Lantai 2'),
  (2, 'K1G2',  'Discharge Station 2 (B)',      'DS', 'Compounding - Lantai 2'),
  (2, 'K1G3',  'Discharge Station 3 (C)',      'DS', 'Compounding - Lantai 2'),
  (2, 'K1G4',  'Discharge Station 4 (D)',      'DS', 'Compounding - Lantai 2'),
  (2, 'K1G5',  'Discharge Station 5 (E)',      'DS', 'Compounding - Lantai 2'),
  (2, 'K1G6',  'Discharge Station 6 (F)',      'DS', 'Compounding - Lantai 2'),
  (2, 'K1G7',  'Discharge Station 7 (G)',      'DS', 'Compounding - Lantai 2'),
  (2, 'K1G8',  'Discharge Station 8 (H)',      'DS', 'Compounding - Lantai 2'),
  (2, 'K1G9',  'Discharge Station 9 (J)',      'DS', 'Compounding - Lantai 2'),
  (2, 'K1G10', 'Discharge Station 10 (K)',     'DS', 'Compounding - Lantai 2'),
  (2, 'K1G11', 'Discharge Station 11 (L)',     'DS', 'Compounding - Lantai 2'),
  (2, 'K1G12', 'Discharge Station 12 (M)',     'DS', 'Compounding - Lantai 2'),
  (2, 'K1G13', 'Discharge Station 13 (N)',     'DS', 'Compounding - Lantai 2'),
  (2, 'K1G14', 'Discharge Station 14 (S)',     'DS', 'Compounding - Lantai 2'),
  (2, 'K1G15', 'Discharge Station 15',         'DS', 'Compounding - Lantai 2'),
  (2, 'K1G16', 'Discharge Station 16 (R)',     'DS', 'Compounding - Lantai 2'),
  (2, 'K1G17', 'Discharge Station 17',         'DS', 'Compounding - Lantai 2'),
  (2, 'K1G18', 'Discharge Station 18 (MF2)',   'DS', 'Compounding - Lantai 2'),
  (2, 'K1G19', 'Discharge Station 19 (MF1)',   'DS', 'Compounding - Lantai 2'),
  (2, 'K1G20', 'Discharge Station 20 (T)',     'DS', 'Compounding - Lantai 2'),
  (2, 'K1G21', 'Discharge Station 21',         'DS', 'Compounding - Lantai 2'),
  (2, 'K1G22', 'Discharge Station 22 (Flavor)','DS', 'Compounding - Lantai 2'),
  (2, 'K1G23', 'Discharge Station 23 (P)',     'DS', 'Compounding - Lantai 2'),
  (2, 'K1G24', 'Discharge Station 24',         'DS', 'Compounding - Lantai 2'),
  (2, 'K1G25', 'Discharge Station 25',         'DS', 'Compounding - Lantai 2');

INSERT INTO machine_parts (machine_id, part_code, part_name, urutan) VALUES
  ((SELECT id FROM machines WHERE machine_code='K1G1'),  'K1G1P01',  'K1G1P01',  1),
  ((SELECT id FROM machines WHERE machine_code='K1G2'),  'K1G2P01',  'K1G2P01',  1),
  ((SELECT id FROM machines WHERE machine_code='K1G3'),  'K1G3P01',  'K1G3P01',  1),
  ((SELECT id FROM machines WHERE machine_code='K1G4'),  'K1G4P01',  'K1G4P01',  1),
  ((SELECT id FROM machines WHERE machine_code='K1G5'),  'K1G5P01',  'K1G5P01',  1),
  ((SELECT id FROM machines WHERE machine_code='K1G6'),  'K1G6P01',  'K1G6P01',  1),
  ((SELECT id FROM machines WHERE machine_code='K1G7'),  'K1G7P01',  'K1G7P01',  1),
  ((SELECT id FROM machines WHERE machine_code='K1G8'),  'K1G8P01',  'K1G8P01',  1),
  ((SELECT id FROM machines WHERE machine_code='K1G9'),  'K1G9P01',  'K1G9P01',  1),
  ((SELECT id FROM machines WHERE machine_code='K1G10'), 'K1G10P01', 'K1G10P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G11'), 'K1G11P01', 'K1G11P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G12'), 'K1G12P01', 'K1G12P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G13'), 'K1G13P01', 'K1G13P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G14'), 'K1G14P01', 'K1G14P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G15'), 'K1G15P01', 'K1G15P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G16'), 'K1G16P01', 'K1G16P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G17'), 'K1G17P01', 'K1G17P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G18'), 'K1G18P01', 'K1G18P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G19'), 'K1G19P01', 'K1G19P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G20'), 'K1G20P01', 'K1G20P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G21'), 'K1G21P01', 'K1G21P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G22'), 'K1G22P01', 'K1G22P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G23'), 'K1G23P01', 'K1G23P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G24'), 'K1G24P01', 'K1G24P01', 1),
  ((SELECT id FROM machines WHERE machine_code='K1G25'), 'K1G25P01', 'K1G25P01', 1);

-- ─── LANTAI 3 — Compounding (Tipping & Dumping Station) ──────────────────────
-- 1 mesin dengan 8 jalur K1R sebagai machine_parts

INSERT INTO machines (area_id, machine_code, machine_name, machine_type, sub_label) VALUES
  (3, 'TS-K1R', 'Tipping & Dumping Station', 'K1R', 'Compounding - Lantai 3');

INSERT INTO machine_parts (machine_id, part_code, part_name, urutan) VALUES
  ((SELECT id FROM machines WHERE machine_code='TS-K1R'), 'K1R1P01DP001', 'Tipping Station Minor 1',            1),
  ((SELECT id FROM machines WHERE machine_code='TS-K1R'), 'K1R2P01DP001', 'Tipping Station Minor 2',            2),
  ((SELECT id FROM machines WHERE machine_code='TS-K1R'), 'K1R2P01DP002', 'Tipping Station Honeydew',           3),
  ((SELECT id FROM machines WHERE machine_code='TS-K1R'), 'K1R3P01DP001', 'Dumping Station Sodium Bicarbonate', 4),
  ((SELECT id FROM machines WHERE machine_code='TS-K1R'), 'K1R4P01DP001', 'Tipping Station Minor 3 (Active)',   5),
  ((SELECT id FROM machines WHERE machine_code='TS-K1R'), 'K1R6P01DP001', 'Dumping Station Taurine',            6),
  ((SELECT id FROM machines WHERE machine_code='TS-K1R'), 'K1R7P01DP001', 'Dumping Station Citric Acid',        7),
  ((SELECT id FROM machines WHERE machine_code='TS-K1R'), 'K1R8P01DP002', 'Tipping Station Sucrose',            8);

-- ─── LANTAI 4 — Compounding (Weighing) ───────────────────────────────────────
-- Weighing Booth: 3 mesin individual (dibersihkan terpisah)
-- Peralatan Timbang: 1 mesin, 15 Centong sebagai machine_parts

INSERT INTO machines (area_id, machine_code, machine_name, machine_type, sub_label) VALUES
  (4, 'WB-1',       'Weighing Booth 1',  'WB', 'Compounding - Lantai 4'),
  (4, 'WB-2',       'Weighing Booth 2',  'WB', 'Compounding - Lantai 4'),
  (4, 'WB-3',       'Weighing Booth 3',  'WB', 'Compounding - Lantai 4'),
  (4, 'PT-CENTONG', 'Peralatan Timbang', 'WB', 'Compounding - Lantai 4');

INSERT INTO machine_parts (machine_id, part_code, part_name, urutan) VALUES
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-1',  'Centong 1',  1),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-2',  'Centong 2',  2),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-3',  'Centong 3',  3),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-4',  'Centong 4',  4),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-5',  'Centong 5',  5),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-6',  'Centong 6',  6),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-7',  'Centong 7',  7),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-8',  'Centong 8',  8),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-9',  'Centong 9',  9),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-10', 'Centong 10', 10),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-11', 'Centong 11', 11),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-12', 'Centong 12', 12),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-13', 'Centong 13', 13),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-14', 'Centong 14', 14),
  ((SELECT id FROM machines WHERE machine_code='PT-CENTONG'), 'CENTONG-15', 'Centong 15', 15);

-- ─── Init cleaning schedule untuk semua mesin ─────────────────────────────────
INSERT INTO cleaning_schedule (machine_id)
SELECT id FROM machines WHERE is_active = TRUE;
