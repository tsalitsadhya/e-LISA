import { useState, useEffect } from 'react'
import { Shield, CheckCircle, Clock, AlertCircle, ChevronRight, Plus, FileText, Wrench } from 'lucide-react'
import api from '../lib/api'

const FLOOR_DEFS = [
  { id: '1',   label: '1st Floor',    floors: [1],       area: 'Filling Area' },
  { id: '234', label: '2, 3, 4 Floor', floors: [2,3,4], area: 'Compounding Area' },
]

// ─── Floor Selection Screen ───────────────────────────────────────────
function FloorSelector({ onSelect, allMachines, loading }) {
  return (
    <div style={S.page}>
      <p style={S.checkTxt}>Check the line clearance and production readiness status</p>

      <div style={S.floorList}>
        {FLOOR_DEFS.map(f => {
          const machines = allMachines.filter(m => f.floors.includes(m.floor))
          const ready = machines.filter(m => m.status === 'safe').length
          const delayed = machines.filter(m => ['overdue', 'due'].includes(m.status)).length

          return (
            <div key={f.id} style={S.floorCard}>
              <div style={S.shieldWrap}>
                <Shield size={54} color="#034586" />
                <span style={S.spark}>✦</span>
              </div>
              <div style={S.floorLabel}>{f.label}</div>
              <div style={S.floorArea}>{f.area}</div>

              {loading ? (
                <div style={S.floorSub}>Loading…</div>
              ) : (
                <div style={S.floorBadges}>
                  <span style={S.badgeGreen}>{ready} Ready</span>
                  {delayed > 0 && <span style={S.badgeRed}>{delayed} Delayed</span>}
                  <span style={S.badgeGray}>{machines.length} Total</span>
                </div>
              )}

              <button style={S.nextBtn} onClick={() => onSelect(f.id)}>
                View Details →
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Dashboard Detail Screen ──────────────────────────────────────────
function DashboardDetail({ floorDef, allMachines, pendingReviews, loading, bmsLines, bmsLoading, bmsError, onBack, onNavigate }) {
  const machines = allMachines.filter(m => floorDef.floors.includes(m.floor))
  const [selectedLine, setSelectedLine] = useState('')

  const activeLine      = bmsLines.find(l => l.line_id === selectedLine) ?? null
  const isLantai1       = floorDef.id === '1'

  // Machine stats: when line selected (lantai 1 only), filter to that line
  const displayMachines = (isLantai1 && activeLine)
    ? machines.filter(m => m.line_name === activeLine.display_name)
    : machines
  const ready   = displayMachines.filter(m => m.status === 'safe').length
  const delayed = displayMachines.filter(m => ['overdue', 'due'].includes(m.status)).length
  const total   = displayMachines.length
  const machSrc = activeLine ? `Lantai 1 · ${activeLine.display_name}` : floorDef.area

  // BMS summary
  const bmsReady  = bmsLines.filter(l => l.status === 'ready').length
  const bmsWarn   = bmsLines.filter(l => l.status === 'warning').length
  const bmsOut    = bmsLines.filter(l => l.status === 'out_of_spec').length
  const bmsNoData = bmsLines.filter(l => l.status === 'no_data').length

  // Room OK: specific line if selected, else all lines clear; only matters for Lantai 1
  const isRoomOk = !isLantai1 || (
    !bmsError && bmsLines.length > 0 && (
      activeLine ? activeLine.status === 'ready' : bmsOut === 0 && bmsWarn === 0
    )
  )
  const isReady = delayed === 0 && pendingReviews === 0 && isRoomOk

  return (
    <div style={S.page}>
      <p style={S.checkTxt}>Check the line clearance and production readiness status</p>

      {/* ── Line Filter (Lantai 1 only) ── */}
      {isLantai1 && !bmsLoading && !bmsError && bmsLines.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, background: '#fff', padding: '10px 16px', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>Filter Line:</span>
          <select
            value={selectedLine}
            onChange={e => setSelectedLine(e.target.value)}
            style={{ fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer', outline: 'none', fontFamily: 'inherit', minWidth: 160 }}
          >
            <option value="">Semua Line (Lantai 1)</option>
            {bmsLines.map(l => <option key={l.line_id} value={l.line_id}>{l.display_name}</option>)}
          </select>
          {selectedLine && (
            <button onClick={() => setSelectedLine('')} style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
              Reset
            </button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>Filter ini berlaku untuk Lantai 1 (BMS + mesin)</span>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div style={S.summaryGrid}>

        {/* Room Readiness */}
        <div style={S.roomCard}>
          <div style={S.cardTitle}>Room Readiness Summary</div>
          <div style={S.cardSrc}>{activeLine ? activeLine.display_name : 'Filling 1–24'} · Lantai 1 (ICONICS BMS)</div>
          <div style={S.innerBox}>
            {!isLantai1 ? (
              <div style={{ color: '#64748b', fontSize: 12, padding: '4px 0' }}>BMS hanya tersedia untuk Lantai 1</div>
            ) : bmsLoading ? (
              <div style={{ color: '#64748b', fontSize: 13, padding: '8px 0' }}>Menghubungkan ke BMS…</div>
            ) : bmsError ? (
              <div style={{ fontSize: 12, color: '#ef4444', padding: '4px 0' }}>BMS tidak tersedia — cek koneksi ICONICS</div>
            ) : activeLine ? (
              [
                { icon: '🌡', label: 'Temperature:', sensor: activeLine.temperature, unit: '°C' },
                { icon: '💧', label: 'Humidity:',    sensor: activeLine.humidity,    unit: '%' },
              ].map(({ icon, label, sensor, unit }) => {
                const cfg = BMS_STATUS_CFG[sensor.status] ?? BMS_STATUS_CFG.no_data
                return (
                  <div key={label} style={S.sensorRow}>
                    <span style={S.sensorIcon}>{icon}</span>
                    <span style={S.sensorLabel}>{label}</span>
                    <span style={S.sensorVal}>{sensor.value != null ? `${sensor.value.toFixed(1)}${unit}` : '—'}</span>
                    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6 }}>
                      {cfg.label.toUpperCase()}
                    </span>
                  </div>
                )
              })
            ) : (
              <>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {[
                    { count: bmsReady,  key: 'ready' },
                    { count: bmsWarn,   key: 'warning' },
                    { count: bmsOut,    key: 'out_of_spec' },
                    { count: bmsNoData, key: 'no_data' },
                  ].filter(x => x.count > 0).map(({ count, key }) => {
                    const cfg = BMS_STATUS_CFG[key]
                    return (
                      <span key={key} style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99 }}>
                        {count} {cfg.label}
                      </span>
                    )
                  })}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{bmsLines.length} lines monitored</div>
              </>
            )}
          </div>
          <button style={S.whiteBtn} onClick={() => onNavigate?.('/room-readiness')}>
            View Room Details
          </button>
        </div>

        {/* Machine Readiness */}
        <div style={S.machCard}>
          <div style={S.cardTitle}>Machine Readiness Summary</div>
          <div style={S.cardSrc}>{machSrc}</div>
          <div style={S.innerBox}>
            {loading ? (
              <div style={{ color: '#64748b', fontSize: 13, padding: 8 }}>Loading…</div>
            ) : (
              <>
                <div style={S.machRow}>
                  <div style={S.machIcoGreen}><Wrench size={14} color="#fff" /></div>
                  <span style={S.machCount}>{ready}/{total}</span>
                  <span style={S.machLabelGreen}>Ready</span>
                </div>
                <div style={S.machRow}>
                  <div style={S.machIcoRed}><Clock size={14} color="#fff" /></div>
                  <span style={S.machCount}>{delayed}</span>
                  <span style={S.machLabelRed}>Delayed</span>
                </div>
              </>
            )}
          </div>
          <button style={S.whiteBtn} onClick={() => onNavigate?.('/cleaning')}>
            View Cleaning Management
          </button>
        </div>
      </div>

      {/* ── Production Readiness ── */}
      <div style={S.prodCard}>
        <div style={S.prodHdr}>PRODUCTION READINESS TODAY</div>
        <div style={S.prodBody}>

          {/* Left */}
          <div style={S.prodLeft}>
            <div style={S.readyRow}>
              <div style={{ ...S.statusCircle, background: isReady ? '#16a34a' : '#f59e0b' }}>
                {isReady
                  ? <CheckCircle size={28} color="#fff" strokeWidth={2.5} />
                  : <Clock size={28} color="#fff" />}
              </div>
              <div>
                <div style={S.readyTxt}>{isReady ? 'READY' : 'IN PROGRESS'}</div>
                <div style={S.readySub}>{isReady ? 'Production can proceed' : 'Some tasks still pending'}</div>
              </div>
            </div>

            <div style={S.reasonBox}>
              <div style={S.reasonTitle}>Reason for readiness:</div>

              <div style={S.reasonRow}>
                {bmsError || bmsOut > 0 || bmsWarn > 0
                  ? <AlertCircle size={14} color={bmsOut > 0 ? '#dc2626' : '#f59e0b'} />
                  : <CheckCircle size={14} color="#16a34a" strokeWidth={2.5} />}
                <span style={S.reasonTxt}>
                  <b>Room readiness:</b>{' '}
                  {bmsLoading
                    ? <span style={{ color: '#94a3b8' }}>Checking BMS…</span>
                    : bmsError
                    ? <span style={{ color: '#94a3b8' }}>BMS tidak tersedia</span>
                    : bmsOut > 0
                    ? <span style={{ color: '#dc2626' }}>{bmsOut} line(s) out of spec</span>
                    : bmsWarn > 0
                    ? <span style={{ color: '#f59e0b' }}>{bmsWarn} line(s) in warning</span>
                    : <span style={{ color: '#16a34a' }}>All {bmsLines.length} lines GREEN</span>}
                </span>
              </div>

              <div style={S.reasonRow}>
                {delayed === 0
                  ? <CheckCircle size={14} color="#16a34a" strokeWidth={2.5} />
                  : <AlertCircle size={14} color="#f59e0b" />}
                <span style={S.reasonTxt}>
                  <b>Machine readiness:</b>{' '}
                  {delayed === 0
                    ? <span style={{ color: '#16a34a' }}>All cleaning tasks completed &amp; verified OK</span>
                    : <span style={{ color: '#f59e0b' }}>{delayed} machine(s) need attention</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Right Stats */}
          <div style={S.prodRight}>
            <div style={S.statRow}>
              <div style={{ ...S.statIco, background: '#e0f2fe' }}>
                <AlertCircle size={15} color="#0369a1" />
              </div>
              <span style={S.statLabel}>Pending reviews</span>
              <span style={S.statNum}>{loading ? '…' : pendingReviews}</span>
              <ChevronRight size={14} color="#94a3b8" />
            </div>

            <div style={S.statRow}>
              <div style={{ ...S.statIco, background: '#fef3c7' }}>
                <Wrench size={15} color="#d97706" />
              </div>
              <span style={S.statLabel}>Maintenance requests</span>
              <span style={S.statNum}>0</span>
              <ChevronRight size={14} color="#94a3b8" />
            </div>

            <div style={S.statRow}>
              <div style={{ ...S.statIco, background: '#fee2e2' }}>
                <AlertCircle size={15} color="#dc2626" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={S.statLabel}>Alerts</div>
                {delayed > 0 && <div style={{ fontSize: 10, color: '#94a3b8' }}>Machine overdue threshold</div>}
              </div>
              <span style={S.statNum}>{loading ? '…' : delayed}</span>
              <ChevronRight size={14} color="#94a3b8" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Shortcuts ── */}
      <div style={S.shortCard}>
        <div style={S.shortTitle}>Shortcuts</div>
        <div style={S.shortGrid}>
          <div style={S.shortItem}>
            <div style={S.shortHdr}>
              <div style={{ ...S.shortIco, background: '#dbeafe' }}>
                <FileText size={18} color="#1d4ed8" />
              </div>
              <span>Cleaning record</span>
            </div>
            <div style={S.shortSub}>Record a cleaning for each machine</div>
            <button style={S.addBtn} onClick={() => onNavigate?.('/cleaning')}>
              <Plus size={13} /> Add
            </button>
          </div>

          <div style={S.shortItem}>
            <div style={S.shortHdr}>
              <div style={{ ...S.shortIco, background: '#fee2e2' }}>
                <FileText size={18} color="#dc2626" />
              </div>
              <span>Generate report</span>
            </div>
            <div style={S.shortSub}>Make a report to maintain the production readiness</div>
            <button style={S.createBtn}>
              <FileText size={12} color="#1d4ed8" /> Create
            </button>
          </div>
        </div>
      </div>

      <button style={S.backBtn} onClick={onBack}>← Back to Floor Selection</button>
    </div>
  )
}

const BMS_STATUS_CFG = {
  ready:       { bg: '#dcfce7', color: '#15803d', label: 'Ready' },
  warning:     { bg: '#fef9c3', color: '#854d0e', label: 'Warning' },
  out_of_spec: { bg: '#fee2e2', color: '#b91c1c', label: 'Out of Spec' },
  no_data:     { bg: '#f1f5f9', color: '#64748b', label: 'No Data' },
}

// ─── Main Component ───────────────────────────────────────────────────
export default function DashboardUserPage({ role, onNavigate }) {
  const [floor,          setFloor]          = useState(null)
  const [allMachines,    setAllMachines]    = useState([])
  const [pendingReviews, setPendingReviews] = useState(0)
  const [loading,        setLoading]        = useState(true)
  const [bmsLines,       setBmsLines]       = useState([])
  const [bmsLoading,     setBmsLoading]     = useState(true)
  const [bmsError,       setBmsError]       = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const [schedRes, recordsRes] = await Promise.all([
          api.get('/cleaning/schedule'),
          api.get('/cleaning/records', { params: { status: 'waiting_qa', per_page: 1 } }),
        ])
        setAllMachines(schedRes.data?.data ?? [])
        setPendingReviews(recordsRes.data?.total ?? 0)
      } catch (e) {
        console.error('Dashboard fetch error:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    api.get('/room/bms')
      .then(r => { setBmsLines(r.data?.data ?? []); setBmsError(false) })
      .catch(() => setBmsError(true))
      .finally(() => setBmsLoading(false))
  }, [])

  const selectedFloorDef = FLOOR_DEFS.find(f => f.id === floor) ?? null

  if (!selectedFloorDef) {
    return (
      <FloorSelector
        onSelect={setFloor}
        allMachines={allMachines}
        loading={loading}
      />
    )
  }

  return (
    <DashboardDetail
      floorDef={selectedFloorDef}
      allMachines={allMachines}
      pendingReviews={pendingReviews}
      loading={loading}
      bmsLines={bmsLines}
      bmsLoading={bmsLoading}
      bmsError={bmsError}
      onBack={() => setFloor(null)}
      onNavigate={onNavigate}
    />
  )
}

// ─── Styles ───────────────────────────────────────────────────────────
const S = {
  page: { padding: '18px 24px', background: '#e8eef7', minHeight: '100%' },
  checkTxt: { fontSize: 13, fontWeight: 600, color: '#1a2744', marginBottom: 16 },

  // Floor selection
  floorList: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420, margin: '0 auto' },
  floorCard: { background: '#fff', borderRadius: 12, padding: '28px 32px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  shieldWrap: { position: 'relative', display: 'inline-block', marginBottom: 12 },
  spark: { position: 'absolute', top: -6, right: -12, color: '#f59e0b', fontSize: 18 },
  floorLabel: { fontSize: 20, fontWeight: 700, color: '#1a2744', marginBottom: 2 },
  floorArea:  { fontSize: 12, color: '#94a3b8', marginBottom: 12 },
  floorSub:   { fontSize: 12, color: '#94a3b8', marginBottom: 14 },
  floorBadges: { display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 },
  badgeGreen: { background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99 },
  badgeRed:   { background: '#fee2e2', color: '#b91c1c', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99 },
  badgeGray:  { background: '#f1f5f9', color: '#64748b', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99 },
  nextBtn: { background: '#034586', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', width: '100%', cursor: 'pointer', fontSize: 14, fontWeight: 600 },

  // Summary grid
  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },

  roomCard: { background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', padding: '16px 18px', borderRadius: 12 },
  machCard: { background: 'linear-gradient(135deg, #5c7fa8 0%, #3b5f88 100%)', padding: '16px 18px', borderRadius: 12 },

  cardTitle: { color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 2 },
  cardSrc:   { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginBottom: 10 },

  innerBox: { background: '#fff', borderRadius: 8, padding: '10px 12px', marginBottom: 12, minHeight: 70 },

  sensorRow:   { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
  sensorIcon:  { fontSize: 16, flexShrink: 0 },
  sensorLabel: { flex: 1, fontSize: 13, color: '#374151' },
  sensorVal:   { fontWeight: 700, fontSize: 13 },
  badgePending: { background: '#94a3b8', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 },

  machRow:       { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  machIcoGreen:  { width: 26, height: 26, borderRadius: 6, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  machIcoRed:    { width: 26, height: 26, borderRadius: 6, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  machCount:     { fontSize: 18, fontWeight: 700, color: '#1a2744' },
  machLabelGreen: { fontSize: 13, color: '#16a34a', fontWeight: 600 },
  machLabelRed:   { fontSize: 13, color: '#ef4444', fontWeight: 600 },

  whiteBtn: { background: '#fff', border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#1a2744' },

  // Production readiness
  prodCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  prodHdr:  { background: '#f1f5f9', padding: '11px 18px', fontWeight: 700, fontSize: 13, color: '#1a2744', letterSpacing: 0.3 },
  prodBody: { display: 'grid', gridTemplateColumns: '1fr auto', gap: 0, padding: 0 },

  prodLeft: { padding: '18px 20px' },
  readyRow: { display: 'flex', gap: 14, marginBottom: 14, alignItems: 'center' },
  statusCircle: { width: 46, height: 46, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  readyTxt: { fontSize: 22, fontWeight: 800, color: '#1a2744' },
  readySub: { fontSize: 12, color: '#64748b' },

  reasonBox:   { background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' },
  reasonTitle: { fontWeight: 700, fontSize: 12, color: '#374151', marginBottom: 8 },
  reasonRow:   { display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  reasonTxt:   { fontSize: 12, color: '#374151' },

  prodRight: {
    borderLeft: '1px solid #e2e8f0', padding: '18px 16px',
    display: 'flex', flexDirection: 'column', gap: 10, minWidth: 240,
  },
  statRow:   { display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '8px 10px', borderRadius: 8 },
  statIco:   { width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statLabel: { flex: 1, fontSize: 12, color: '#374151' },
  statNum:   { fontWeight: 700, fontSize: 14, color: '#1a2744', minWidth: 20, textAlign: 'right' },

  // Shortcuts
  shortCard:  { background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  shortTitle: { fontWeight: 700, fontSize: 14, color: '#1a2744', marginBottom: 12 },
  shortGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  shortItem:  { border: '1px solid #e2e8f0', padding: '14px', borderRadius: 10 },
  shortHdr:   { display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 13, color: '#1a2744', marginBottom: 6 },
  shortIco:   { width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  shortSub:   { fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 1.5 },
  addBtn:    { border: '1px solid #1d4ed8', background: '#fff', color: '#1d4ed8', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  createBtn: { border: '1px solid #e2e8f0', background: '#fff', color: '#374151', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },

  backBtn: { marginTop: 14, border: '1px solid #94a3b8', background: 'transparent', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#64748b' },
}
