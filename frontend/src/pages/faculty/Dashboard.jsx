import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FacultyLayout from '../../layouts/FacultyLayout';
import { getFacultySchedule, getFacultyBatches, getBatchAttendance } from '../../services/facultyApi';

const ACCENT = '#A78BFA';

const StatCard = ({ icon, label, value, color, sub, loading }) => (
  <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'20px 24px', transition:'all 0.25s', position:'relative', overflow:'hidden' }}
    onMouseOver={e => { e.currentTarget.style.borderColor=`${color}30`; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${color}15`; }}
    onMouseOut={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
  >
    <div style={{ position:'absolute', top:0, right:0, width:80, height:80, background:`radial-gradient(circle at top right, ${color}18, transparent 70%)`, pointerEvents:'none' }} />
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

export default function FacultyDashboard() {
  const [batches,    setBatches]    = useState([]);
  const [schedule,   setSchedule]   = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    Promise.allSettled([
      getFacultyBatches(),
      getFacultySchedule(),
      getBatchAttendance(),
    ]).then(([b, s, a]) => {
      setBatches(b.status === 'fulfilled' ? (b.value.data?.data || []) : []);
      setSchedule(s.status === 'fulfilled' ? (s.value.data?.schedules || []) : []);
      setAttendance(a.status === 'fulfilled' ? (a.value.data || []) : []);
    }).finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClasses = schedule.filter(s => s.day === today);
  const totalStudents = batches.reduce((sum, b) => sum + (b.students?.length || 0), 0);

  return (
    <FacultyLayout>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:4 }}>
          Welcome, {user.name?.split(' ')[0] || 'Faculty'} 👋
        </h1>
        <p style={{ color:'#52525B', fontSize:'0.875rem' }}>Here's your teaching overview for today.</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:16, marginBottom:28 }}>
        <StatCard icon="🎓" label="My Batches"       value={batches.length}       color={ACCENT}    sub="assigned to you"   loading={loading} />
        <StatCard icon="👥" label="Total Students"   value={totalStudents}        color="#60A5FA"   sub="across all batches" loading={loading} />
        <StatCard icon="📅" label="Today's Classes"  value={todayClasses.length}  color="#22D3A5"   sub={today}             loading={loading} />
        <StatCard icon="✅" label="Attendance Taken" value={attendance.length}    color="#f59e0b"   sub="total records"     loading={loading} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Today's schedule */}
        <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'0.9rem', fontWeight:600, color:'#fff' }}>Today's Classes</span>
            <Link to="/faculty/schedule" style={{ fontSize:'0.78rem', color:ACCENT, textDecoration:'none' }}>Full schedule →</Link>
          </div>
          {loading ? <div style={{ padding:32, textAlign:'center', color:'#52525B' }}>Loading…</div>
          : todayClasses.length === 0 ? <div style={{ padding:32, textAlign:'center', color:'#52525B' }}>No classes today 🎉</div>
          : todayClasses.map(s => (
            <div key={s._id} style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#fff' }}>{s.subject}</div>
                <div style={{ fontSize:'0.75rem', color:'#52525B' }}>{s.batchId?.name}</div>
              </div>
              <span style={{ fontSize:'0.82rem', color:ACCENT, fontWeight:600 }}>{s.time}</span>
            </div>
          ))}
        </div>

        {/* My Batches */}
        <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'0.9rem', fontWeight:600, color:'#fff' }}>My Batches</span>
            <Link to="/faculty/attendance" style={{ fontSize:'0.78rem', color:ACCENT, textDecoration:'none' }}>Mark attendance →</Link>
          </div>
          {loading ? <div style={{ padding:32, textAlign:'center', color:'#52525B' }}>Loading…</div>
          : batches.length === 0 ? <div style={{ padding:32, textAlign:'center', color:'#52525B' }}>No batches assigned yet.</div>
          : batches.slice(0, 5).map(b => (
            <div key={b._id} style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#fff' }}>{b.name}</div>
                <div style={{ fontSize:'0.75rem', color:'#52525B' }}>{b.courseId?.name}</div>
              </div>
              <span style={{ padding:'2px 10px', borderRadius:99, background:'rgba(167,139,250,0.1)', color:ACCENT, fontSize:'0.72rem', fontWeight:600 }}>
                {b.students?.length || 0} students
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12 }}>
        {[
          { to:'/faculty/schedule',   icon:'📅', label:'My Schedule',   color:'#60A5FA' },
          { to:'/faculty/attendance', icon:'✅', label:'Attendance',    color:'#22D3A5' },
          { to:'/faculty/marks',      icon:'🏆', label:'Marks',         color:ACCENT },
          { to:'/faculty/materials',  icon:'📁', label:'Materials',     color:'#f59e0b' },
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
    </FacultyLayout>
  );
}
