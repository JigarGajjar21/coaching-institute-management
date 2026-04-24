import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProfileMenu from '../components/ProfileMenu';

/* ── Navbar ── */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user') || '{}');
  const loggedIn = !!localStorage.getItem('token') && !!user.name;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 5%',
      height: '68px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled ? 'rgba(11,11,15,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #22D3A5, #16a085)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(34,211,165,0.3)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>VCZone</span>
      </div>

      {/* Desktop nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
        {['Features', 'Courses'].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} style={{
            color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500,
            transition: 'color 0.2s',
          }}
          onMouseOver={e => e.target.style.color = '#fff'}
          onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}
          >{item}</a>
        ))}
        <Link to="/about" style={{
          color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500,
          transition: 'color 0.2s',
        }}
        onMouseOver={e => e.target.style.color = '#fff'}
        onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}
        >About Us</Link>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {loggedIn ? (
          <ProfileMenu user={user} onLogout={handleLogout} />
        ) : (
          <>
            <Link to="/login" style={{
              padding: '8px 20px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

/* ── Hero ── */
const Hero = () => (
  <section style={{
    minHeight: '100vh',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    textAlign: 'center',
    padding: '120px 5% 80px',
    position: 'relative',
    overflow: 'hidden',
  }}>
    {/* Background glow orbs */}
    <div style={{
      position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
      width: 600, height: 600,
      background: 'radial-gradient(circle, rgba(34,211,165,0.06) 0%, transparent 70%)',
      pointerEvents: 'none',
    }} />
    <div style={{
      position: 'absolute', top: '40%', left: '20%',
      width: 300, height: 300,
      background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)',
      pointerEvents: 'none',
    }} />

    <div className="badge badge-green animate-fade-up" style={{ marginBottom: 24 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }} />
      Vikas Computer Zone — Official Portal
    </div>

    {/* Headline */}
    <h1 className="animate-fade-up delay-1" style={{
      fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
      fontWeight: 900,
      lineHeight: 1.1,
      letterSpacing: '-0.04em',
      maxWidth: 800,
      marginBottom: 24,
    }}>
      Master Computer Skills at {' '}
      <span style={{
        background: 'linear-gradient(135deg, #22D3A5, #A78BFA)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        VCZone
      </span>
    </h1>

    {/* Subtext */}
    <p className="animate-fade-up delay-2" style={{
      fontSize: 'clamp(1rem, 2vw, 1.2rem)',
      color: 'var(--text-secondary)',
      maxWidth: 560,
      lineHeight: 1.7,
      marginBottom: 40,
    }}>
      Vikas Computer Zone offers industry-relevant computer courses — CCC, Advance MS Office, Tally Prime, Graphic Design and more. Enroll online or offline, attend classes, get certified, get job-ready.
    </p>

    {/* CTAs */}
    <div className="animate-fade-up delay-3" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 }}>
      <a href="#courses" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
        Enroll Now →
      </a>
      <a href="#features" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
        See Features
      </a>
    </div>

    {/* Stats strip */}
    <div className="animate-fade-up delay-4" style={{
      display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center',
    }}>
      {[
        { value: '1000+', label: 'Students Enrolled' },
        { value: '8+', label: 'Courses Offered' },
        { value: '5+', label: 'Years of Excellence' },
        { value: '80%', label: 'Students Got Jobs' },
      ].map(stat => (
        <div key={stat.label} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{stat.value}</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 6 }}>{stat.label}</div>
        </div>
      ))}
    </div>

    {/* Dashboard preview */}
    <div className="animate-fade-up delay-5" style={{
      marginTop: 80,
      width: '100%', maxWidth: 900,
      borderRadius: 24,
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'var(--bg-card)',
      overflow: 'hidden',
      boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
      position: 'relative',
    }}>
      {/* Fake browser bar */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        <div style={{
          flex: 1, marginLeft: 12, height: 24, borderRadius: 6,
          background: 'rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', paddingLeft: 12,
        }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>vczone.in/admin/dashboard</span>
        </div>
      </div>

      {/* Dashboard mockup */}
      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, minHeight: 320 }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['Dashboard', 'Users', 'Batches', 'Courses', 'Enrollment', 'Schedule', 'Attendance'].map((item, i) => (
            <div key={item} style={{
              padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem',
              background: i === 0 ? 'rgba(34,211,165,0.12)' : 'transparent',
              color: i === 0 ? 'var(--accent-green)' : 'var(--text-muted)',
              border: i === 0 ? '1px solid rgba(34,211,165,0.2)' : '1px solid transparent',
            }}>{item}</div>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Total Students', value: '248', color: 'var(--accent-green)' },
              { label: 'Active Batches', value: '12', color: 'var(--accent-purple)' },
              { label: 'Courses', value: '6', color: 'var(--accent-blue)' },
            ].map(card => (
              <div key={card.label} style={{
                padding: 16, borderRadius: 12,
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>{card.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: card.color }}>{card.value}</div>
              </div>
            ))}
          </div>
          {/* Fake table */}
          <div style={{ borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {['Student', 'Batch', 'Status'].map(h => (
                <div key={h} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>
            {[
              ['Rahul Sharma', 'CCC Batch A', 'Active'],
              ['Priya Patel', 'MS Office B', 'Active'],
              ['Amit Kumar', 'Tally C', 'Pending'],
            ].map(([name, batch, status]) => (
              <div key={name} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 500 }}>{name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{batch}</div>
                <div style={{
                  display: 'inline-flex', padding: '2px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600,
                  background: status === 'Active' ? 'rgba(34,211,165,0.1)' : 'rgba(245,158,11,0.1)',
                  color: status === 'Active' ? 'var(--accent-green)' : '#f59e0b',
                  border: `1px solid ${status === 'Active' ? 'rgba(34,211,165,0.2)' : 'rgba(245,158,11,0.2)'}`,
                  width: 'fit-content',
                }}>{status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ── Why Us ── */
const whyUs = [
  {
    icon: '�️',
    title: 'Practical Training',
    desc: 'Learn by doing — every concept is taught with hands-on practice alongside theory, guided by experienced faculty who make complex topics simple.',
    accent: 'var(--accent-green)',
    glow: 'var(--glow-green)',
  },
  {
    icon: '🏆',
    title: 'Industry Certification',
    desc: 'Graduate with a recognized certificate in your chosen course — CCC, MS Office, Tally, or DTP — and step into the job market with confidence.',
    accent: 'var(--accent-purple)',
    glow: 'var(--glow-purple)',
  },
  {
    icon: '🤝',
    title: 'Personal Assistance',
    desc: 'Get one-on-one guidance for clearing doubts, building your resume, and applying for jobs. We stay with you even after the course ends.',
    accent: 'var(--accent-blue)',
    glow: 'rgba(96,165,250,0.15)',
  },
  {
    icon: '�',
    title: 'Flexible Batch Timings',
    desc: 'Morning, afternoon, and evening batches available so you can learn without disrupting your school, college, or work schedule.',
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
  },
  {
    icon: '�',
    title: 'Affordable Fees',
    desc: 'Quality computer education at fees that won\'t break the bank. Pay online instantly or visit us in person — your choice.',
    accent: 'var(--accent-green)',
    glow: 'var(--glow-green)',
  },
  {
    icon: '🌐',
    title: 'Online Student Portal',
    desc: 'Access your schedule, attendance, marks, and study materials anytime from your phone or laptop through the VCZone student portal.',
    accent: 'var(--accent-purple)',
    glow: 'var(--glow-purple)',
  },
];

const WhyUs = () => (
  <section id="features" style={{ padding: '100px 5%', position: 'relative' }}>
    <div style={{ textAlign: 'center', marginBottom: 64 }}>
      <div className="badge badge-purple" style={{ marginBottom: 16, display: 'inline-flex' }}>Why VCZone?</div>
      <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
        More than just a computer class
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', fontSize: '1.05rem' }}>
        We don't just teach software — we build careers. Here's what makes Vikas Computer Zone different.
      </p>
    </div>

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 20,
      maxWidth: 1100,
      margin: '0 auto',
    }}>
      {whyUs.map((f, i) => (
        <div key={f.title} className="card animate-fade-up" style={{
          animationDelay: `${i * 0.08}s`,
          opacity: 0,
          animationFillMode: 'forwards',
          cursor: 'default',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseOver={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${f.glow}`;
        }}
        onMouseOut={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 120, height: 120,
            background: `radial-gradient(circle at top right, ${f.glow}, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: f.glow,
            border: `1px solid ${f.accent}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', marginBottom: 16,
          }}>
            {f.icon}
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 10, color: '#fff' }}>{f.title}</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);



/* ── Rich content keyed by exact backend course name ── */
const COURSE_RICH = {
  'CCC (Government)':                { slug:'ccc',           icon:'🖥️', accent:'var(--accent-green)', glow:'var(--glow-green)',         tag:'Popular', tagColor:'#22D3A5' },
  'Tally Prime with GST':            { slug:'tally-prime',   icon:'📊', accent:'var(--accent-purple)', glow:'var(--glow-purple)'        },
  'Graphic Design':                  { slug:'graphic-design',icon:'🎨', accent:'var(--accent-blue)',   glow:'rgba(96,165,250,0.15)'     },
  'Advance MS Office':               { slug:'ms-office',     icon:'📝', accent:'var(--accent-green)', glow:'var(--glow-green)'          },
  'PGDCA':                           { slug:'pgdca',         icon:'🎓', accent:'var(--accent-purple)', glow:'var(--glow-purple)'        },
  'Diploma in Computer Application': { slug:'dca',           icon:'💻', accent:'var(--accent-blue)',   glow:'rgba(96,165,250,0.15)'     },
  '2D Animation':                    { slug:'2d-animation',  icon:'🎬', accent:'#f59e0b',              glow:'rgba(245,158,11,0.15)',     tag:'New', tagColor:'#f59e0b' },
};
const FALLBACK_RICH = { slug: null, icon: '📚', accent: 'var(--accent-green)', glow: 'var(--glow-green)' };

const CourseCard = ({ c, i }) => {
  const rich = COURSE_RICH[c.name] || FALLBACK_RICH;
  const { icon, accent, glow, tag, tagColor, slug } = rich;
  return (
    <div className="animate-fade-up" style={{
      animationDelay: `${i * 0.07}s`, opacity: 0, animationFillMode: 'forwards',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 20, padding: '24px', transition: 'all 0.3s ease',
      position: 'relative', overflow: 'hidden',
    }}
    onMouseOver={e => { e.currentTarget.style.borderColor=`${accent}40`; e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow=`0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${glow}`; }}
    onMouseOut={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
    >
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div style={{ position:'absolute', top:0, right:0, width:100, height:100, background:`radial-gradient(circle at top right, ${glow}, transparent 70%)`, pointerEvents:'none' }} />
      {tag && (
        <div style={{ position:'absolute', top:14, right:14, padding:'3px 10px', borderRadius:99, fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.06em', background:`${tagColor}18`, border:`1px solid ${tagColor}40`, color:tagColor, textTransform:'uppercase' }}>{tag}</div>
      )}
      <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:20 }}>
        <div style={{ width:46, height:46, borderRadius:12, flexShrink:0, background:glow, border:`1px solid ${accent}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>{icon}</div>
        <h3 style={{ fontSize:'1rem', fontWeight:700, color:'#fff', lineHeight:1.3, paddingTop:4 }}>{c.name}</h3>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', width:60 }}>Duration</span>
          <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)', fontWeight:500 }}>{c.duration}</span>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:20, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:2 }}>Course Fee</div>
          <div style={{ fontSize:'1.3rem', fontWeight:800, color:accent }}>₹{c.price?.toLocaleString()}</div>
        </div>
        {slug ? (
          <Link to={`/course/${slug}`} style={{ padding:'8px 18px', borderRadius:8, fontSize:'0.82rem', fontWeight:600, background:glow, border:`1px solid ${accent}30`, color:accent, textDecoration:'none', transition:'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background=`${accent}25`}
            onMouseOut={e => e.currentTarget.style.background=glow}
          >View Course →</Link>
        ) : (
          <span style={{ padding:'8px 18px', borderRadius:8, fontSize:'0.82rem', color:'var(--text-muted)', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)' }}>Coming Soon</span>
        )}
      </div>
    </div>
  );
};

const CoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(r => setCourses(r.data?.data || r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayed = courses.slice(0, 3);

  return (
    <section id="courses" style={{ padding: '100px 5%' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div className="badge badge-green" style={{ marginBottom: 16, display: 'inline-flex' }}>Our Courses</div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
          Courses offered at VCZone
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
          From government-certified programs to professional design courses — find the right path for your career.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Loading courses…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {displayed.map((c, i) => <CourseCard key={c._id} c={c} i={i} />)}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Link to="/courses" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 32px', borderRadius: 12,
          border: '1px solid rgba(34,211,165,0.3)',
          color: '#22D3A5', fontSize: '0.95rem', fontWeight: 600,
          textDecoration: 'none', transition: 'all 0.25s',
          background: 'rgba(34,211,165,0.06)',
        }}
        onMouseOver={e => { e.currentTarget.style.background='rgba(34,211,165,0.12)'; e.currentTarget.style.borderColor='rgba(34,211,165,0.5)'; e.currentTarget.style.transform='translateY(-2px)'; }}
        onMouseOut={e => { e.currentTarget.style.background='rgba(34,211,165,0.06)'; e.currentTarget.style.borderColor='rgba(34,211,165,0.3)'; e.currentTarget.style.transform=''; }}
        >
          View All {courses.length > 3 ? `${courses.length} ` : ''}Courses →
        </Link>
      </div>
    </section>
  );
};
const CTA = () => (
  <section style={{ padding: '80px 5% 120px', textAlign: 'center' }}>
    <div style={{
      maxWidth: 700, margin: '0 auto',
      background: 'linear-gradient(135deg, rgba(34,211,165,0.06), rgba(167,139,250,0.06))',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 28,
      padding: '64px 48px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(34,211,165,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="badge badge-green" style={{ marginBottom: 20, display: 'inline-flex' }}>
        Join VCZone Today
      </div>
      <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16 }}>
        Start your computer career<br />with Vikas Computer Zone
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '1rem', maxWidth: 440, margin: '0 auto 36px' }}>
        CCC, MS Office, Tally, DTP and more. Register online, pay fees digitally, and start learning today.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/register" className="btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
          Enroll Now →
        </Link>
        <Link to="/login" className="btn-secondary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
          Login
        </Link>
      </div>
    </div>
  </section>
);

/* ── Footer ── */
const Footer = () => (
  <footer style={{
    borderTop: '1px solid var(--border)',
    background: 'var(--bg-surface)',
    padding: '64px 5% 32px',
  }}>
    {/* Top row */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 48,
      maxWidth: 1100,
      margin: '0 auto 48px',
    }}>
      {/* Brand */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #22D3A5, #16a085)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(34,211,165,0.25)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>VCZone</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 220 }}>
          Vikas Computer Zone — empowering students with practical computer skills since 2019.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Quick Links</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="#features" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = '#fff'}
            onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
          >Features</a>
          <a href="#courses" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = '#fff'}
            onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
          >Courses</a>
          <Link to="/about" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = '#fff'}
            onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
          >About Us</Link>
        </div>
      </div>

      {/* Account */}
      <div>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Account</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Login', to: '/login' },
            { label: 'Register', to: '/register' },
          ].map(({ label, to }) => (
            <Link key={label} to={to} style={{ fontSize: '0.875rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}
              onMouseOver={e => e.target.style.color = '#fff'}
              onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
            >{label}</Link>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Contact</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '📍', text: 'Vikas Computer Zone, Saraspur, Ahmedabad, Gujarat-380018' },
            { icon: '📞', text: '+91 9265579597' },
            { icon: '✉️', text: 'vczone2019@email.com' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '0.9rem' }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Divider */}
    <div style={{ borderTop: '1px solid var(--border)', maxWidth: 1100, margin: '0 auto', paddingTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          © 2026 Vikas Computer Zone. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy Policy', 'Terms of Service'].map(item => (
            <a key={item} href="#" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', transition: 'color 0.2s' }}
              onMouseOver={e => e.target.style.color = '#fff'}
              onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
            >{item}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

/* ── Page ── */
export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <Hero />
      <div className="divider" style={{ margin: '0 5%' }} />
      <WhyUs />
      <div className="divider" style={{ margin: '0 5%' }} />
      <CoursesSection />
      <CTA />
      <Footer />
    </div>
  );
}
