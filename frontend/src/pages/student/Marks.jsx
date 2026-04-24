import { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import { getMyMarks } from '../../services/studentApi';

export default function StudentMarks() {
  const [marks, setMarks]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyMarks().then(r => setMarks(r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const avg = marks.length
    ? Math.round(marks.reduce((s, m) => s + (m.testId?.maxMarks ? (m.marksObtained / m.testId.maxMarks) * 100 : 0), 0) / marks.length)
    : 0;

  const best = marks.length
    ? marks.reduce((b, m) => {
        const p = m.testId?.maxMarks ? (m.marksObtained / m.testId.maxMarks) * 100 : 0;
        const bp = b.testId?.maxMarks ? (b.marksObtained / b.testId.maxMarks) * 100 : 0;
        return p > bp ? m : b;
      })
    : null;

  const scoreBar = (obtained, max) => {
    const pct = max ? Math.round((obtained / max) * 100) : 0;
    const color = pct >= 75 ? '#22D3A5' : pct >= 50 ? '#f59e0b' : '#f87171';
    return (
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ fontSize:'0.82rem', fontWeight:700, color }}>{obtained}/{max}</span>
          <span style={{ fontSize:'0.75rem', color, fontWeight:600 }}>{pct}%</span>
        </div>
        <div style={{ height:4, borderRadius:99, background:'rgba(255,255,255,0.06)' }}>
          <div style={{ height:'100%', width:`${pct}%`, borderRadius:99, background:`linear-gradient(90deg, ${color}, ${color}99)`, transition:'width 0.8s ease' }} />
        </div>
      </div>
    );
  };

  return (
    <StudentLayout>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:4 }}>My Marks</h1>
        <p style={{ color:'#52525B', fontSize:'0.875rem' }}>Your test results and performance.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12, marginBottom:24 }}>
        {[
          { label:'Tests Taken', value:marks.length, color:'#fff' },
          { label:'Avg Score',   value:`${avg}%`,    color: avg >= 75 ? '#22D3A5' : avg >= 50 ? '#f59e0b' : '#f87171' },
          { label:'Best Score',  value: best ? `${Math.round((best.marksObtained/best.testId?.maxMarks)*100)}%` : '—', color:'#A78BFA' },
        ].map(s => (
          <div key={s.label} style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'14px 18px' }}>
            <div style={{ fontSize:'0.7rem', color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{s.label}</div>
            <div style={{ fontSize:'1.4rem', fontWeight:800, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? <div style={{ padding:40, textAlign:'center', color:'#52525B' }}>Loading…</div>
      : marks.length === 0 ? (
        <div style={{ padding:60, textAlign:'center', background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:12 }}>🏆</div>
          <div style={{ color:'#52525B' }}>No test results yet.</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
          {marks.map(m => {
            const pct = m.testId?.maxMarks ? Math.round((m.marksObtained / m.testId.maxMarks) * 100) : 0;
            const color = pct >= 75 ? '#22D3A5' : pct >= 50 ? '#f59e0b' : '#f87171';
            return (
              <div key={m._id} style={{ background:'#141418', border:`1px solid ${color}20`, borderRadius:16, padding:20, transition:'all 0.25s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor=`${color}40`; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 32px rgba(0,0,0,0.3)`; }}
                onMouseOut={e => { e.currentTarget.style.borderColor=`${color}20`; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
              >
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:'0.95rem', fontWeight:700, color:'#fff', marginBottom:3 }}>{m.testId?.subject || '—'}</div>
                    <div style={{ fontSize:'0.75rem', color:'#52525B' }}>{m.testId?.batchId?.name}</div>
                  </div>
                  <span style={{ padding:'3px 10px', borderRadius:99, background:`${color}15`, color, fontSize:'0.75rem', fontWeight:700 }}>{pct}%</span>
                </div>
                {scoreBar(m.marksObtained, m.testId?.maxMarks)}
                <div style={{ fontSize:'0.72rem', color:'#52525B', marginTop:10 }}>
                  {m.testId?.date ? new Date(m.testId.date).toLocaleDateString() : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}
