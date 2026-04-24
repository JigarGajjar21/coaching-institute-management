import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Blob = ({ style }) => (
  <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', ...style }} />
);

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [status, setStatus]   = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email) { setStatus('error'); setMessage('Please enter your email address.'); return; }
    setStatus('loading');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(data.message || 'Reset link sent! Check your inbox.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0B0B0F',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      <Blob style={{ width: 500, height: 500, top: '-15%', left: '-10%', background: 'rgba(167,139,250,0.07)' }} />
      <Blob style={{ width: 400, height: 400, bottom: '-10%', right: '-5%', background: 'rgba(34,211,165,0.06)' }} />

      <div style={{
        width: '100%', maxWidth: 420, position: 'relative', zIndex: 2,
        background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24,
        padding: '40px 36px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        animation: 'fadeUp 0.5s ease forwards',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #22D3A5, #16a085)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(34,211,165,0.3)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', letterSpacing: '-0.02em' }}>VCZone</span>
        </Link>

        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: 14, marginBottom: 20,
          background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
        }}>🔑</div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 8 }}>
          Forgot password?
        </h1>
        <p style={{ color: '#71717A', fontSize: '0.9rem', marginBottom: 28, lineHeight: 1.6 }}>
          Enter your registered email and we'll send you a reset link. Valid for 10 minutes.
        </p>

        {status === 'success' ? (
          <div style={{
            padding: '20px', borderRadius: 14, textAlign: 'center',
            background: 'rgba(34,211,165,0.08)', border: '1px solid rgba(34,211,165,0.2)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>📬</div>
            <p style={{ color: '#22D3A5', fontWeight: 600, marginBottom: 6 }}>Email sent!</p>
            <p style={{ color: '#71717A', fontSize: '0.85rem' }}>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {status === 'error' && (
              <div style={{
                padding: '11px 14px', borderRadius: 10,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171', fontSize: '0.85rem',
              }}>{message}</div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#A1A1AA', marginBottom: 7, letterSpacing: '0.04em' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email" value={email} placeholder="you@example.com"
                onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{
                  width: '100%', padding: '13px 16px', boxSizing: 'border-box',
                  background: focused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${focused ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 12, color: '#fff', fontSize: '0.95rem',
                  fontFamily: 'inherit', outline: 'none',
                  boxShadow: focused ? '0 0 0 3px rgba(167,139,250,0.12)' : 'none',
                  transition: 'all 0.25s ease',
                }}
              />
            </div>

            <button type="submit" disabled={status === 'loading'} style={{
              padding: '13px', borderRadius: 12, border: 'none',
              background: status === 'loading' ? 'rgba(167,139,250,0.3)' : 'linear-gradient(135deg, #A78BFA, #60A5FA)',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              boxShadow: status === 'loading' ? 'none' : '0 4px 20px rgba(167,139,250,0.35)',
              transition: 'all 0.25s ease',
            }}
            onMouseOver={e => { if (status !== 'loading') { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(167,139,250,0.45)'; }}}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = status === 'loading' ? 'none' : '0 4px 20px rgba(167,139,250,0.35)'; }}
            >
              {status === 'loading' ? 'Sending…' : 'Send Reset Link →'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: '#52525B' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: '#A78BFA', fontWeight: 600, transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = '#c4b5fd'}
            onMouseOut={e => e.target.style.color = '#A78BFA'}
          >Back to login</Link>
        </p>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder { color: #3f3f46; }
      `}</style>
    </div>
  );
}
