import { useState } from 'react'
import TopBar from "../components/TopBar";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Bell,
  Thermometer,
  Droplets,
  RotateCcw,
} from 'lucide-react'

/* ================= DATA ================= */

const SUMMARY = [
  { label: 'Line siap produksi', value: 13, icon: CheckCircle, color: '#16a34a' },
  { label: 'Line perlu perhatian (AMC)', value: 2, icon: AlertTriangle, color: '#f59e0b' },
  { label: 'Line tidak siap produksi', value: 1, icon: XCircle, color: '#ef4444' },
]

const LINE_DATA = [
  { line: 'A', status: 'ready' }, { line: 'B', status: 'ready' },
  { line: 'C', status: 'notready' }, { line: 'D', status: 'ready' },
  { line: 'E', status: 'ready' }, { line: 'F', status: 'amc' },
  { line: 'G', status: 'ready' }, { line: 'H', status: 'ready' },
  { line: 'I', status: 'ready' }, { line: 'J', status: 'ready' },
  { line: 'K', status: 'notready' }, { line: 'L', status: 'ready' },
  { line: 'M', status: 'amc' }, { line: 'N', status: 'ready' },
  { line: 'O', status: 'ready' }, { line: 'P', status: 'ready' },
  { line: 'Q', status: 'amc' },
]

const DOT_COLOR = {
  ready: '#16a34a',
  amc: '#f59e0b',
  notready: '#ef4444',
}

const LINE_LIST = LINE_DATA.map(l => l.line)

/* ================= COMPONENT ================= */

