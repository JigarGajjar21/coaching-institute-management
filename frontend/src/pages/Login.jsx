import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.state?.redirect || null;

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [focused, setFocused] = useState('');

  const handleChange = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role, _id: data._id }));
      if (redirect) { navigate(redirect, { replace: true }); return; }
      if (data.role === 'admin') { navigate('/admin/dashboard', { replace: true }); return; }
      if (data.role === 'faculty') { navigate('/faculty/dashboard', { replace: true }); return; }
      // Student: check if enrolled in any course
      try {
        const enroll = await api.get('/enrollments/status');
        if (enroll.data?.enrolled) navigate('/dashboard', { replace: true });
        else navigate('/courses', { replace: true });
      } catch { navigate('/courses', { replace: true }); }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatY { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-14px); } }
        @keyframes blob1 { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(20px,-20px) scale(1.1); } }
        @keyframes blob2 { 0%,100% { transform:translate(0,0) scale(1); } 50% { transform:translate(-15px,15px) scale(1.08); } }
        .auth-input {
          width:100%; padding:12px 16px 12px 42px;
          background:#0F0F14;
          border:1.5px solid rgba(255,255,255,0.14);
          border-radius:10px; color:#fff; font-size:0.92rem;
          font-family:'Inter',sans-serif; outline:none;
          box-shadow:0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
          transition:all 0.22s ease;
        }
        .auth-input:focus {
          border-color:#22D3A5;
          background:#111118;
          box-shadow:0 0 0 3px rgba(34,211,165,0.18), 0 2px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .auth-input::placeholder { color:#71717A; }
        .auth-btn {
          width:100%; padding:13px; border:none; border-radius:10px;
          background:linear-gradient(135deg,#22D3A5,#16a085);
          color:#000; font-weight:700; font-size:0.95rem;
          font-family:'Inter',sans-serif; cursor:pointer;
          box-shadow:0 4px 20px rgba(34,211,165,0.35);
          transition:all 0.25s ease; letter-spacing:0.01em;
        }
        .auth-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 32px rgba(34,211,165,0.45); }
        .auth-btn:disabled { opacity:0.5; cursor:not-allowed; }
        @media (max-width:700px) {
          .auth-card { flex-direction:column !important; max-width:420px !important; border-radius:24px !important; }
          .auth-brand { min-height:220px !important; border-radius:24px 24px 0 0 !important; flex:none !important; width:100% !important; }
          .auth-form-side { padding:32px 24px !important; }
        }
      `}</style>

      {/* Page background */}
      <div style={{
        minHeight:'100vh', background:'#030305',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'88px 24px 24px', position:'relative', overflow:'hidden',
        fontFamily:'Inter, sans-serif',
      }}>
        <Navbar />
        {/* bg orbs */}
        <div style={{ position:'absolute', width:700, height:700, top:'-20%', left:'-15%', borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,165,0.07) 0%, transparent 65%)', animation:'blob1 12s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:500, height:500, bottom:'-15%', right:'-10%', borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 65%)', animation:'blob2 10s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }} />

        {/* Main card */}
        <div className="auth-card" style={{
          display:'flex', width:'100%', maxWidth:900,
          borderRadius:28, overflow:'hidden',
          border:'1px solid rgba(255,255,255,0.1)',
          boxShadow:`
            0 0 0 1px rgba(34,211,165,0.12),
            0 8px 32px rgba(34,211,165,0.08),
            0 32px 80px rgba(0,0,0,0.7),
            0 64px 160px rgba(0,0,0,0.5)
          `,
          animation:'fadeUp 0.55s ease forwards', position:'relative',
          minHeight:540,
        }}>

          {/* ── LEFT — Branding ── */}
          <div className="auth-brand" style={{
            flex:'0 0 48%', position:'relative', overflow:'hidden',
            background:'linear-gradient(145deg, #0D1F1A 0%, #0A1A14 40%, #060D0A 100%)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:'48px 52px 48px 40px', textAlign:'center',
            borderRadius:'0 80px 80px 0',
            zIndex:2,
          }}>
            {/* green glow blobs inside card */}
            <div style={{ position:'absolute', width:300, height:300, top:'-10%', left:'-10%', borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,165,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', width:200, height:200, bottom:'-5%', right:'-5%', borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,165,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />

            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:36, zIndex:1 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#22D3A5,#16a085)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 24px rgba(34,211,165,0.4)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontWeight:800, fontSize:'1.1rem', color:'#fff', letterSpacing:'-0.02em' }}>VCZone</span>
            </div>

            {/* Floating dashboard illustration */}
            <div style={{ width:'100%', maxWidth:260, animation:'floatY 5s ease-in-out infinite', zIndex:1, marginBottom:28 }}>
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(34,211,165,0.2)', borderRadius:16, padding:16, boxShadow:'0 16px 48px rgba(0,0,0,0.5)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <span style={{ fontSize:'0.65rem', fontWeight:700, color:'#22D3A5', letterSpacing:'0.08em' }}>DASHBOARD</span>
                  <div style={{ display:'flex', gap:4 }}>
                    {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width:7, height:7, borderRadius:'50%', background:c }} />)}
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
                  {[{v:'1.2k',l:'Students',c:'#22D3A5'},{v:'8',l:'Courses',c:'#A78BFA'},{v:'24',l:'Batches',c:'#60A5FA'}].map(s => (
                    <div key={s.l} style={{ padding:'8px 4px', borderRadius:8, textAlign:'center', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize:'0.95rem', fontWeight:800, color:s.c }}>{s.v}</div>
                      <div style={{ fontSize:'0.58rem', color:'#52525B', marginTop:2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                {[{l:'CCC Batch A',p:78,c:'#22D3A5'},{l:'Tally Prime',p:55,c:'#A78BFA'},{l:'Graphic Design',p:40,c:'#60A5FA'}].map(b => (
                  <div key={b.l} style={{ marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ fontSize:'0.62rem', color:'#A1A1AA' }}>{b.l}</span>
                      <span style={{ fontSize:'0.62rem', color:b.c, fontWeight:700 }}>{b.p}%</span>
                    </div>
                    <div style={{ height:3, borderRadius:99, background:'rgba(255,255,255,0.06)' }}>
                      <div style={{ height:'100%', width:`${b.p}%`, borderRadius:99, background:b.c }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h3 style={{ fontSize:'1.15rem', fontWeight:800, color:'#fff', letterSpacing:'-0.03em', marginBottom:8, zIndex:1 }}>
              New here?
            </h3>
            <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.45)', lineHeight:1.6, marginBottom:20, zIndex:1 }}>
              Create an account and start your computer learning journey with VCZone today.
            </p>
            <Link to="/register" style={{
              display:'inline-flex', alignItems:'center', gap:6,
              padding:'9px 22px', borderRadius:99,
              border:'1.5px solid rgba(34,211,165,0.4)',
              color:'#22D3A5', fontSize:'0.82rem', fontWeight:600,
              textDecoration:'none', transition:'all 0.2s', zIndex:1,
            }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(34,211,165,0.1)'; e.currentTarget.style.borderColor='#22D3A5'; }}
            onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(34,211,165,0.4)'; }}
            >Sign Up →</Link>
          </div>



          {/* ── RIGHT — Form ── */}
          <div className="auth-form-side" style={{
            flex:'1', background:'#030305',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:'48px 40px',
          }}>
            <div style={{ width:'100%', maxWidth:320 }}>
              <h2 style={{ fontSize:'1.7rem', fontWeight:800, color:'#fff', letterSpacing:'-0.03em', marginBottom:6, textAlign:'center' }}>
                Sign In
              </h2>
              <p style={{ color:'#52525B', fontSize:'0.85rem', textAlign:'center', marginBottom:28 }}>
                Welcome back to VCZone
              </p>

              {error && (
                <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:18, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#fca5a5', fontSize:'0.83rem', display:'flex', alignItems:'center', gap:8 }}>
                  ⚠ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {/* Email */}
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: focused==='email' ? '#22D3A5' : '#3f3f46', fontSize:'0.9rem', transition:'color 0.2s', pointerEvents:'none' }}>✉</span>
                  <input className="auth-input" name="email" type="email" placeholder="Email"
                    value={form.email} onChange={handleChange}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    autoComplete="email" />
                </div>

                {/* Password */}
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: focused==='password' ? '#22D3A5' : '#3f3f46', fontSize:'0.9rem', transition:'color 0.2s', pointerEvents:'none' }}>🔒</span>
                  <input className="auth-input" name="password" type={showPw ? 'text' : 'password'} placeholder="Password"
                    value={form.password} onChange={handleChange}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    style={{ paddingRight:44 }} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#3f3f46', fontSize:'0.85rem', padding:0, lineHeight:1, transition:'color 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.color='#A1A1AA'} onMouseOut={e => e.currentTarget.style.color='#3f3f46'}
                  >{showPw ? '🙈' : '👁'}</button>
                </div>

                <div style={{ textAlign:'right', marginTop:-6 }}>
                  <Link to="/forgot-password" style={{ fontSize:'0.78rem', color:'#22D3A5', fontWeight:500, transition:'opacity 0.2s' }}
                    onMouseOver={e => e.target.style.opacity='0.7'} onMouseOut={e => e.target.style.opacity='1'}
                  >Forgot password?</Link>
                </div>

                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? 'Signing in…' : 'LOGIN'}
                </button>
              </form>

              <div style={{ display:'flex', alignItems:'center', gap:10, margin:'20px 0' }}>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize:'0.72rem', color:'#3f3f46', whiteSpace:'nowrap' }}>Or Sign in with</span>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Social icons */}
              <div style={{ display:'flex', justifyContent:'center', gap:10 }}>
                {[
                  { icon:'f', label:'Facebook' },
                  { icon:'𝕏', label:'Twitter' },
                  { icon:'G', label:'Google' },
                  { icon:'in', label:'LinkedIn' },
                ].map(s => (
                  <button key={s.label} title={s.label} style={{
                    width:36, height:36, borderRadius:'50%',
                    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                    color:'#A1A1AA', fontSize:'0.75rem', fontWeight:700,
                    cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='rgba(34,211,165,0.4)'; e.currentTarget.style.color='#22D3A5'; e.currentTarget.style.background='rgba(34,211,165,0.08)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#A1A1AA'; e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}
                  >{s.icon}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
