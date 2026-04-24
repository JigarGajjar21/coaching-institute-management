import { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import { getMySchedule } from '../../services/studentApi';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAY_COLORS = { Monday:'#22D3A5', Tuesday:'#A78BFA', Wednesday:'#60A5FA', Thursday:'#f59e0b', Friday:'#f87171', Saturday:'#34d399', Sunday:'#c084fc' };

export default function StudentSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [view, setView]           = useState('week');

  useEffect(() => {
    getMySchedule()
      .then(r => setSchedules(r.data?.schedules || []))
      .catch(e => setError(e.response?.data?.message || 'Could not load schedule.'))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = schedules.filter(s => s.day === d).sort((a, b) => a.time.localeCompare(b.time));
    return acc;
  }, {});

  return (
    <StudentLayout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:4 }}>My Schedule</h1>
          <p style={{ color:'#52525B', fontSize:'0.875rem' }}>Your weekly class timetable.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['week','list'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, transition:'all 0.2s', background: view===v ? '#22D3A5' : 'rgba(255,255,255,0.06)', color: view===v ? '#000' : '#71717A', textTransform:'capitalize' }}>{v} view</button>
          ))}
        </div>
      </div>

      {loading ? <div style={{ padding:60, textAlign:'center', color:'#52525B' }}>Loading schedule…</div>
      : error ? <div style={{ padding:40, textAlign:'center', color:'#f87171', background:'rgba(239,68,68,0.08)', borderRadius:16, border:'1px solid rgba(239,68,68,0.2)' }}>{error}</div>
      : schedules.length === 0 ? (
        <div style={{ padding:60, textAlign:'center', background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📅</div>
          <div style={{ color:'#52525B', fontSize:'0.9rem' }}>No schedule assigned yet. Enroll in a course to get started.</div>
        </div>
      ) : view === 'week' ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:16 }}>
          {DAYS.map(day => {
            const color = DAY_COLORS[day];
            const isToday = day === today;
            return (
              <div key={day} style={{ background:'#141418', border:`1px solid ${isToday ? color+'40' : color+'15'}`, borderRadius:16, overflow:'hidden', boxShadow: isToday ? `0 0 20px ${color}15` : 'none' }}>
                <div style={{ padding:'10px 16px', background:`${color}12`, borderBottom:`1px solid ${color}20`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'0.82rem', fontWeight:700, color }}>{day}</span>
                  {isToday && <span style={{ fontSize:'0.65rem', padding:'2px 8px', borderRadius:99, background:`${color}25`, color, fontWeight:700 }}>TODAY</span>}
                </div>
                <div style={{ padding:12, display:'flex', flexDirection:'column', gap:8 }}>
                  {byDay[day].length === 0 ? (
                    <div style={{ fontSize:'0.75rem', color:'#3f3f46', textAlign:'center', padding:'10px 0' }}>No classes</div>
                  ) : byDay[day].map(s => (
                    <div key={s._id} style={{ padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10 }}>
                      <div style={{ fontSize:'0.82rem', fontWeight:600, color:'#fff', marginBottom:2 }}>{s.subject}</div>
                      <div style={{ fontSize:'0.72rem', color:'#52525B', marginBottom:4 }}>{s.batchId?.name}</div>
                      <div style={{ fontSize:'0.75rem', color, fontWeight:700 }}>{s.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
            <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              {['Day','Time','Subject','Batch'].map(h => <th key={h} style={{ padding:'12px 20px', textAlign:'left', fontSize:'0.7rem', fontWeight:700, color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {schedules.sort((a,b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.time.localeCompare(b.time)).map(s => (
                <tr key={s._id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseOut={e=>e.currentTarget.style.background='transparent'}
                >
                  <td style={{ padding:'12px 20px' }}><span style={{ color: DAY_COLORS[s.day], fontWeight:600 }}>{s.day}</span></td>
                  <td style={{ padding:'12px 20px', color:'#22D3A5', fontWeight:600 }}>{s.time}</td>
                  <td style={{ padding:'12px 20px', color:'#fff', fontWeight:500 }}>{s.subject}</td>
                  <td style={{ padding:'12px 20px', color:'#71717A' }}>{s.batchId?.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </StudentLayout>
  );
}
