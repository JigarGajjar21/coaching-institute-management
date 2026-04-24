import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm]         = useState({ name:'', email:'', password:'', confirm:'' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [focused, setFocused]   = useState('');
  const [strength, setStrength] = useState(0);

  const calcStrength = pw => {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9!@#$%^&*]/.test(pw)) s++;
    return s;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'password') setStrength(calcStrength(value));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role, _id: data._id }));
      // New student — no enrollments yet, go to courses
      navigate('/courses', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const strengthColors = ['#ef4444','#f59e0b','#22D3A5','#22D3A5'];
  const strengthLabels = ['Weak','Fair','Good','Strong'];

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
          border-color:#22D3A5; background:#111118;
          box-shadow:0 0 0 3px rgba(34,211,165,0.18), 0 2px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .auth-input::placeholder { color:#71717A; }
        .auth-input.err { border-color:rgba(239,68,68,0.5) !important; }
        .auth-btn {
          width:100%; padding:13px; border:none; border-radius:10px;
          background:linear-gradient(135deg,#22D3A5,#16a085);
          color:#000; font-weight:700; font-size:0.95rem;
          font-family:'Inter',sans-serif; cursor:pointer;
          box-shadow:0 4px 20px rgba(34,211,165,0.35);
          transition:all 0.25s ease;
        }
        .auth-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 32px rgba(34,211,165,0.45); }
        .auth-btn:disabled { opacity:0.5; cursor:not-allowed; }
        @media (max-width:700px) {
          .auth-card { flex-direction:column-reverse !important; max-width:420px !important; border-radius:24px !important; }
          .auth-brand { min-height:220px !important; border-radius:0 0 24px 24px !important; flex:none !important; width:100% !important; }
          .auth-form-side { padding:32px 24px !important; }
        }
      `}</style>

      <div style={{
        minHeight:'100vh', background:'#030305',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'88px 24px 24px', position:'relative', overflow:'hidden',
        fontFamily:'Inter, sans-serif',
      }}>
        <Navbar />
        {/* bg orbs */}
        <div style={{ position:'absolute', width:700, height:700, top:'-20%', right:'-15%', borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,165,0.07) 0%, transparent 65%)', animation:'blob1 12s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:500, height:500, bottom:'-15%', left:'-10%', borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 65%)', animation:'blob2 10s ease-in-out infinite', pointerEvents:'none' }} />
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
          minHeight:580,
        }}>

          {/* ── LEFT — Form ── */}
          <div className="auth-form-side" style={{
            flex:'1', background:'#030305',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:'48px 40px',
          }}>
            <div style={{ width:'100%', maxWidth:320 }}>
              <h2 style={{ fontSize:'1.7rem', fontWeight:800, color:'#fff', letterSpacing:'-0.03em', marginBottom:6, textAlign:'center' }}>
                Sign Up
              </h2>
              <p style={{ color:'#52525B', fontSize:'0.85rem', textAlign:'center', marginBottom:24 }}>
                Create your VCZone account
              </p>

              {error && (
                <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:14, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#fca5a5', fontSize:'0.83rem', display:'flex', alignItems:'center', gap:8 }}>
                  ⚠ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {/* Name */}
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: focused==='name' ? '#22D3A5' : '#3f3f46', fontSize:'0.9rem', transition:'color 0.2s', pointerEvents:'none' }}>👤</span>
                  <input className="auth-input" name="name" type="text" placeholder="Full Name"
                    value={form.name} onChange={handleChange}
                    onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                    autoComplete="name" />
                </div>

                {/* Email */}
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: focused==='email' ? '#22D3A5' : '#3f3f46', fontSize:'0.9rem', transition:'color 0.2s', pointerEvents:'none' }}>✉</span>
                  <input className="auth-input" name="email" type="email" placeholder="Email"
                    value={form.email} onChange={handleChange}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    autoComplete="email" />
                </div>

                {/* Password */}
                <div>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: focused==='password' ? '#22D3A5' : '#3f3f46', fontSize:'0.9rem', transition:'color 0.2s', pointerEvents:'none' }}>🔒</span>
                    <input className="auth-input" name="password" type={showPw ? 'text' : 'password'} placeholder="Password"
                      value={form.password} onChange={handleChange}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                      style={{ paddingRight:44 }} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#3f3f46', fontSize:'0.85rem', padding:0, lineHeight:1, transition:'color 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.color='#A1A1AA'} onMouseOut={e => e.currentTarget.style.color='#3f3f46'}
                    >{showPw ? '🙈' : '👁'}</button>
                  </div>
                  {form.password && (
                    <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ display:'flex', gap:3, flex:1 }}>
                        {[0,1,2,3].map(i => (
                          <div key={i} style={{ flex:1, height:3, borderRadius:99, background: i < strength ? strengthColors[strength-1] : 'rgba(255,255,255,0.07)', transition:'background 0.3s' }} />
                        ))}
                      </div>
                      {strength > 0 && <span style={{ fontSize:'0.68rem', color:strengthColors[strength-1], fontWeight:600, whiteSpace:'nowrap' }}>{strengthLabels[strength-1]}</span>}
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: focused==='confirm' ? '#22D3A5' : '#3f3f46', fontSize:'0.9rem', transition:'color 0.2s', pointerEvents:'none' }}>🔒</span>
                  <input
                    className={`auth-input${form.confirm && form.confirm !== form.password ? ' err' : ''}`}
                    name="confirm" type={showPw ? 'text' : 'password'} placeholder="Confirm Password"
                    value={form.confirm} onChange={handleChange}
                    onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')}
                    autoComplete="new-password" />
                  {form.confirm && form.confirm !== form.password && (
                    <p style={{ fontSize:'0.72rem', color:'#f87171', marginTop:4 }}>Passwords don't match</p>
                  )}
                </div>

                <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop:4 }}>
                  {loading ? 'Creating account…' : 'SIGN UP'}
                </button>
              </form>

              <div style={{ display:'flex', alignItems:'center', gap:10, margin:'18px 0' }}>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize:'0.72rem', color:'#3f3f46', whiteSpace:'nowrap' }}>Or Sign up with</span>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
              </div>

              <div style={{ display:'flex', justifyContent:'center', gap:10 }}>
                {[{icon:'f',label:'Facebook'},{icon:'𝕏',label:'Twitter'},{icon:'G',label:'Google'},{icon:'in',label:'LinkedIn'}].map(s => (
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

          {/* ── RIGHT — Branding ── */}
          <div className="auth-brand" style={{
            flex:'0 0 45%', position:'relative', overflow:'hidden',
            background:'linear-gradient(145deg, #0D1F1A 0%, #0A1A14 40%, #060D0A 100%)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:'48px 36px 48px 52px', textAlign:'center',
            borderRadius:'80px 0 0 80px',
            zIndex:2,
          }}>
            <div style={{ position:'absolute', width:300, height:300, top:'-10%', right:'-10%', borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,165,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', width:200, height:200, bottom:'-5%', left:'-5%', borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,165,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />

            {/* Floating steps card */}
            <div style={{ width:'100%', maxWidth:240, animation:'floatY 5s ease-in-out infinite', zIndex:1, marginBottom:28 }}>
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(34,211,165,0.2)', borderRadius:16, padding:16, boxShadow:'0 16px 48px rgba(0,0,0,0.5)' }}>
                <p style={{ fontSize:'0.62rem', color:'#22D3A5', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14, fontWeight:700 }}>How it works</p>
                {[
                  { n:'01', t:'Create account', c:'#22D3A5' },
                  { n:'02', t:'Browse courses',  c:'#A78BFA' },
                  { n:'03', t:'Attend & learn',  c:'#60A5FA' },
                  { n:'04', t:'Get certified',   c:'#f59e0b' },
                ].map((s, i) => (
                  <div key={s.n} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ width:24, height:24, borderRadius:6, background:`${s.c}15`, border:`1px solid ${s.c}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', fontWeight:800, color:s.c, flexShrink:0 }}>{s.n}</div>
                    <span style={{ fontSize:'0.75rem', color:'#e4e4e7', fontWeight:500 }}>{s.t}</span>
                  </div>
                ))}
              </div>
            </div>

            <h3 style={{ fontSize:'1.15rem', fontWeight:800, color:'#fff', letterSpacing:'-0.03em', marginBottom:8, zIndex:1 }}>
              One of us?
            </h3>
            <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.4)', lineHeight:1.6, marginBottom:20, zIndex:1 }}>
              Already have an account? Sign in and continue your learning journey.
            </p>
            <Link to="/login" style={{
              display:'inline-flex', alignItems:'center', gap:6,
              padding:'9px 22px', borderRadius:99,
              border:'1.5px solid rgba(34,211,165,0.4)',
              color:'#22D3A5', fontSize:'0.82rem', fontWeight:600,
              textDecoration:'none', transition:'all 0.2s', zIndex:1,
            }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(34,211,165,0.1)'; e.currentTarget.style.borderColor='#22D3A5'; }}
            onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(34,211,165,0.4)'; }}
            >Sign In →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
