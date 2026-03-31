import { useState } from 'react'
import TopBar from "../components/TopBar";
import { Shield, CheckCircle, Clock, Wrench, AlertCircle, ChevronRight, Plus, FileText } from 'lucide-react'

const FLOORS = {
  '1': {
    label: '1st Floor',
    room: { temp: 26, humidity: 65, tempOk: true, humidOk: false },
    machines: { ready: 7, total: 10, delayed: 3, area: 'Filling Area' },
    pendingReviews: 3, maintenance: 2, alerts: 5,
  },
  '234': {
    label: '2, 3, 4 Floor',
    room: { temp: 24, humidity: 58, tempOk: true, humidOk: true },
    machines: { ready: 12, total: 15, delayed: 1, area: 'Compounding Area' },
    pendingReviews: 1, maintenance: 0, alerts: 2,
  },
}

export default function DashboardUserPage({ role, onNavigate }) {
  const [floor, setFloor] = useState(role === 'adjustment' ? '1' : null)

  if (!floor) {
    return (
      <div style={S.wrap}>

        <div style={S.content}>
          <p style={S.checkTxt}>Check the line clearance and production readiness status</p>

          <div style={S.floorList}>
            {[
              { id: '1', label: '1st Floor' },
              { id: '234', label: '2,3,4 Floor' },
            ].map(f => (
              <div key={f.id} style={S.floorCard}>
                <div style={S.shieldWrap}>
                  <Shield size={52} color="#1565c0" />
                  <span style={S.spark}>✦</span>
                </div>

                <div style={S.floorLabel}>{f.label}</div>
                <div style={S.floorSub}>Please click 'Next page' to directly into CMS</div>

                <button style={S.nextBtn} onClick={() => setFloor(f.id)}>
                  Next page
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const d = FLOORS[floor]

  return (
    <div style={S.wrap}>
      <div style={S.content}>
        <p style={S.checkTxt}>Check the line clearance and production readiness status</p>

        {/* SUMMARY */}
        <div style={S.summaryGrid}>

          {/* ROOM */}
          <div style={S.roomCard}>
            <div style={S.cardTitle}>Room Readiness Summary</div>
            <div style={S.cardSrc}>RVS A (Source: BMS)</div>

            <div style={S.innerBox}>
              {[
                { icon: '🌡', label: 'Temperature:', value: `${d.room.temp}°C`, ok: d.room.tempOk },
                { icon: '💧', label: 'Humidity:', value: `${d.room.humidity}%`, ok: d.room.humidOk },
              ].map(row => (
                <div key={row.label} style={S.sensorRow}>
                  <span>{row.icon}</span>
                  <span style={{ flex: 1 }}>{row.label}</span>
                  <span style={{ fontWeight: 700 }}>{row.value}</span>
                  <span style={{
                    background: row.ok ? '#4CAF50' : '#FF9800',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    {row.ok ? 'GREEN' : 'WARNING'}
                  </span>
                </div>
              ))}
            </div>

            <button style={S.whiteBtn}>View Room Details</button>
          </div>

          {/* MACHINE */}
          <div style={S.machCard}>
            <div style={S.cardTitle}>Machine Readiness Summary</div>
            <div style={S.cardSrc}>{d.machines.area}</div>

            <div style={S.innerBox}>
              <div style={S.machRow}>
                <CheckCircle size={16} color="#4CAF50" />
                <span style={{ fontWeight: 700 }}>{d.machines.ready}/{d.machines.total}</span>
                <span style={{ color: '#4CAF50' }}>Ready</span>
              </div>

              <div style={S.machRow}>
                <Clock size={16} color="#ef4444" />
                <span style={{ fontWeight: 700 }}>{d.machines.delayed}</span>
                <span style={{ color: '#ef4444' }}>Delayed</span>
              </div>
            </div>

            <button style={S.whiteBtn}>View Cleaning Management</button>
          </div>
        </div>

        {/* PRODUCTION READINESS (VERSI LAMA) */}
        <div style={S.prodCard}>
          <div style={S.prodHdr}>PRODUCTION READINESS TODAY</div>
          <div style={S.prodBody}>
            <div style={S.prodLeft}>
              <div style={S.readyRow}>
                <div style={S.greenCircle}><CheckCircle size={26} color="#fff" /></div>
                <div>
                  <div style={S.readyTxt}>READY</div>
                  <div style={S.readySub}>Production can proceed</div>
                </div>
              </div>

              <div style={S.reasonBox}>
                <div style={S.reasonTitle}>Reason for readiness:</div>

                <div style={S.reasonRow}>
                  <CheckCircle size={13} color="#16a34a" />
                  <span><strong>Room readiness:</strong> <span style={{ color: '#16a34a' }}>All lines are GREEN</span></span>
                </div>

                <div style={S.reasonRow}>
                  <CheckCircle size={13} color="#16a34a" />
                  <span><strong>Machine readiness:</strong> <span style={{ color: '#16a34a' }}>All cleaning tasks completed & verified OK</span></span>
                </div>
              </div>
            </div>

            <div style={S.prodRight}>
              {[
                { icon: <Clock size={15} color="#1565c0" />, label: 'Pending reviews', val: d.pendingReviews },
                { icon: <Wrench size={15} color="#f59e0b" />, label: 'Maintenance requests', val: d.maintenance },
                { icon: <AlertCircle size={15} color="#ef4444" />, label: 'Alerts', val: d.alerts },
              ].map(item => (
                <div key={item.label} style={S.statRow}>
                  <div style={S.statIco}>{item.icon}</div>
                  <div style={{ flex: 1 }}>{item.label}</div>
                  <span style={S.statNum}>{item.val} <ChevronRight size={13} /></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SHORTCUT */}
        <div style={S.shortCard}>
          <div style={S.shortTitle}>Shortcuts</div>

          <div style={S.shortGrid}>
            <div style={S.shortItem}>
              <div style={S.shortHdr}><FileText size={17} color="#1565c0" />Cleaning record</div>
              <div style={S.shortSub}>Record a cleaning for each machine</div>
              <button style={S.addBtn}><Plus size={13}/> Add</button>
            </div>

            <div style={S.shortItem}>
              <div style={S.shortHdr}><FileText size={17} color="#ef4444" />Generate report</div>
              <div style={S.shortSub}>Make a report to maintain the production readiness</div>
              <button style={S.addBtn}>Create</button>
            </div>
          </div>
        </div>

        {/* BACK BUTTON */}
        <button style={S.backBtn} onClick={() => setFloor(null)}>← Back to Floor Selection</button>
      </div>
    </div>
  )
}


const S = {
  wrap: { display: 'flex', flexDirection: 'column', flex: 1 },
  content: { padding: '18px 24px', background: '#e8eef7' },

  checkTxt: { fontSize: 14, fontWeight: 600, marginBottom: 18 },

  floorList: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400, margin: '0 auto' },
  floorCard: { background: '#fff', borderRadius: 12, padding: '26px 28px', textAlign: 'center' },

  shieldWrap: { position: 'relative', display: 'inline-block', marginBottom: 10 },
  spark: { position: 'absolute', top: -4, right: -10, color: '#f59e0b', fontSize: 16 },

  floorLabel: { fontSize: 18, fontWeight: 700 },
  floorSub: { fontSize: 12, marginBottom: 14 },

  nextBtn: { background: '#1565c0', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 0', width: '100%' },

  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },

  roomCard: { background: '#4CAF50', borderRadius: 10, padding: 16 },
  machCard: { background: '#6B8FBF', borderRadius: 10, padding: 16 },

  cardTitle: { color: '#fff', fontWeight: 700 },
  cardSrc: { color: '#eee', fontSize: 12, marginBottom: 10 },

  innerBox: { background: '#fff', borderRadius: 8, padding: 10, marginBottom: 10 },

  sensorRow: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' },
  machRow: { display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' },

  whiteBtn: { background: '#fff', border: 'none', padding: 6, borderRadius: 6 },

  prodCard: { background: '#fff', borderRadius: 10, marginTop: 16, overflow: 'hidden' },
  prodHdr: { background: '#f1f5f9', padding: 10, fontWeight: 700 },
  prodBody: { display: 'grid', gridTemplateColumns: '1fr auto', padding: 16 },

  prodLeft: {},
  readyRow: { display: 'flex', gap: 12, marginBottom: 10 },
  greenCircle: { width: 42, height: 42, background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  readyTxt: { fontSize: 20, fontWeight: 700 },
  readySub: { fontSize: 12 },

  reasonBox: { background: '#f8fafc', padding: 10, borderRadius: 6 },
  reasonTitle: { fontWeight: 600, marginBottom: 6 },
  reasonRow: { display: 'flex', gap: 6, marginBottom: 4 },

  prodRight: { borderLeft: '1px solid #e2e8f0', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8 },
  statRow: { display: 'flex', alignItems: 'center', gap: 8, background: '#f0f9ff', padding: 8, borderRadius: 6 },
  statIco: { width: 26, height: 26, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5 },
  statNum: { fontWeight: 700, color: '#1565c0', display: 'flex', alignItems: 'center' },

  shortCard: { background: '#fff', marginTop: 16, padding: 16, borderRadius: 10 },
  shortTitle: { fontWeight: 700, marginBottom: 10 },

  shortGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  shortItem: { border: '1px solid #ddd', padding: 10, borderRadius: 8 },

  shortHdr: { display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600 },
  shortSub: { fontSize: 12, marginBottom: 6 },

  addBtn: { border: '1px solid #1565c0', background: '#fff', color: '#1565c0', borderRadius: 6, padding: '5px 10px' },

  backBtn: { marginTop: 12, border: '1px solid #94a3b8', background: 'transparent', padding: '6px 12px', borderRadius: 6 },
}