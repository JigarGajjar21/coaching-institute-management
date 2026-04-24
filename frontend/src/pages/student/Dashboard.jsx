import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../layouts/StudentLayout';
import { getMyAttendance, getMyMarks, getMySchedule, getMyMaterials } from '../../services/studentApi';

export default function StudentDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks]           = useState([]);
  const [schedule, setSchedule]     = useState([]);
  const [materials, setMaterials]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    Promise.allSettled([
      getMyAttendance(),
      getMyMarks(),
      getMySchedule(),
      getMyMaterials(),
    ]).then(([a, m, s, mat]) => {
      setAttendance(a.status === 'fulfilled' ? (a.value.data || []) : []);
      setMarks(m.status === 'fulfilled' ? (m.value.data || []) : []);
      setSchedule(s.status === 'fulfilled' ? (s.value.data?.schedules || []) : []);
      setMaterials(mat.status === 'fulfilled' ? (mat.value.data || []) : []);
    }).finally(() => setLoading(false));
  }, []);

  const totalClasses  = attendance.length;
  const presentCount  = attendance.filter(a => a.status === 'Present').length;
  const attendancePct = totalClasses ? Math.round((presentCount / totalClasses) * 100) : 0;

  const avgScore = marks.length
    ? Math.round(marks.reduce((sum, m) => sum + (m.testId?.maxMarks ? (m.marksObtained / m.testId.maxMarks) * 100 : 0), 0) / marks.length)
    : 0;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = schedule.filter(s => s.day === today);

  const statCard = (icon, label, value, color, sub) => (
    <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'20px 24px', transition:'all 0.25s', position:'relative', overflow:'hidden' }}
      onMouseOver={e => { e.currentTarget.style.borderColor=`${color}30`; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${color}20`; }}
      onMouseOut={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
    >
      <div style={{ position:'absolute', top:0, right:0, width:80, height:80, background:`radial-gradient(circle at top right, ${color}20, transparent 70%)`, pointerEvents:'none' }} />
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`${color}18`, border:`1px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>{icon}</div>
        <div>
          <div style={{ fontSize:'0.72rem', color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>{label}</div>
          <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#fff', letterSpacing:'-0.03em', lineHeight:1 }}>{loading ? '…' : value}</div>
          {sub && <div style={{ fontSize:'0.72rem', color, marginTop:4 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );

  return (
    <StudentLayout>
      {/* Welcome */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:4 }}>
          Welcome back, {user.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p style={{ color:'#52525B', fontSize:'0.875rem' }}>Here's your learning overview for today.</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:16, marginBottom:28 }}>
        {statCard('✅', 'Attendance', `${attendancePct}%`, '#22D3A5', `${presentCount}/${totalClasses} classes`)}
        {statCard('🏆', 'Avg Score',  `${avgScore}%`,      '#A78BFA', `${marks.length} test${marks.length !== 1 ? 's' : ''}`)}
        {statCard('📅', "Today's Classes", todayClasses.length, '#60A5FA', today)}
        {statCard('📁', 'Materials',  materials.length,    '#f59e0b', 'available')}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Today's schedule */}
        <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'0.9rem', fontWeight:600, color:'#fff' }}>Today's Classes</span>
            <Link to="/dashboard/schedule" style={{ fontSize:'0.78rem', color:'#22D3A5', textDecoration:'none' }}>Full schedule →</Link>
          </div>
          {loading ? <div style={{ padding:32, textAlign:'center', color:'#52525B' }}>Loading…</div>
          : todayClasses.length === 0 ? <div style={{ padding:32, textAlign:'center', color:'#52525B' }}>No classes today 🎉</div>
          : todayClasses.map(s => (
            <div key={s._id} style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#fff' }}>{s.subject}</div>
                <div style={{ fontSize:'0.75rem', color:'#52525B' }}>{s.batchId?.name}</div>
              </div>
              <span style={{ fontSize:'0.82rem', color:'#22D3A5', fontWeight:600 }}>{s.time}</span>
            </div>
          ))}
        </div>

        {/* Recent marks */}
        <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'0.9rem', fontWeight:600, color:'#fff' }}>Recent Marks</span>
            <Link to="/dashboard/marks" style={{ fontSize:'0.78rem', color:'#22D3A5', textDecoration:'none' }}>View all →</Link>
          </div>
          {loading ? <div style={{ padding:32, textAlign:'center', color:'#52525B' }}>Loading…</div>
          : marks.length === 0 ? <div style={{ padding:32, textAlign:'center', color:'#52525B' }}>No tests yet</div>
          : marks.slice(0, 4).map(m => {
            const pct = m.testId?.maxMarks ? Math.round((m.marksObtained / m.testId.maxMarks) * 100) : 0;
            const color = pct >= 75 ? '#22D3A5' : pct >= 50 ? '#f59e0b' : '#f87171';
            return (
              <div key={m._id} style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#fff' }}>{m.testId?.subject || '—'}</div>
                  <div style={{ fontSize:'0.75rem', color:'#52525B' }}>{m.testId?.batchId?.name}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:700, color }}>{m.marksObtained}/{m.testId?.maxMarks}</div>
                  <div style={{ fontSize:'0.72rem', color }}>{pct}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12, marginTop:20 }}>
        {[
          { to:'/dashboard/schedule',   icon:'📅', label:'My Schedule',   color:'#60A5FA' },
          { to:'/dashboard/attendance', icon:'✅', label:'Attendance',    color:'#22D3A5' },
          { to:'/dashboard/marks',      icon:'🏆', label:'My Marks',      color:'#A78BFA' },
          { to:'/dashboard/materials',  icon:'📁', label:'Materials',     color:'#f59e0b' },
          { to:'/courses',              icon:'🛒', label:'Browse Courses', color:'#f87171' },
        ].map(q => (
          <Link key={q.to} to={q.to} style={{ background:'#141418', border:`1px solid ${q.color}20`, borderRadius:14, padding:'16px', textAlign:'center', textDecoration:'none', transition:'all 0.2s', display:'block' }}
            onMouseOver={e => { e.currentTarget.style.borderColor=`${q.color}50`; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.background=`${q.color}08`; }}
            onMouseOut={e => { e.currentTarget.style.borderColor=`${q.color}20`; e.currentTarget.style.transform=''; e.currentTarget.style.background='#141418'; }}
          >
            <div style={{ fontSize:'1.5rem', marginBottom:8 }}>{q.icon}</div>
            <div style={{ fontSize:'0.8rem', fontWeight:600, color:q.color }}>{q.label}</div>
          </Link>
        ))}
      </div>
    </StudentLayout>
  );
}
