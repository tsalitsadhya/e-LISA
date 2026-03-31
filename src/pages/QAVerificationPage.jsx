import { useState } from 'react'
import TopBar from "../components/TopBar";
import { Search, CheckCircle, ChevronDown, Calendar, Download, Plus, Eye, AlertTriangle, X } from 'lucide-react'

const MACHINES = ['K1R1P01DP001','K1R2P01DP001','K1R2P01DP002','K1R3P01DP001','K1R4P01DP001','K1R8P01DP001','K1T1P01']
const TYPES    = ['Compounding','Filling','IBC']

const RECORDS = [
  { id:1, date:'2025-02-16', machine:'Filling Line 2', location:'Floor 2', type:'Product Change',   status:'Delayed',   by:'John Operator', time:'1:04 PM' },
  { id:2, date:'2025-02-15', machine:'Mixer B',        location:'Floor 1', type:'Routine Cleaning', status:'Completed', by:'John Operator', time:'1:45 PM' },
  { id:3, date:'2025-02-14', machine:'IBC Tank 2',     location:'Floor 1', type:'Routine Cleaning', status:'Delayed',   by:'John Operator', time:'2:30 PM' },
]

const STATUS_S = {
  Delayed:   { bg:'#fef3c7', color:'#92400e', border:'#fde68a' },
  Completed: { bg:'#dcfce7', color:'#15803d', border:'#bbf7d0' },
}

