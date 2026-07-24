import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProfileMenu from '../components/ProfileMenu';

/* ── Rich content keyed by exact backend course name ── */
const RICH = {
  'CCC (Government)':                  { slug:'ccc',           icon:'🖥️', accent:'#22D3A5', glow:'rgba(34,211,165,0.15)',  tag:'Popular', tagColor:'#22D3A5' },
  'Tally Prime with GST':              { slug:'tally-prime',   icon:'📊', accent:'#A78BFA', glow:'rgba(167,139,250,0.15)' },
  'Graphic Design':                    { slug:'graphic-design',icon:'🎨', accent:'#60A5FA', glow:'rgba(96,165,250,0.15)'  },
  'Advance MS Office':                 { slug:'ms-office',     icon:'📝', accent:'#22D3A5', glow:'rgba(34,211,165,0.15)'  },
  'PGDCA':                             { slug:'pgdca',         icon:'🎓', accent:'#A78BFA', glow:'rgba(167,139,250,0.15)' },
  'Diploma in Computer Application':   { slug:'dca',           icon:'💻', accent:'#60A5FA', glow:'rgba(96,165,250,0.15)'  },
  '2D Animation':                      { slug:'2d-animation',  icon:'🎬', accent:'#f59e0b', glow:'rgba(245,158,11,0.15)',  tag:'New', tagColor:'#f59e0b' },
};