export default function DashboardAdjustment() {
  const [mode, setMode] = useState('all') // all | perline
  const [selectedLine, setSelectedLine] = useState('H')

  return (
    <div style={S.wrap}>
      <div style={S.content}>

        {/* ================= TABS ================= */}
        <div style={S.tabs}>
          <button
            style={mode === 'all' ? { ...S.tabBtn, ...S.activeTab } : S.tabBtn}
            onClick={() => setMode('all')}
          >
            Semua Line
          </button>

          <button
            style={mode === 'perline' ? { ...S.tabBtn, ...S.activeTab } : S.tabBtn}
            onClick={() => setMode('perline')}
          >
            Dashboard Per Line
          </button>
        </div>

        {/* ================= MODE: SEMUA LINE ================= */}
        {mode === 'all' && (
          <>
            {/* Summary */}
            <div style={S.summaryGrid}>
              {SUMMARY.map((item, i) => (
                <div key={i} style={S.summaryCard}>
                  <item.icon size={20} color={item.color} />
                  <div>
                    <div style={{ ...S.summaryValue, color: item.color }}>
                      {item.value}
                    </div>
                    <div style={S.summaryLabel}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Line Readiness */}
            <div style={S.lineCard}>
              <div style={S.lineHeader}>
                Line Readiness - klik line untuk lihat detail
              </div>

              {/* Label */}
              <div style={S.lineRow}>
                <div style={S.lineLabel}>Line</div>
                {LINE_DATA.map(l => (
                  <div key={l.line} style={S.lineCol}>{l.line}</div>
                ))}
              </div>

              {/* Dot */}
              <div style={S.lineRow}>
                <div style={S.lineLabel}>Readiness</div>
                {LINE_DATA.map(l => (
                  <div
                    key={l.line}
                    style={S.lineCol}
                    onClick={() => {
                      setSelectedLine(l.line)
                      setMode('perline')
                    }}
                  >
                    <div style={{ ...S.dot, background: DOT_COLOR[l.status], cursor: 'pointer' }} />
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div style={S.legend}>
                <Legend color="#16a34a" text="Siap produksi" />
                <Legend color="#f59e0b" text="Masuk syarat AMC (suhu/RH belum ideal tapi masih toleransi)" />
                <Legend color="#ef4444" text="Tidak siap - calling maintenance" />
              </div>
            </div>

            <div style={S.infoBox}>
              💡 Klik salah satu dot line untuk melihat detail kesiapan mesin & kondisi ruangan per line
            </div>
          </>
        )}

        {/* ================= MODE: PER LINE ================= */}
        {mode === 'perline' && (
          <>
            {/* Select Line */}
            <div style={S.formGroup}>
              <label style={S.formLabel}>Pilih line:</label>

              <select
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                style={S.select}
              >
                {LINE_LIST.map(l => (
                  <option key={l}>Line {l}</option>
                ))}
              </select>

              <button style={S.refreshBtn}>
                <RotateCcw size={14} /> Refresh
              </button>
            </div>

            {/* Status */}
            <div style={S.statusBox}>
              <div style={S.statusTitle}>
                Line {selectedLine} - Siap Produksi
              </div>
              <div style={S.statusDesc}>
                Semua parameter dalam batas - Mesin OK
              </div>
            </div>

            {/* Detail Cards */}
            <div style={S.grid2}>
              {/* Room */}
              <div style={S.panel}>
                <div style={S.panelHeader}>
                  Room Readiness
                  <span style={S.badgeGreen}>BMS</span>
                </div>

                <div style={S.row}>
                  <Thermometer color="#f59e0b" />
                  <div>
                    <div style={S.bigText}>26°C</div>
                    <div style={S.smallText}>Syarat: &lt; 25°C</div>
                  </div>
                  <div style={S.dotGreen} />
                </div>

                <div style={S.row}>
                  <Droplets color="#3b82f6" />
                  <div>
                    <div style={S.bigText}>65% RH</div>
                    <div style={S.smallText}>Syarat: &lt; 30%</div>
                  </div>
                  <div style={S.dotGreen} />
                </div>
              </div>

              {/* Machine */}
              <div style={S.panel}>
                <div style={S.panelHeader}>
                  Machine Readiness
                  <div>
                    <span style={S.badgeBlue}>e-LISA</span>
                    <span style={S.badgePurple}>e-AM</span>
                  </div>
                </div>

                <MachineItem title="RVS H" desc="Filling Station" />
                <MachineItem title="Cleaning Status" desc="e-LISA • last cleaning" />
                <MachineItem title="e-AM Status" desc="monitoring - dashboard" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ================= SUB ================= */

function MachineItem({ title, desc }) {
  return (
    <div style={S.machineRow}>
      <div>
        <div style={S.machineTitle}>{title}</div>
        <div style={S.machineDesc}>{desc}</div>
      </div>
      <span style={S.pill}>Siap</span>
    </div>
  )
}

function Legend({ color, text }) {
  return (
    <div style={S.legendItem}>
      <span style={{ ...S.legendDot, background: color }} />
      <span>{text}</span>
    </div>
  )
}

/* ================= STYLE ================= */

const S = {
  wrap: { display: 'flex', flexDirection: 'column', flex: 1 },

  content: {
    padding: '18px 24px',
    background: '#e8eef7',
    flex: 1,
  },

  tabs: { display: 'flex', gap: 10, marginBottom: 16 },

  tabBtn: {
    padding: '12px 20px',
    borderRadius: 8,
    border: '1px solid #cbd5f5',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
  },

  activeTab: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: 14,
    marginBottom: 18,
  },

  summaryCard: {
    background: '#fff',
    padding: 20,
    borderRadius: 12,
    display: 'flex',
    gap: 14,
    alignItems: 'center',
  },

  summaryValue: { fontSize: 22, fontWeight: 700 },
  summaryLabel: { fontSize: 14, color: '#64748b' },

  lineCard: { background: '#fff', padding: 20, borderRadius: 10 },

  lineHeader: { fontSize: 18, fontWeight: 700, marginBottom: 20 },

  lineRow: {
    display: 'grid',
    gridTemplateColumns: '120px repeat(17,1fr)',
    marginBottom: 10,
  },

  lineLabel: { fontWeight: 700 },
  lineCol: { textAlign: 'center' },

  dot: { width: 18, height: 18, borderRadius: '50%', margin: '0 auto' },

  legend: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 },

  legendItem: { display: 'flex', gap: 10, alignItems: 'center' },
  legendDot: { width: 12, height: 12, borderRadius: '50%' },

  infoBox: {
    marginTop: 16,
    padding: 14,
    background: '#fff7ed',
    borderRadius: 10,
  },

  /* PER LINE */
  formGroup: { display: 'flex', flexDirection: 'column', gap: 10 },

  select: { padding: 10, borderRadius: 6 },

  refreshBtn: {
    width: 120,
    padding: 8,
    borderRadius: 6,
    border: '1px solid #ccc',
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },

  statusBox: {
    marginTop: 16,
    background: '#bbf7d0',
    padding: 16,
    borderRadius: 10,
  },

  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
    marginTop: 16,
  },

  panel: { background: '#fff', padding: 16, borderRadius: 10 },

  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10,
    fontWeight: 600,
  },

  badgeGreen: { background: '#bbf7d0', padding: '2px 8px', borderRadius: 6 },
  badgeBlue: { background: '#bfdbfe', padding: '2px 8px', borderRadius: 6 },
  badgePurple: { background: '#e9d5ff', padding: '2px 8px', borderRadius: 6 },

  row: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },

  bigText: { fontSize: 20, fontWeight: 700 },
  smallText: { fontSize: 12, color: '#64748b' },

  dotGreen: { width: 10, height: 10, background: '#16a34a', borderRadius: '50%' },

  machineRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },

  machineTitle: { fontWeight: 600 },
  machineDesc: { fontSize: 12, color: '#64748b' },

  pill: { background: '#bbf7d0', padding: '2px 10px', borderRadius: 10 },


}