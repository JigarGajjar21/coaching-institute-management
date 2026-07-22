import { useEffect, useState } from 'react';
import FacultyLayout from '../../layouts/FacultyLayout';
import { getFacultySchedule } from '../../services/facultyApi';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const ACCENT = '#A78BFA';

export default function FacultySchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState('week'); // week | list

  useEffect(() => {
    getFacultySchedule()
      .then(r => setSchedule(r.data?.schedules || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = schedule.filter(s => s.day === d);
    return acc;
  }, {});

  const dayColors = { Monday:'#22D3A5', Tuesday:'#60A5FA', Wednesday:ACCENT, Thursday:'#f59e0b', Friday:'#f87171', Saturday:'#34d399', Sunday:'#94a3b8' };

  return (
    <FacultyLayout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:4 }}>My Schedule</h1>
          <p style={{ color:'#52525B', fontSize:'0.875rem' }}>{schedule.length} class{schedule.length !== 1 ? 'es' : ''} across your batches.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['week','list'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding:'7px 16px', borderRadius:8, border:'1px solid',
              borderColor: view === v ? ACCENT : 'rgba(255,255,255,0.1)',
              background: view === v ? 'rgba(167,139,250,0.12)' : 'transparent',
              color: view === v ? ACCENT : '#71717A',
              fontSize:'0.82rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s', fontFamily:'Inter, sans-serif',
            }}>{v === 'week' ? '📅 Week' : '📋 List'}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding:60, textAlign:'center', color:'#52525B' }}>Loading schedule…</div>
      ) : schedule.length === 0 ? (
        <div style={{ padding:60, textAlign:'center', background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📅</div>
          <div style={{ color:'#52525B' }}>No schedule assigned yet.</div>
        </div>
      ) : view === 'week' ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:14 }}>
          {DAYS.map(day => {
            const classes = byDay[day];
            const isToday = day === today;
            const color   = dayColors[day];
            return (
              <div key={day} style={{
                background:'#141418',
                border:`1px solid ${isToday ? `${color}40` : 'rgba(255,255,255,0.07)'}`,
                borderRadius:14, overflow:'hidden',
                boxShadow: isToday ? `0 0 20px ${color}15` : 'none',
              }}>
                <div style={{ padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'0.8rem', fontWeight:700, color: isToday ? color : '#A1A1AA' }}>{day}</span>
                  {isToday && <span style={{ fontSize:'0.65rem', padding:'2px 8px', borderRadius:99, background:`${color}20`, color, fontWeight:700 }}>TODAY</span>}
                  {classes.length > 0 && !isToday && <span style={{ fontSize:'0.65rem', color:'#52525B' }}>{classes.length}</span>}
                </div>
                {classes.length === 0 ? (
                  <div style={{ padding:'16px 14px', color:'#3f3f46', fontSize:'0.78rem', textAlign:'center' }}>No class</div>
                ) : classes.map(s => (
                  <div key={s._id} style={{ padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize:'0.82rem', fontWeight:600, color:'#fff', marginBottom:2 }}>{s.subject}</div>
                    <div style={{ fontSize:'0.72rem', color:'#52525B', marginBottom:4 }}>{s.batchId?.name}</div>
                    <span style={{ fontSize:'0.7rem', color, fontWeight:600 }}>⏰ {s.time}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
            <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              {['Day','Subject','Batch','Time'].map(h => (
                <th key={h} style={{ padding:'12px 20px', textAlign:'left', fontSize:'0.7rem', fontWeight:700, color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[...schedule].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day)).map(s => {
                const isToday = s.day === today;
                const color   = dayColors[s.day];
                return (
                  <tr key={s._id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background: isToday ? `${color}06` : 'transparent' }}
                    onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseOut={e => e.currentTarget.style.background= isToday ? `${color}06` : 'transparent'}
                  >
                    <td style={{ padding:'12px 20px' }}>
                      <span style={{ color, fontWeight:600, fontSize:'0.82rem' }}>{s.day}</span>
                      {isToday && <span style={{ marginLeft:6, fontSize:'0.65rem', padding:'1px 6px', borderRadius:99, background:`${color}20`, color }}>Today</span>}
                    </td>
                    <td style={{ padding:'12px 20px', color:'#fff', fontWeight:500 }}>{s.subject}</td>
                    <td style={{ padding:'12px 20px', color:'#A1A1AA' }}>{s.batchId?.name}</td>
                    <td style={{ padding:'12px 20px', color:ACCENT, fontWeight:600 }}>{s.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </FacultyLayout>
  );
}
