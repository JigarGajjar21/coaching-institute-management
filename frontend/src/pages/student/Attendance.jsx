import { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import { getMyAttendance } from '../../services/studentApi';

export default function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAttendance().then(r => setRecords(r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const total   = records.length;
  const present = records.filter(r => r.status === 'Present').length;
  const absent  = total - present;
  const pct     = total ? Math.round((present / total) * 100) : 0;

  const statusBadge = s => <span style={{ padding:'2px 10px', borderRadius:99, background: s==='Present' ? 'rgba(34,211,165,0.1)' : 'rgba(239,68,68,0.1)', color: s==='Present' ? '#22D3A5' : '#f87171', fontSize:'0.75rem', fontWeight:600 }}>{s}</span>;

  return (
    <StudentLayout>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:4 }}>My Attendance</h1>
        <p style={{ color:'#52525B', fontSize:'0.875rem' }}>Track your class attendance record.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:12, marginBottom:24 }}>
        {[
          { label:'Total Classes', value:total,   color:'#fff' },
          { label:'Present',       value:present, color:'#22D3A5' },
          { label:'Absent',        value:absent,  color:'#f87171' },
          { label:'Attendance %',  value:`${pct}%`, color: pct >= 75 ? '#22D3A5' : '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'14px 18px' }}>
            <div style={{ fontSize:'0.7rem', color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{s.label}</div>
            <div style={{ fontSize:'1.4rem', fontWeight:800, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:'#52525B' }}>Loading…</div>
        : records.length === 0 ? <div style={{ padding:40, textAlign:'center', color:'#52525B' }}>No attendance records yet.</div>
        : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
            <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              {['Date','Subject','Batch','Status'].map(h => <th key={h} style={{ padding:'12px 20px', textAlign:'left', fontSize:'0.7rem', fontWeight:700, color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r._id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseOut={e=>e.currentTarget.style.background='transparent'}
                >
                  <td style={{ padding:'12px 20px', color:'#fff', fontWeight:500 }}>{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                  <td style={{ padding:'12px 20px', color:'#A1A1AA' }}>{r.scheduleId?.subject || '—'}</td>
                  <td style={{ padding:'12px 20px', color:'#71717A' }}>{r.scheduleId?.batchId?.name || '—'}</td>
                  <td style={{ padding:'12px 20px' }}>{statusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </StudentLayout>
  );
}
