import { useState } from 'react'
import TopBar from "../components/TopBar";
import { CheckCircle, Clock, Wrench, AlertCircle, Plus, FileText, Users, Eye, Pencil } from 'lucide-react'

export default function DashboardAdminPage({ onNavigate }) {
  const data = {
    room: { temp: 26, humidity: 65, tempOk: true, humidOk: false },
    machines: { ready: 7, total: 10, delayed: 3, area: 'Filling Area' },
    pendingReviews: 3,
    maintenance: 2,
    alerts: 5,
  }

  return (
    <div style={S.wrap}>
      <div style={S.content}>
        <p style={S.checkTxt}>
          Check the line clearance and production readiness status
        </p>

        {/* ================= SUMMARY ================= */}
        <div style={S.summaryGrid}>

          {/* ROOM */}
          <div style={S.roomCard}>
            <div style={S.cardTitle}>Room Readiness Summary</div>
            <div style={S.cardSrc}>RVS A (Source: BMS)</div>

            <div style={S.innerBox}>
              <div style={S.sensorRow}>
                <span>🌡</span>
                <span style={{ flex: 1 }}>Temperature:</span>
                <span style={{ fontWeight: 700 }}>{data.room.temp}°C</span>
                <span style={S.badgeGreen}>GREEN</span>
              </div>

              <div style={S.sensorRow}>
                <span>💧</span>
                <span style={{ flex: 1 }}>Humidity:</span>
                <span style={{ fontWeight: 700 }}>{data.room.humidity}%</span>
                <span style={S.badgeWarn}>WARNING</span>
              </div>
            </div>

            <button style={S.whiteBtn}>View Room Details</button>
          </div>

          {/* MACHINE */}
          <div style={S.machCard}>
            <div style={S.cardTitle}>Machine Readiness Summary</div>
            <div style={S.cardSrc}>{data.machines.area}</div>

            <div style={S.innerBox}>
              <div style={S.machRow}>
                <CheckCircle size={16} color="#16a34a" />
                <span style={S.machNum}>{data.machines.ready}/{data.machines.total}</span>
                <span style={{ color: '#16a34a' }}>Ready</span>
              </div>

              <div style={S.machRow}>
                <Clock size={16} color="#ef4444" />
                <span style={S.machNum}>{data.machines.delayed}</span>
                <span style={{ color: '#ef4444' }}>Delayed</span>
              </div>
            </div>

            <button style={S.whiteBtn}>View Cleaning Management</button>
          </div>
        </div>

        {/* ================= PRODUCTION ================= */}
        <div style={S.prodCard}>
          <div style={S.prodHdr}>PRODUCTION READINESS TODAY</div>

          <div style={S.prodBody}>
            <div style={S.prodLeft}>
              <div style={S.readyRow}>
                <div style={S.greenCircle}>
                  <CheckCircle size={26} color="#fff" />
                </div>
                <div>
                  <div style={S.readyTxt}>READY</div>
                  <div style={S.readySub}>Production can proceed</div>
                </div>
              </div>

              <div style={S.reasonBox}>
                <div style={S.reasonTitle}>Reason for readiness:</div>

                <div style={S.reasonRow}>
                  <CheckCircle size={13} color="#16a34a" />
                  <span><b>Room readiness:</b> <span style={{ color: '#16a34a' }}>All lines are GREEN</span></span>
                </div>

                <div style={S.reasonRow}>
                  <CheckCircle size={13} color="#16a34a" />
                  <span><b>Machine readiness:</b> <span style={{ color: '#16a34a' }}>All cleaning tasks completed & verified OK</span></span>
                </div>
              </div>
            </div>

            <div style={S.prodRight}>
              {[
                { icon: <Clock size={15} color="#1565c0" />, label: 'Pending reviews', val: data.pendingReviews },
                { icon: <Wrench size={15} color="#f59e0b" />, label: 'Maintenance requests', val: data.maintenance },
                { icon: <AlertCircle size={15} color="#ef4444" />, label: 'Alerts', val: data.alerts },
              ].map(item => (
                <div key={item.label} style={S.statRow}>
                  <div style={S.statIco}>{item.icon}</div>
                  <div style={{ flex: 1 }}>{item.label}</div>
                  <span style={S.statNum}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= SHORTCUT ================= */}
        <div style={S.shortCard}>
          <div style={S.shortTitle}>Shortcuts</div>

          <div style={S.shortGrid}>
            <div style={S.shortItem}>
              <div style={S.shortHdr}><FileText size={16} color="#1565c0"/> Cleaning record</div>
              <div style={S.shortSub}>Record a cleaning for each machine</div>
              <button style={S.btn}>+ Add</button>
            </div>

            <div style={S.shortItem}>
              <div style={S.shortHdr}><FileText size={16} color="#ef4444"/> Audit Trail</div>
              <div style={S.shortSub}>Make an audit trail to maintain a detailed chronological record of all changes and activities within the system.</div>
<button style={S.btn}><Pencil size={12} color="#1565c0" style={{ marginRight: 4 }} />Create</button>
            </div>

            <div style={S.shortItem}>
              <div style={S.shortHdr}><Users size={16} color="#16a34a"/> Manage Users</div>
                <div style={S.shortSub}>Manage each users</div>
<button style={S.btn}><Eye size={12} color="#1565c0" style={{ marginRight: 4 }} />View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const S = {
  wrap: { display: 'flex', flexDirection: 'column', flex: 1 },
  content: { padding: 20, background: '#e8eef7' },

  checkTxt: { fontWeight: 600, marginBottom: 16 },

  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },

  roomCard: { background: '#4CAF50', padding: 16, borderRadius: 10 },
  machCard: { background: '#6B8FBF', padding: 16, borderRadius: 10 },

  cardTitle: { color: '#fff', fontWeight: 700 },
  cardSrc: { color: '#eee', fontSize: 12, marginBottom: 10 },

  innerBox: { background: '#fff', borderRadius: 8, padding: 10, marginBottom: 10 },

  sensorRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 },
  machRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },

  machNum: { fontWeight: 700 },

  badgeGreen: { background: '#16a34a', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11 },
  badgeWarn: { background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11 },

  whiteBtn: { background: '#fff', border: 'none', padding: 6, borderRadius: 6 },

  prodCard: { background: '#fff', marginTop: 16, borderRadius: 10 },
  prodHdr: { background: '#f1f5f9', padding: 10, fontWeight: 700 },
  prodBody: { display: 'grid', gridTemplateColumns: '1fr auto', padding: 16 },

  readyRow: { display: 'flex', gap: 12, marginBottom: 10 },
  greenCircle: { width: 42, height: 42, background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  readyTxt: { fontSize: 20, fontWeight: 700 },
  readySub: { fontSize: 12 },

  reasonBox: { background: '#f8fafc', padding: 10, borderRadius: 6 },
  reasonTitle: { fontWeight: 600 },
  reasonRow: { display: 'flex', gap: 6, marginTop: 4 },

  prodRight: { display: 'flex', flexDirection: 'column', gap: 8 },
  statRow: { display: 'flex', alignItems: 'center', gap: 8, background: '#f0f9ff', padding: 8, borderRadius: 6 },
  statIco: { width: 26, height: 26, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5 },
  statNum: { fontWeight: 700 },

  shortCard: { background: '#fff', marginTop: 16, padding: 16, borderRadius: 10 },
  shortTitle: { fontWeight: 700, marginBottom: 10 },

  shortGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 },
  shortItem: { border: '1px solid #ddd', padding: 10, borderRadius: 8 },

  shortHdr: { display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 },
  shortSub: { fontSize: 12, marginBottom: 6 },

  btn: { border: '1px solid #1565c0', background: '#fff', color: '#1565c0', borderRadius: 6, padding: '5px 10px' },

}