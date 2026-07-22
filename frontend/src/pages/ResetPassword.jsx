import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Blob = ({ style }) => (
  <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', ...style }} />
);

export default function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [status, setStatus]       = useState('idle'); // idle | loading | success | error
  const [message, setMessage]     = useState('');
  const [showPw, setShowPw]       = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!password || !confirm) { setStatus('error'); setMessage('Please fill in both fields.'); return; }
    if (password.length < 6)   { setStatus('error'); setMessage('Password must be at least 6 characters.'); return; }
    if (password !== confirm)  { setStatus('error'); setMessage('Passwords do not match.'); return; }

    setStatus('loading');
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      setStatus('success');
      setMessage(data.message || 'Password reset! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const inputStyle = focused => ({
    width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 15,
    background: 'rgba(255,255,255,0.05)', border: `1px solid ${focused ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.1)'}`,
    color: '#f1f5f9', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  });

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
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #22D3A5, #16a085)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>V</span>
          </div>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Vikas Computer Zone</span>
        </Link>

        <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Set new password</h1>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 28px' }}>
          Choose a strong password for your account.
        </p>

        {status === 'success' ? (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 10, padding: '14px 16px', color: '#4ade80', fontSize: 14, textAlign: 'center',
          }}>
            ✓ {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  style={{ ...inputStyle(false), paddingRight: 44 }}
                  disabled={status === 'loading'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 13,
                  }}
                >{showPw ? 'Hide' : 'Show'}</button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>Confirm Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                style={inputStyle(false)}
                disabled={status === 'loading'}
              />
            </div>

            {status === 'error' && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 13,
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                padding: '13px', borderRadius: 10, border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
                fontWeight: 600, fontSize: 15, opacity: status === 'loading' ? 0.7 : 1, transition: 'opacity 0.2s',
              }}
            >
              {status === 'loading' ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 24 }}>
          Remember it?{' '}
          <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>Back to login</Link>
        </p>
      </div>
    </div>
  );
}
