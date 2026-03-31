import { useState } from 'react'
import TopBar from "../components/TopBar";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, ChevronDown } from 'lucide-react'

const LINES = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q']

const LINE_STATUS = {
  A:'ready', B:'ready', C:'notready', D:'ready',  E:'ready',
  F:'amc',   G:'ready', H:'ready',   I:'ready',  J:'ready',
  K:'notready', L:'ready', M:'ready', N:'ready', O:'amc',
  P:'ready', Q:'amc',
}

const LINE_DETAIL = {
  A:{ temp:24.0, hum:60, tempOk:true,  humOk:true,  machine:'RVS A', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'ready'    },
  B:{ temp:23.5, hum:58, tempOk:true,  humOk:true,  machine:'RVS B', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'ready'    },
  C:{ temp:27.8, hum:29, tempOk:false, humOk:true,  machine:'RVS C', area:'Filling Station', cleanOk:false, eamOk:false, status:'notready', overdue:true },
  D:{ temp:24.2, hum:62, tempOk:true,  humOk:true,  machine:'RVS D', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'ready'    },
  E:{ temp:23.8, hum:59, tempOk:true,  humOk:true,  machine:'RVS E', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'ready'    },
  F:{ temp:25.2, hum:29, tempOk:false, humOk:true,  machine:'RVS F', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'amc'      },
  G:{ temp:24.0, hum:61, tempOk:true,  humOk:true,  machine:'RVS G', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'ready'    },
  H:{ temp:26.0, hum:65, tempOk:true,  humOk:true,  machine:'RVS H', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'ready'    },
  I:{ temp:24.5, hum:57, tempOk:true,  humOk:true,  machine:'RVS I', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'ready'    },
  J:{ temp:23.9, hum:63, tempOk:true,  humOk:true,  machine:'RVS J', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'ready'    },
  K:{ temp:28.1, hum:72, tempOk:false, humOk:false, machine:'RVS K', area:'Filling Station', cleanOk:false, eamOk:false, status:'notready' },
  L:{ temp:24.1, hum:60, tempOk:true,  humOk:true,  machine:'RVS L', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'ready'    },
  M:{ temp:24.0, hum:58, tempOk:true,  humOk:true,  machine:'RVS M', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'ready'    },
  N:{ temp:23.7, hum:61, tempOk:true,  humOk:true,  machine:'RVS N', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'ready'    },
  O:{ temp:25.0, hum:28, tempOk:true,  humOk:false, machine:'RVS O', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'amc'      },
  P:{ temp:24.3, hum:59, tempOk:true,  humOk:true,  machine:'RVS P', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'ready'    },
  Q:{ temp:25.1, hum:27, tempOk:true,  humOk:false, machine:'RVS Q', area:'Filling Station', cleanOk:true,  eamOk:true,  status:'amc'      },
}

const DOT_COLOR  = { ready:'#16a34a', amc:'#f59e0b', notready:'#ef4444' }
const count = s  => LINES.filter(l => LINE_STATUS[l] === s).length