export default function QAVerificationPage() {
  const [machFilter, setMachFilter] = useState('All Machines')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [showMach,   setShowMach]   = useState(false)
  const [showType,   setShowType]   = useState(false)
  const [feedback,   setFeedback]   = useState(null)
  const [fbText,     setFbText]     = useState('')

  const closeDropdowns = () => { setShowMach(false); setShowType(false) }

  return (
    <div style={S.wrap} onClick={closeDropdowns}>
      <div style={S.content}>
        {/* Stat cards */}
        <div style={S.statsRow}>
          <div style={S.statCard}>
            <div style={S.statIco}><Search size={26} color="#1565c0"/></div>
            <div>
              <div style={S.statTitle}>Pending Reviews</div>
              <div style={S.statNum}>5</div>
              <div style={S.statSub}>Cleaning records awaiting QA review</div>
            </div>
          </div>
          <div style={S.statCard}>
            <div style={{ ...S.statIco, background:'#f0fdf4' }}><CheckCircle size={26} color="#16a34a"/></div>
            <div>
              <div style={S.statTitle}>Verified Cleanings</div>
              <div style={S.statNum}>21</div>
              <div style={S.statSub}>Cleaning records marked as verified</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={S.filterRow} onClick={e=>e.stopPropagation()}>
          {/* Machine */}
          <div style={{ position:'relative' }}>
            <button style={S.filterBtn} onClick={()=>{ setShowMach(!showMach); setShowType(false) }}>
              {machFilter} <ChevronDown size={13}/>
            </button>
            {showMach && (
              <div style={S.drop}>
                {['All Machines',...MACHINES].map(m=>(
                  <div key={m} style={S.dropItem} onClick={()=>{ setMachFilter(m); setShowMach(false) }}>{m}</div>
                ))}
              </div>
            )}
          </div>
          {/* Type */}
          <div style={{ position:'relative' }}>
            <button style={S.filterBtn} onClick={()=>{ setShowType(!showType); setShowMach(false) }}>
              {typeFilter} <ChevronDown size={13}/>
            </button>
            {showType && (
              <div style={S.drop}>
                {['All Types',...TYPES].map(t=>(
                  <div key={t} style={S.dropItem} onClick={()=>{ setTypeFilter(t); setShowType(false) }}>{t}</div>
                ))}
              </div>
            )}
          </div>
          <button style={S.filterBtn}><Calendar size={13}/> Date Range <ChevronDown size={13}/></button>
          <button style={S.exportBtn}><Download size={13}/> Export</button>
        </div>

        {/* Main grid */}
        <div style={S.mainGrid}>
          {/* Table */}
          <div style={S.tableCard}>
            <div style={S.tableHdr}>
              <span style={S.tableTitle}>Pending Cleaning Records</span>
            </div>
            <div style={S.tableSubRow}>
              <span><strong>4</strong> <span style={{ color:'#64748b',fontWeight:400 }}>Pending Verification</span></span>
              <span style={S.totalBadge}>Total: <strong>15</strong> machines</span>
            </div>

            <div style={{ overflowX:'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    {['Date','Machines ↓','Location ↓','Type','Status','Submitted by'].map(h=>(
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECORDS.map(r=>{
                    const ss = STATUS_S[r.status]
                    return (
                      <tr key={r.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                        <td style={S.td}>{r.date}</td>
                        <td style={S.td}>{r.machine}</td>
                        <td style={S.td}>{r.location}</td>
                        <td style={S.td}>
                          <div style={{ fontSize:12 }}>{r.type.split(' ')[0]}</div>
                          <div style={{ fontSize:11,color:'#94a3b8' }}>{r.type.split(' ').slice(1).join(' ')}</div>
                        </td>
                        <td style={S.td}>
                          <span style={{ ...S.pill, background:ss.bg, color:ss.color, border:`1px solid ${ss.border}` }}>{r.status}</span>
                        </td>
                        <td style={S.td}>
                          <div style={{ fontSize:12 }}>{r.by}</div>
                          <div style={{ fontSize:11,color:'#94a3b8' }}>{r.time}</div>
                          <div style={{ display:'flex',gap:4,marginTop:3 }}>
                            <button style={S.actBtn} onClick={()=>setFeedback(r)} title="Add feedback"><Plus size={12} color="#1565c0"/></button>
                            <button style={S.actBtn} title="View"><Eye size={12} color="#64748b"/></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={S.pagRow}>
              <span style={{ fontSize:12,color:'#94a3b8' }}>Showing 1-3 of 3 Pending records</span>
              <div style={{ display:'flex',gap:3 }}>
                {['<','1','2','>'].map((p,i)=>
                  <button key={p} style={{ ...S.pageBtn, ...(p==='1' ? S.pageActive:{}) }}>{p}</button>
                )}
              </div>
            </div>
          </div>

          {/* QA Actions */}
          <div style={S.qaPanel}>
            <div style={S.qaPanelTitle}>QA Actions</div>
            <button style={S.qaDelayBtn}>
              <AlertTriangle size={13} color="#f59e0b"/> View Delayed Records <span style={{ marginLeft:'auto' }}>&gt;</span>
            </button>
            <button style={S.qaVerifyBtn}>
              <CheckCircle size={13} color="#16a34a"/> View Verified Records <span style={{ marginLeft:'auto' }}>&gt;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedback && (
        <div style={S.overlay}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={S.modalHdr}>
              <span style={S.modalTitle}>QA Feedback</span>
              <button style={S.closeX} onClick={()=>setFeedback(null)}><X size={15}/></button>
            </div>
            <div style={{ padding:'14px 16px' }}>
              <label style={S.modalLbl}>Feedback :</label>
              <textarea
                value={fbText}
                onChange={e=>setFbText(e.target.value)}
                style={S.textarea}
                placeholder="Enter your feedback here..."
              />
            </div>
            <div style={S.modalFoot}>
              <button style={S.cancelBtn} onClick={()=>setFeedback(null)}>Cancel</button>
              <button style={S.submitBtn} onClick={()=>{ setFeedback(null); setFbText('') }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


const S = {
  wrap:{ display:'flex',flexDirection:'column',flex:1 },
  content:{ flex:1,padding:'18px 24px',background:'#e8eef7',overflowY:'auto' },
  statsRow:{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14 },
  statCard:{ background:'#fff',borderRadius:10,padding:'14px 18px',display:'flex',alignItems:'flex-start',gap:12,border:'1px solid #e2e8f0' },
  statIco:{ width:50,height:50,background:'#eff6ff',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 },
  statTitle:{ fontSize:16,fontWeight:700,color:'#1e293b',marginBottom:2 },
  statNum:{ fontSize:30,fontWeight:700,color:'#1e293b',lineHeight:1.1 },
  statSub:{ fontSize:12,color:'#64748b',marginTop:2 },
  filterRow:{ display:'flex',gap:8,marginBottom:14,flexWrap:'wrap',alignItems:'center' },
  filterBtn:{ display:'flex',alignItems:'center',gap:5,background:'#fff',border:'1px solid #cbd5e1',borderRadius:6,padding:'6px 12px',fontSize:13,color:'#334155',cursor:'pointer' },
  exportBtn:{ display:'flex',alignItems:'center',gap:5,background:'#1565c0',border:'none',borderRadius:6,padding:'6px 14px',fontSize:13,fontWeight:600,color:'#fff',cursor:'pointer',marginLeft:'auto' },
  drop:{ position:'absolute',top:'108%',left:0,background:'#fff',border:'1px solid #e2e8f0',borderRadius:8,boxShadow:'0 4px 14px rgba(0,0,0,0.10)',zIndex:200,minWidth:180 },
  dropItem:{ padding:'7px 12px',fontSize:13,color:'#334155',cursor:'pointer',borderBottom:'1px solid #f1f5f9' },
  mainGrid:{ display:'grid',gridTemplateColumns:'1fr 260px',gap:16 },
  tableCard:{ background:'#fff',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden' },
  tableHdr:{ padding:'12px 16px',borderBottom:'1px solid #f1f5f9' },
  tableTitle:{ fontSize:14,fontWeight:700,color:'#1e293b' },
  tableSubRow:{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 16px',borderBottom:'1px solid #f1f5f9',fontSize:14,color:'#1e293b' },
  totalBadge:{ fontSize:12,color:'#334155',background:'#f1f5f9',borderRadius:5,padding:'3px 9px',border:'1px solid #e2e8f0' },
  table:{ width:'100%',borderCollapse:'collapse' },
  th:{ fontSize:11,fontWeight:700,color:'#334155',padding:'9px 12px',textAlign:'left',borderBottom:'1px solid #e2e8f0' },
  td:{ fontSize:12,color:'#334155',padding:'9px 12px',verticalAlign:'top' },
  pill:{ fontSize:11,fontWeight:700,padding:'2px 9px',borderRadius:10 },
  actBtn:{ width:22,height:22,background:'transparent',border:'1px solid #e2e8f0',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' },
  pagRow:{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 16px',borderTop:'1px solid #f1f5f9' },
  pageBtn:{ width:28,height:28,background:'#fff',border:'1px solid #e2e8f0',borderRadius:4,fontSize:12,color:'#334155',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' },
  pageActive:{ background:'#1565c0',color:'#fff',border:'1px solid #1565c0' },
  qaPanel:{ background:'#fff',borderRadius:10,padding:'24px 20px',border:'1px solid #e2e8f0',height:'fit-content' },
  qaPanelTitle:{ fontSize:14,fontWeight:700,color:'#1e293b',marginBottom:10 },
  qaDelayBtn:{ display:'flex',alignItems:'center',gap:12,width:'100%',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:8,padding:'12px 16px',fontSize:14,color:'#92400e',cursor:'pointer',marginBottom:12 },
  qaVerifyBtn:{ display:'flex',alignItems:'center',gap:12,width:'100%',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,padding:'12px 16px',fontSize:14,color:'#15803d',cursor:'pointer' },
  overlay:{ position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000 },
  modal:{ background:'#fff',borderRadius:10,width:400,boxShadow:'0 8px 28px rgba(0,0,0,0.14)' },
  modalHdr:{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px',borderBottom:'1px solid #f1f5f9' },
  modalTitle:{ fontSize:15,fontWeight:700,color:'#1e293b' },
  closeX:{ background:'transparent',border:'none',cursor:'pointer',color:'#64748b',display:'flex' },
  modalLbl:{ fontSize:13,fontWeight:600,color:'#334155',display:'block',marginBottom:5 },
  textarea:{ width:'100%',height:96,border:'1px solid #cbd5e1',borderRadius:6,padding:'8px',fontSize:13,resize:'vertical',fontFamily:'inherit' },
  modalFoot:{ display:'flex',gap:8,justifyContent:'flex-end',padding:'11px 16px',borderTop:'1px solid #f1f5f9' },
  cancelBtn:{ background:'#fff',border:'1px solid #cbd5e1',borderRadius:6,padding:'6px 14px',fontSize:13,color:'#334155',cursor:'pointer' },
  submitBtn:{ background:'#1565c0',border:'none',borderRadius:6,padding:'6px 14px',fontSize:13,fontWeight:600,color:'#fff',cursor:'pointer' },
}