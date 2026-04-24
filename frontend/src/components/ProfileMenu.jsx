import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function useLogout() {
  const navigate = useNavigate();
  return () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
}

export default function ProfileMenu({ user, onLogout, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger pill */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 10px 5px 5px', borderRadius: 99,
          background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)'}`,
          cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        onMouseOut={e => { if (!open) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #22D3A5, #16a085)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: 700, color: '#000', flexShrink: 0,
        }}>
          {(user?.name || 'U')[0].toUpperCase()}
        </div>
        <span style={{ fontSize: '0.82rem', color: '#A1A1AA', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.name}
        </span>
        <span style={{
          color: '#52525B', fontSize: '0.65rem', display: 'inline-block',
          transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)',
        }}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          [align]: 0,
          minWidth: 200,
          background: '#141418',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
          zIndex: 9999,
          animation: 'pmDropIn 0.15s ease',
        }}>
          {/* User info */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginBottom: 2 }}>{user?.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#52525B', marginBottom: 6 }}>{user?.email}</div>
            {user?.role && (
              <span style={{
                display: 'inline-flex', padding: '2px 8px', borderRadius: 99,
                background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.2)',
                fontSize: '0.68rem', fontWeight: 600, color: '#22D3A5', textTransform: 'capitalize',
              }}>{user.role}</span>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            style={{
              width: '100%', padding: '11px 16px',
              background: 'none', border: 'none',
              display: 'flex', alignItems: 'center', gap: 10,
              color: '#f87171', fontSize: '0.85rem',
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'Inter, sans-serif', transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      )}

      <style>{`
        @keyframes pmDropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