/* Fallback for courses not in RICH map — uses generic icon/colors, no dedicated detail page */
const FALLBACK = { slug: null, icon: '📚', accent: '#22D3A5', glow: 'rgba(34,211,165,0.15)' };

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [scrolled, setScrolled]   = useState(false);
  const [enrolling, setEnrolling] = useState(null); // courseId currently being enrolled
  const [toast, setToast]         = useState('');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    api.get('/courses')
      .then(r => setCourses(r.data?.data || r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const showToast = (msg, success = false) => {
    setToast({ msg, success });
    setTimeout(() => setToast(''), 3500);
  };

  // Used for free courses that have no dedicated detail/slug page
  const handleDirectEnroll = async (courseId) => {
    if (!token) { navigate('/login', { state: { redirect: '/courses' } }); return; }
    if (enrolling) return;
    setEnrolling(courseId);
    try {
      await api.post('/enrollments/free', { courseId });
      showToast('Enrolled successfully! Redirecting…', true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0B0B0F', fontFamily:'Inter, sans-serif', color:'#fff' }}>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position:'fixed', top:20, right:20, zIndex:9999,
          padding:'12px 20px', borderRadius:10,
          background: toast.success ? 'rgba(34,211,165,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.success ? 'rgba(34,211,165,0.35)' : 'rgba(239,68,68,0.35)'}`,
          color: toast.success ? '#22D3A5' : '#f87171',
          fontSize:'0.875rem', fontWeight:600, boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
        }}>{toast.msg}</div>
      )}
      {/* Navbar */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100, height:64,
        display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 5%',
        background: scrolled ? 'rgba(11,11,15,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition:'all 0.3s ease',
      }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none' }}>
          <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,#22D3A5,#16a085)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 18px rgba(34,211,165,0.35)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontWeight:800, fontSize:'1rem', color:'#fff', letterSpacing:'-0.02em' }}>VCZone</span>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {user?.name ? (
            <ProfileMenu user={user} onLogout={handleLogout} />
          ) : (
            <>
              <Link to="/login" style={{ padding:'7px 18px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', color:'#A1A1AA', fontSize:'0.85rem', fontWeight:500, textDecoration:'none' }}>Login</Link>
              <Link to="/register" style={{ padding:'7px 18px', borderRadius:8, background:'linear-gradient(135deg,#22D3A5,#16a085)', color:'#000', fontSize:'0.85rem', fontWeight:700, textDecoration:'none' }}>Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding:'120px 5% 60px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:600, height:400, background:'radial-gradient(circle, rgba(34,211,165,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px', borderRadius:99, background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.2)', color:'#22D3A5', fontSize:'0.78rem', fontWeight:600, marginBottom:20 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#22D3A5', display:'inline-block' }} />
          All Courses
        </div>
        <h1 style={{ fontSize:'clamp(2rem, 5vw, 3.5rem)', fontWeight:900, letterSpacing:'-0.04em', marginBottom:16, lineHeight:1.1 }}>
          Find Your Perfect{' '}
          <span style={{ background:'linear-gradient(135deg,#22D3A5,#A78BFA)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Course</span>
        </h1>
        <p style={{ color:'#71717A', fontSize:'1rem', maxWidth:500, margin:'0 auto', lineHeight:1.7 }}>
          {loading ? '…' : courses.length} courses available — from government-certified programs to professional creative skills.
        </p>
      </section>

      {/* Grid */}
      <section style={{ padding:'0 5% 100px', maxWidth:1200, margin:'0 auto' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:60, color:'#52525B' }}>Loading courses…</div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, color:'#52525B' }}>No courses available yet.</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:20 }}>
            {courses.map((c, i) => {
              const rich = RICH[c.name] || FALLBACK;
              const { icon, accent, glow, tag, tagColor, slug } = rich;
              const target = slug ? `/course/${slug}` : null;

              return (
                <div key={c._id} style={{
                  background:'#141418', border:'1px solid rgba(255,255,255,0.07)',
                  borderRadius:20, padding:24, transition:'all 0.3s ease',
                  position:'relative', overflow:'hidden',
                  animation:`fadeUp 0.5s ease ${i*0.06}s both`,
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor=`${accent}40`; e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow=`0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${glow}`; }}
                onMouseOut={e  => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
                >
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
                  <div style={{ position:'absolute', top:0, right:0, width:100, height:100, background:`radial-gradient(circle at top right, ${glow}, transparent 70%)`, pointerEvents:'none' }} />
                  {tag && <div style={{ position:'absolute', top:14, right:14, padding:'3px 10px', borderRadius:99, fontSize:'0.68rem', fontWeight:700, background:`${tagColor}18`, border:`1px solid ${tagColor}40`, color:tagColor, textTransform:'uppercase' }}>{tag}</div>}

                  <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:20 }}>
                    <div style={{ width:46, height:46, borderRadius:12, flexShrink:0, background:glow, border:`1px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>{icon}</div>
                    <h3 style={{ fontSize:'1rem', fontWeight:700, color:'#fff', lineHeight:1.3, paddingTop:4 }}>{c.name}</h3>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:'0.72rem', color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em', width:60 }}>Duration</span>
                      <span style={{ fontSize:'0.85rem', color:'#A1A1AA', fontWeight:500 }}>{c.duration}</span>
                    </div>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ fontSize:'0.7rem', color:'#52525B', marginBottom:2 }}>Course Fee</div>
                      <div style={{ fontSize:'1.3rem', fontWeight:800, color:accent }}>
                        {c.price === 0 ? 'FREE' : `₹${c.price?.toLocaleString()}`}
                      </div>
                    </div>
                    {target ? (
                      /* Known course — go to dedicated detail page */
                      <Link to={target} style={{ padding:'8px 18px', borderRadius:8, fontSize:'0.82rem', fontWeight:600, background:glow, border:`1px solid ${accent}30`, color:accent, textDecoration:'none', transition:'all 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background=`${accent}25`}
                        onMouseOut={e  => e.currentTarget.style.background=glow}
                      >View Course →</Link>
                    ) : c.price === 0 ? (
                      /* Unmapped free course — enroll directly without a detail page */
                      <button
                        onClick={() => handleDirectEnroll(c._id)}
                        disabled={enrolling === c._id}
                        style={{ padding:'8px 18px', borderRadius:8, fontSize:'0.82rem', fontWeight:600, background: enrolling === c._id ? 'rgba(34,211,165,0.06)' : glow, border:`1px solid ${accent}30`, color:accent, cursor: enrolling === c._id ? 'not-allowed' : 'pointer', transition:'all 0.2s', fontFamily:'Inter, sans-serif', opacity: enrolling === c._id ? 0.6 : 1 }}
                      >{enrolling === c._id ? 'Enrolling…' : 'Enroll Free'}</button>
                    ) : (
                      /* Unmapped paid course — redirect to login first, then let CoursePage handle Razorpay */
                      <button
                        onClick={() => token ? navigate('/login') : navigate('/login', { state: { redirect: '/courses' } })}
                        style={{ padding:'8px 18px', borderRadius:8, fontSize:'0.82rem', fontWeight:600, background:glow, border:`1px solid ${accent}30`, color:accent, cursor:'pointer', transition:'all 0.2s', fontFamily:'Inter, sans-serif' }}
                      >Enroll →</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