export default function ProductionReadinessPage() {
  const [tab, setTab]           = useState('all')
  const [line, setLine]         = useState('H')
  const [modal, setModal]       = useState(false)

  const d = LINE_DETAIL[line]

  const BANNER = {
    ready:    { bg:'#f0fdf4', border:'#16a34a', color:'#15803d', title:`Line ${line} - Siap Produksi`,        sub:'Semua parameter dalam batas - Mesin OK' },
    amc:      { bg:'#fffbeb', border:'#f59e0b', color:'#92400e', title:`Line ${line} - Masuk Syarat AMC`,     sub:'Suhu/RH belum ideal tapi masih dalam batas toleransi AMC (<5.89 g/kg)' },
    notready: { bg:'#fef2f2', border:'#ef4444', color:'#991b1b', title:`Line ${line} - Tidak Siap Produksi`,  sub:'Parameter out of range - Calling maintenance' },
  }
  const banner = BANNER[d.status]

  return (
    <div style={S.wrap}>
      <TopBar browserTitle="PRODUCTION READINESS" title="Production Readiness Dashboard" subtitle="Visualisasi kesiapan line produksi - mesin & ruangan" />

      <div style={S.content}>
        {/* Tabs */}
        <div style={S.tabRow}>
          {[['all','Semua Line'],['perline','Dashboard Per Line']].map(([id,lbl]) => (
            <button key={id} style={{ ...S.tab, ...(tab===id ? S.tabOn : S.tabOff) }} onClick={() => setTab(id)}>{lbl}</button>
          ))}
        </div>

        {tab === 'all' ? (
          <>
            {/* Summary */}
            <div style={S.sumGrid}>
              {[
                { icon:<CheckCircle size={22} color="#16a34a"/>, n:count('ready'),    lbl:'Line siap produksi',         border:'#16a34a' },
                { icon:<AlertTriangle size={22} color="#f59e0b"/>, n:count('amc'),    lbl:'Line perlu perhatian (AMC)', border:'#f59e0b' },
                { icon:<XCircle size={22} color="#ef4444"/>, n:count('notready'),     lbl:'Line tidak siap produksi',   border:'#ef4444' },
              ].map((c,i) => (
                <div key={i} style={{ ...S.sumCard, borderLeft:`4px solid ${c.border}` }}>
                  {c.icon}
                  <div>
                    <div style={S.sumN}>{c.n}</div>
                    <div style={S.sumLbl}>{c.lbl}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dot table */}
            <div style={S.dotCard}>
              <div style={S.dotTitle}>Line Readiness - klik line untuk lihat detail</div>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Line</th>
                    {LINES.map(l => <th key={l} style={S.th}>{l}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={S.td}>Readiness</td>
                    {LINES.map(l => (
                      <td key={l} style={S.td}>
                        <button
                          onClick={() => { setLine(l); setTab('perline') }}
                          style={{ width:16,height:16,borderRadius:'50%',background:DOT_COLOR[LINE_STATUS[l]],border:'none',cursor:'pointer',display:'inline-block' }}
                          title={`Line ${l}: ${LINE_STATUS[l]}`}
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <div style={S.legend}>
                {[['#16a34a','Siap produksi'],['#f59e0b','Masuk syarat AMC (suhu/RH belum ideal tapi masih toleransi)'],['#ef4444','Tidak siap - calling maintenance']].map(([c,l])=>(
                  <span key={l} style={S.legItem}><span style={{ ...S.legDot, background:c }}/>{l}</span>
                ))}
              </div>
            </div>

            <div style={S.hint}>💡 Klik salah satu dot line untuk melihat detail kesiapan mesin &amp; kondisi ruangan per line</div>
          </>
        ) : (
          <>
            {/* Per Line */}
            <div style={S.pickRow}>
              <label style={S.pickLbl}>Pilih line:</label>
              <div style={{ position:'relative', minWidth:200 }}>
                <select value={line} onChange={e=>setLine(e.target.value)} style={S.select}>
                  {LINES.map(l=><option key={l} value={l}>Line {l}</option>)}
                </select>
                <ChevronDown size={14} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'#64748b' }}/>
              </div>
            </div>
            <button style={S.refreshBtn}><RefreshCw size={13}/> Refresh</button>

            {/* Banner */}
            <div
              style={{ ...S.banner, background:banner.bg, borderLeft:`4px solid ${banner.border}`, cursor: d.status==='notready'?'pointer':'default' }}
              onClick={d.status==='notready' ? ()=>setModal(true) : undefined}
            >
              <div style={{ ...S.bannerTitle, color:banner.color }}>{banner.title}</div>
              <div style={{ fontSize:12, color:banner.color }}>{banner.sub}</div>
            </div>

            {/* Detail cards */}
            <div style={S.detailGrid}>
              {/* Room */}
              <div style={S.detCard}>
                <div style={S.detHdr}>
                  <span style={S.detTitle}>Room Readiness</span>
                  <span style={S.bmsBadge}>BMS</span>
                </div>
                {[
                  { icon:'🌡', label:'Temperature:', val:`${d.temp}°C`, ok:d.tempOk, req:'Syarat: < 25°C' },
                  { icon:'💧', label:'Humidity:',    val:`${d.hum}% RH`, ok:d.humOk, req:'Syarat: < 30%' },
                ].map(row=>(
                  <div key={row.label} style={S.sensorRow}>
                    <span style={{ fontSize:20 }}>{row.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11,color:'#64748b' }}>{row.label}</div>
                      <div style={{ fontSize:20,fontWeight:700,color: row.ok?'#1e293b':'#ef4444' }}>{row.val}</div>
                      <div style={{ fontSize:11,color:'#94a3b8' }}>{row.req}</div>
                    </div>
                    <div style={{ width:12,height:12,borderRadius:'50%',background:row.ok?'#16a34a':'#ef4444' }}/>
                  </div>
                ))}
                {d.status==='amc' && (
                  <div style={S.amcNote}>Suhu/RH belum memenuhi syarat utama tapi masih dalam batas toleransi AMC (&lt;5.89 g/kg). Produksi dapat dilanjutkan dengan persetujuan.</div>
                )}
                {d.status==='notready' && (
                  <div style={S.notReadyNote}>Suhu/RH belum memenuhi syarat utama tapi masih dalam batas AMC (&lt;5.89 g/kg). Produksi dapat dilanjutkan dengan persetujuan.</div>
                )}
              </div>

              {/* Machine */}
              <div style={S.detCard}>
                <div style={S.detHdr}>
                  <span style={S.detTitle}>Machine Readiness</span>
                  <span style={S.elisaBadge}>e-LISA</span>
                  <span style={S.eamBadge}>e-AM</span>
                </div>

                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14,fontWeight:700,color:'#1e293b' }}>{d.machine}</div>
                    <div style={{ fontSize:11,color:'#94a3b8' }}>{d.area}</div>
                  </div>
                  <Pill ok={d.status==='ready'} label={d.status==='ready'?'Siap':'Tidak Siap'}/>
                </div>

                <div style={S.divider}/>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8 }}>
                  <div>
                    <div style={S.mRowLbl}>Cleaning Status</div>
                    <div style={S.mRowSub}>e-LISA • last cleaning</div>
                  </div>
                  <Pill ok={d.cleanOk} label={d.overdue?'Overdue':d.cleanOk?'Siap':'Tidak Siap'} overdue={d.overdue}/>
                </div>

                <div style={S.divider}/>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                  <div>
                    <div style={S.mRowLbl}>e-AM Status</div>
                    <div style={S.mRowSub}>monitoring</div>
                  </div>
                  <Pill ok={d.eamOk} label={d.eamOk?'Siap':'Tidak Siap'}/>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalHdr}>
              <span style={S.redDot}/>
              <span style={{ fontSize:15,fontWeight:700,color:'#1e293b' }}>Line tidak memenuhi syarat</span>
            </div>
            <p style={S.modalTxt}>Suhu dan/atau RH tidak memenuhi syarat dan tidak masuk dalam batas AMC</p>
            <p style={S.modalTxt}>Kondisi ini memerlukan penanganan dari tim maintenance sebelum produksi dapat dilanjutkan</p>
            <div style={S.modalFoot}>
              <button style={S.closeBtn} onClick={()=>setModal(false)}>Close</button>
              <button style={S.callBtn}>Calling Maintenance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Pill({ ok, label, overdue }) {
  const bg    = overdue ? '#fef9c3' : ok ? '#dcfce7' : '#fee2e2'
  const color = overdue ? '#854d0e' : ok ? '#15803d' : '#dc2626'
  return <span style={{ fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:12,background:bg,color,whiteSpace:'nowrap' }}>• {label}</span>
}

const S = {
  wrap:{ display:'flex',flexDirection:'column',flex:1 },
  content:{ flex:1,padding:'18px 24px',background:'#e8eef7',overflowY:'auto' },
  tabRow:{ display:'flex',gap:4,marginBottom:18 },
  tab:{ padding:'7px 18px',borderRadius:6,border:'1px solid #cbd5e1',fontSize:13,fontWeight:600,cursor:'pointer' },
  tabOn:{ background:'#1565c0',color:'#fff',border:'1px solid #1565c0' },
  tabOff:{ background:'#fff',color:'#334155' },
  sumGrid:{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:14 },
  sumCard:{ background:'#fff',borderRadius:8,padding:'13px 16px',display:'flex',alignItems:'center',gap:12,border:'1px solid #e2e8f0' },
  sumN:{ fontSize:26,fontWeight:700,color:'#1e293b',lineHeight:1 },
  sumLbl:{ fontSize:12,color:'#64748b',marginTop:2 },
  dotCard:{ background:'#fff',borderRadius:10,padding:'14px 18px',border:'1px solid #e2e8f0',marginBottom:12 },
  dotTitle:{ fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:10 },
  table:{ width:'100%',borderCollapse:'collapse' },
  th:{ fontSize:12,fontWeight:600,color:'#334155',padding:'5px 7px',textAlign:'center',borderBottom:'1px solid #e2e8f0' },
  td:{ fontSize:12,color:'#334155',padding:'7px 7px',textAlign:'center' },
  legend:{ display:'flex',gap:18,marginTop:12,flexWrap:'wrap' },
  legItem:{ display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#64748b' },
  legDot:{ width:9,height:9,borderRadius:'50%',display:'inline-block',flexShrink:0 },
  hint:{ background:'#fffbeb',border:'1px solid #fde68a',borderRadius:7,padding:'9px 14px',fontSize:12,color:'#92400e' },
  pickRow:{ display:'flex',alignItems:'center',gap:10,marginBottom:8 },
  pickLbl:{ fontSize:13,color:'#334155',fontWeight:500 },
  select:{ width:'100%',padding:'8px 30px 8px 10px',borderRadius:6,border:'1px solid #cbd5e1',fontSize:13,background:'#fff',appearance:'none',cursor:'pointer' },
  refreshBtn:{ display:'flex',alignItems:'center',gap:5,background:'#fff',border:'1px solid #cbd5e1',borderRadius:6,padding:'5px 12px',fontSize:12,color:'#334155',cursor:'pointer',marginBottom:12 },
  banner:{ borderRadius:8,padding:'11px 16px',marginBottom:14 },
  bannerTitle:{ fontSize:15,fontWeight:700,marginBottom:2 },
  detailGrid:{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 },
  detCard:{ background:'#fff',borderRadius:10,padding:'14px 18px',border:'1px solid #e2e8f0' },
  detHdr:{ display:'flex',alignItems:'center',gap:6,marginBottom:12 },
  detTitle:{ fontSize:14,fontWeight:700,color:'#1e293b',flex:1 },
  bmsBadge:{ fontSize:11,fontWeight:700,background:'#dcfce7',color:'#15803d',padding:'2px 7px',borderRadius:4 },
  elisaBadge:{ fontSize:11,fontWeight:700,background:'#dbeafe',color:'#1d4ed8',padding:'2px 7px',borderRadius:4 },
  eamBadge:{ fontSize:11,fontWeight:700,background:'#fce7f3',color:'#be185d',padding:'2px 7px',borderRadius:4 },
  sensorRow:{ display:'flex',alignItems:'flex-start',gap:10,marginBottom:12 },
  amcNote:{ background:'#fffbeb',border:'1px solid #fde68a',borderRadius:5,padding:'7px 10px',fontSize:11,color:'#92400e',marginTop:6 },
  notReadyNote:{ background:'#fef2f2',border:'1px solid #fecaca',borderRadius:5,padding:'7px 10px',fontSize:11,color:'#991b1b',marginTop:6 },
  divider:{ borderTop:'1px solid #f1f5f9',margin:'8px 0' },
  mRowLbl:{ fontSize:13,fontWeight:600,color:'#1e293b' },
  mRowSub:{ fontSize:11,color:'#94a3b8' },
  overlay:{ position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000 },
  modal:{ background:'#fff',borderRadius:12,padding:'22px 26px',maxWidth:370,width:'90%' },
  modalHdr:{ display:'flex',alignItems:'center',gap:8,marginBottom:10 },
  redDot:{ width:10,height:10,borderRadius:'50%',background:'#ef4444',display:'inline-block',flexShrink:0 },
  modalTxt:{ fontSize:13,color:'#334155',marginBottom:9,lineHeight:1.6 },
  modalFoot:{ display:'flex',gap:8,justifyContent:'flex-end',marginTop:14 },
  closeBtn:{ background:'#fff',border:'1px solid #cbd5e1',borderRadius:6,padding:'6px 14px',fontSize:13,color:'#334155',cursor:'pointer' },
  callBtn:{ background:'#f59e0b',border:'none',borderRadius:6,padding:'6px 14px',fontSize:13,fontWeight:600,color:'#fff',cursor:'pointer' },
}