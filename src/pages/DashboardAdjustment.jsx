import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, XCircle, RotateCcw, Thermometer, Droplets, Clock, AlertCircle } from 'lucide-react'
import api from '../lib/api'

/* ── Line status logic ─────────────────────────────────────────────────
   Given machines in a line, compute overall readiness:
   - "ready"    = all machines are "safe"
   - "amc"      = some "due" but none "overdue"
   - "notready" = any "overdue"
   - "waiting"  = any "waiting_qa" (being verified)
──────────────────────────────────────────────────────────────────────── */
function computeLineStatus(machines) {
  if (machines.some(m => m.status === 'overdue'))    return 'notready'
  if (machines.some(m => m.status === 'waiting_qa')) return 'waiting'
  if (machines.some(m => m.status === 'due'))        return 'amc'
  return 'ready'
}

const STATUS_COLOR = {
  ready:    '#16a34a',
  amc:      '#f59e0b',
  notready: '#ef4444',
  waiting:  '#6366f1',
}

const STATUS_LABEL = {
  ready:    'Siap produksi',
  amc:      'Perlu perhatian (AMC)',
  notready: 'Tidak siap produksi',
  waiting:  'Menunggu verifikasi QA',
}

const MACHINE_STATUS_STYLE = {
  safe:        { bg: '#dcfce7', color: '#15803d', label: 'Siap' },
  due:         { bg: '#fef9c3', color: '#854d0e', label: 'Due' },
  overdue:     { bg: '#fee2e2', color: '#b91c1c', label: 'Overdue' },
  waiting_qa:  { bg: '#e0e7ff', color: '#4338ca', label: 'Waiting QA' },
  inprogress:  { bg: '#e0f2fe', color: '#0369a1', label: 'In Progress' },
}

const BMS_ROOM_CFG = {
  ready:       { color: '#16a34a', bg: '#dcfce7', label: 'READY',        pill: '#dcfce7', pillText: '#15803d' },
  warning:     { color: '#d97706', bg: '#fffbeb', label: 'WARNING',      pill: '#fef9c3', pillText: '#854d0e' },
  out_of_spec: { color: '#dc2626', bg: '#fef2f2', label: 'OUT OF SPEC',  pill: '#fee2e2', pillText: '#b91c1c' },
  no_data:     { color: '#6b7280', bg: '#f9fafb', label: 'NO DATA',      pill: '#f1f5f9', pillText: '#6b7280' },
}

export default function DashboardAdjustment() {
  const [mode,          setMode]         = useState('all')
  const [selectedLine,  setSelectedLine] = useState(null)
  const [allMachines,   setAllMachines]  = useState([])
  const [loading,       setLoading]      = useState(true)
  const [error,         setError]        = useState('')
  const [lastFetch,     setLastFetch]    = useState(null)
  const [bmsLines,      setBmsLines]     = useState([])
  const [bmsLoading,    setBmsLoading]   = useState(true)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/cleaning/schedule')
      setAllMachines(res.data?.data ?? [])
      setLastFetch(new Date())
    } catch {
      setError('Gagal memuat data. Pastikan server berjalan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    api.get('/room/bms')
      .then(r => setBmsLines(r.data?.data ?? []))
      .catch(() => setBmsLines([]))
      .finally(() => setBmsLoading(false))
  }, [])

  // Hanya lantai 1 (RVS & Toyo) — lantai 2/3/4 dari e-AM monitoring (belum tersedia)
  const floor1Machines = allMachines.filter(m => m.floor === 1)

  // Group machines by line_name
  const lineMap = {}
  for (const m of floor1Machines) {
    const key = m.line_name || m.machine_code || m.machine_name
    if (!lineMap[key]) lineMap[key] = []
    lineMap[key].push(m)
  }

  const lines = Object.entries(lineMap).map(([name, machines]) => ({
    name,
    machines,
    status: computeLineStatus(machines),
    floor: machines[0]?.floor ?? 0,
  })).sort((a, b) => a.floor - b.floor || a.name.localeCompare(b.name))

  const countReady    = lines.filter(l => l.status === 'ready').length
  const countAmc      = lines.filter(l => l.status === 'amc').length
  const countWaiting  = lines.filter(l => l.status === 'waiting').length
  const countNotReady = lines.filter(l => l.status === 'notready').length

  const selectedLineData = lines.find(l => l.name === selectedLine)

  // Auto-select first line when switching to per-line mode
  const handlePerLine = () => {
    if (!selectedLine && lines.length > 0) setSelectedLine(lines[0].name)
    setMode('perline')
  }

  const handleDotClick = (lineName) => {
    setSelectedLine(lineName)
    setMode('perline')
  }

  return (
    <div style={S.page}>

      {/* ── Tabs ── */}
      <div style={S.tabs}>
        <button style={mode === 'all' ? { ...S.tabBtn, ...S.activeTab } : S.tabBtn}
          onClick={() => setMode('all')}>
          Semua Line
        </button>
        <button style={mode === 'perline' ? { ...S.tabBtn, ...S.activeTab } : S.tabBtn}
          onClick={handlePerLine}>
          Dashboard Per Line
        </button>
        <button style={S.refreshBtn} onClick={fetchData} title="Refresh data">
          <RotateCcw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {lastFetch && (
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              {lastFetch.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={S.errorBox}>
          {error}
          <button style={S.retryBtn} onClick={fetchData}>Retry</button>
        </div>
      )}

      {/* ── MODE: SEMUA LINE ── */}
      {mode === 'all' && (
        <>
          {/* Summary cards */}
          <div style={S.summaryGrid}>
            <div style={S.summaryCard}>
              <div style={{ ...S.summIco, background: '#dcfce7' }}>
                <CheckCircle size={22} color="#16a34a" />
              </div>
              <div>
                <div style={{ ...S.summVal, color: '#16a34a' }}>
                  {loading ? '…' : countReady}
                </div>
                <div style={S.summLabel}>Line siap produksi</div>
              </div>
            </div>

            <div style={S.summaryCard}>
              <div style={{ ...S.summIco, background: '#fef9c3' }}>
                <AlertTriangle size={22} color="#f59e0b" />
              </div>
              <div>
                <div style={{ ...S.summVal, color: '#f59e0b' }}>
                  {loading ? '…' : countAmc + countWaiting}
                </div>
                <div style={S.summLabel}>Line perlu perhatian (AMC)</div>
              </div>
            </div>

            <div style={S.summaryCard}>
              <div style={{ ...S.summIco, background: '#fee2e2' }}>
                <XCircle size={22} color="#ef4444" />
              </div>
              <div>
                <div style={{ ...S.summVal, color: '#ef4444' }}>
                  {loading ? '…' : countNotReady}
                </div>
                <div style={S.summLabel}>Line tidak siap produksi</div>
              </div>
            </div>
          </div>

          {/* Line Readiness Grid */}
          <div style={S.lineCard}>
            <div style={S.lineHeader}>Line Readiness — klik line untuk lihat detail</div>

            {loading ? (
              <div style={S.loadingText}>Memuat data...</div>
            ) : lines.length === 0 ? (
              <div style={S.loadingText}>Tidak ada data.</div>
            ) : (
              <>
                {/* Group by floor */}
                {[...new Set(lines.map(l => l.floor))].sort().map(floor => {
                  const floorLines = lines.filter(l => l.floor === floor)
                  return (
                    <div key={floor} style={{ marginBottom: 18 }}>
                      <div style={S.floorLabel}>Lantai {floor}</div>
                      <div style={S.lineRow}>
                        <div style={S.lineHeaderCell}>Line</div>
                        {floorLines.map(l => (
                          <div key={l.name} style={S.lineCell}
                            title={l.name}
                            onClick={() => handleDotClick(l.name)}>
                            <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4, maxWidth: 48, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {l.name}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={S.lineRow}>
                        <div style={S.lineHeaderCell}>Readiness</div>
                        {floorLines.map(l => (
                          <div key={l.name} style={S.lineCell}>
                            <div
                              style={{ ...S.dot, background: STATUS_COLOR[l.status], cursor: 'pointer' }}
                              title={`${l.name}: ${STATUS_LABEL[l.status]}`}
                              onClick={() => handleDotClick(l.name)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Legend */}
                <div style={S.legend}>
                  {[
                    { color: '#16a34a', text: 'Siap produksi' },
                    { color: '#f59e0b', text: 'Masuk syarat AMC (suhu/RH belum ideal tapi masih toleransi)' },
                    { color: '#ef4444', text: 'Tidak siap — calling maintenance' },
                    { color: '#6366f1', text: 'Menunggu verifikasi QA' },
                  ].map(l => (
                    <div key={l.color} style={S.legendItem}>
                      <span style={{ ...S.legendDot, background: l.color }} />
                      <span style={{ fontSize: 12, color: '#374151' }}>{l.text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={S.infoBox}>
            💡 Klik salah satu dot line untuk melihat detail kesiapan mesin &amp; kondisi ruangan per line.
            <span style={{ display: 'block', marginTop: 4, color: '#78350f' }}>
              ⚠️ Dashboard ini hanya menampilkan <b>Lantai 1</b> (mesin RVS &amp; Toyo). Data lantai 2/3/4 akan tersedia setelah integrasi e-AM monitoring.
            </span>
          </div>
        </>
      )}

      {/* ── MODE: PER LINE ── */}
      {mode === 'perline' && (
        <>
          {/* Line selector */}
          <div style={S.selectorRow}>
            <label style={S.formLabel}>Pilih line:</label>
            <select
              value={selectedLine ?? ''}
              onChange={e => setSelectedLine(e.target.value)}
              style={S.select}>
              {lines.map(l => (
                <option key={l.name} value={l.name}>{l.name} — {STATUS_LABEL[l.status]}</option>
              ))}
            </select>
            <button style={S.refreshBtn2} onClick={fetchData}>
              <RotateCcw size={14} /> Refresh
            </button>
          </div>

          {selectedLineData && (
            <>
              {/* Line status banner */}
              <div style={{
                ...S.statusBox,
                background: selectedLineData.status === 'ready' ? '#dcfce7'
                  : selectedLineData.status === 'notready' ? '#fee2e2'
                  : '#fef9c3',
                borderLeft: `4px solid ${STATUS_COLOR[selectedLineData.status]}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {selectedLineData.status === 'ready'
                    ? <CheckCircle size={20} color="#16a34a" />
                    : selectedLineData.status === 'notready'
                    ? <XCircle size={20} color="#ef4444" />
                    : <AlertTriangle size={20} color="#f59e0b" />}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: STATUS_COLOR[selectedLineData.status] }}>
                      Line {selectedLineData.name} — {STATUS_LABEL[selectedLineData.status]}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {selectedLineData.machines.length} mesin terdaftar · Lantai {selectedLineData.floor}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-col detail */}
              <div style={S.grid2}>
                {/* Room Readiness */}
                {(() => {
                  const bmsLine = bmsLines.find(l => l.display_name === selectedLineData.name)
                  const roomCfg = bmsLine ? (BMS_ROOM_CFG[bmsLine.status] ?? BMS_ROOM_CFG.no_data) : null
                  return (
                    <div style={S.panel}>
                      <div style={S.panelHeader}>
                        <span>Room Readiness</span>
                        {bmsLoading
                          ? <span style={S.badgeGray}>BMS — Loading…</span>
                          : bmsLine
                          ? <span style={{ ...S.badgeGray, background: roomCfg.pill, color: roomCfg.pillText }}>{roomCfg.label}</span>
                          : <span style={S.badgeGray}>BMS — No Data</span>}
                      </div>
                      <div style={S.sensorRow2}>
                        <Thermometer size={18} color={bmsLine ? (BMS_ROOM_CFG[bmsLine.temperature.status]?.color ?? '#6b7280') : '#94a3b8'} />
                        <div style={{ flex: 1 }}>
                          <div style={S.bigText}>
                            {bmsLine?.temperature.value != null ? `${bmsLine.temperature.value.toFixed(1)}°C` : '—'}
                          </div>
                          <div style={S.smallText}>Syarat: ≤ 25°C · Warning: ≤ 27°C</div>
                        </div>
                        {bmsLine && (
                          <span style={{ background: BMS_ROOM_CFG[bmsLine.temperature.status]?.pill ?? '#f1f5f9', color: BMS_ROOM_CFG[bmsLine.temperature.status]?.pillText ?? '#6b7280', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                            {BMS_ROOM_CFG[bmsLine.temperature.status]?.label ?? 'NO DATA'}
                          </span>
                        )}
                        {!bmsLine && <span style={S.pillGray}>{bmsLoading ? '…' : 'No Data'}</span>}
                      </div>
                      <div style={S.sensorRow2}>
                        <Droplets size={18} color={bmsLine ? (BMS_ROOM_CFG[bmsLine.humidity.status]?.color ?? '#6b7280') : '#94a3b8'} />
                        <div style={{ flex: 1 }}>
                          <div style={S.bigText}>
                            {bmsLine?.humidity.value != null ? `${bmsLine.humidity.value.toFixed(1)}%` : '—'}
                          </div>
                          <div style={S.smallText}>Syarat: ≤ 65% RH · Warning: ≤ 70% RH</div>
                        </div>
                        {bmsLine && (
                          <span style={{ background: BMS_ROOM_CFG[bmsLine.humidity.status]?.pill ?? '#f1f5f9', color: BMS_ROOM_CFG[bmsLine.humidity.status]?.pillText ?? '#6b7280', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                            {BMS_ROOM_CFG[bmsLine.humidity.status]?.label ?? 'NO DATA'}
                          </span>
                        )}
                        {!bmsLine && <span style={S.pillGray}>{bmsLoading ? '…' : 'No Data'}</span>}
                      </div>
                    </div>
                  )
                })()}

                {/* Machine Readiness */}
                <div style={S.panel}>
                  <div style={S.panelHeader}>
                    <span>Machine Readiness</span>
                    <span style={S.badgeBlue}>e-LISA</span>
                  </div>
                  {selectedLineData.machines.map(m => {
                    const st = MACHINE_STATUS_STYLE[m.status] ?? { bg: '#f3f4f6', color: '#374151', label: m.status }
                    return (
                      <div key={m.id} style={S.machineRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                          <div style={{ ...S.machIco, background: st.bg }}>
                            {m.status === 'safe'
                              ? <CheckCircle size={13} color={st.color} />
                              : m.status === 'overdue'
                              ? <AlertCircle size={13} color={st.color} />
                              : <Clock size={13} color={st.color} />}
                          </div>
                          <div>
                            <div style={S.machineTitle}>{m.machine_name}</div>
                            <div style={S.machineDesc}>{m.machine_type} · {m.machine_code}</div>
                          </div>
                        </div>
                        <span style={{ ...S.pill, background: st.bg, color: st.color }}>{st.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

/* ── Styles ───────────────────────────────────────────────────────────── */
const S = {
  page: { padding: '18px 24px', background: '#e8eef7', minHeight: '100%' },

  tabs: { display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' },
  tabBtn: { padding: '9px 18px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  activeTab: { background: '#1a2744', color: '#fff', border: 'none' },
  refreshBtn: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12 },
  refreshBtn2: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13 },

  errorBox: { marginBottom: 14, padding: '10px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#b91c1c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  retryBtn: { border: 'none', background: 'none', cursor: 'pointer', color: '#b91c1c', textDecoration: 'underline', fontSize: 12 },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 },
  summaryCard: { background: '#fff', padding: '16px 20px', borderRadius: 12, display: 'flex', gap: 14, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  summIco: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  summVal: { fontSize: 28, fontWeight: 800, lineHeight: 1 },
  summLabel: { fontSize: 13, color: '#64748b', marginTop: 2 },

  lineCard: { background: '#fff', padding: '18px 20px', borderRadius: 12, marginBottom: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  lineHeader: { fontSize: 15, fontWeight: 700, color: '#1a2744', marginBottom: 16 },
  loadingText: { color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '24px 0' },

  floorLabel: { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  lineRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  lineHeaderCell: { fontSize: 12, fontWeight: 700, color: '#374151', minWidth: 70, alignSelf: 'center' },
  lineCell: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 52 },
  dot: { width: 20, height: 20, borderRadius: '50%', transition: 'transform 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },

  legend: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 12, borderTop: '1px solid #f1f5f9' },
  legendItem: { display: 'flex', gap: 8, alignItems: 'center' },
  legendDot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },

  infoBox: { padding: '12px 16px', background: '#fffbeb', borderRadius: 10, fontSize: 12, color: '#92400e', border: '1px solid #fde68a' },

  // Per line
  selectorRow: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 },
  formLabel: { fontSize: 13, fontWeight: 600, color: '#374151' },
  select: { padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, flex: 1, maxWidth: 360 },

  statusBox: { padding: '14px 16px', borderRadius: 10, marginBottom: 14 },

  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  panel: { background: '#fff', padding: '16px 18px', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, fontWeight: 700, fontSize: 14, color: '#1a2744' },

  badgeGray: { background: '#f1f5f9', color: '#6b7280', padding: '2px 8px', borderRadius: 6, fontSize: 11 },
  badgeBlue: { background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 6, fontSize: 11 },

  sensorRow2: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px', background: '#f8fafc', borderRadius: 8 },
  bigText: { fontSize: 18, fontWeight: 700, color: '#1a2744' },
  smallText: { fontSize: 11, color: '#6b7280' },
  pillGray: { background: '#f1f5f9', color: '#6b7280', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 },

  machineRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '10px', background: '#f8fafc', borderRadius: 8 },
  machIco: { width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  machineTitle: { fontWeight: 600, fontSize: 13 },
  machineDesc: { fontSize: 11, color: '#6b7280' },
  pill: { padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, flexShrink: 0 },
}
