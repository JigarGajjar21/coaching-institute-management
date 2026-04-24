import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ProfileMenu from '../components/ProfileMenu';

const NAV = [
  { path: '/admin/dashboard',   label: 'Dashboard',  icon: '📊' },
  { path: '/admin/users',       label: 'Users',       icon: '👥' },
  { path: '/admin/courses',     label: 'Courses',     icon: '📚' },
  { path: '/admin/batches',     label: 'Batches',     icon: '🗂'  },
  { path: '/admin/enrollments', label: 'Enrollments', icon: '📋' },
  { path: '/admin/schedule',    label: 'Schedule',    icon: '📅' },
  { path: '/admin/attendance',  label: 'Attendance',  icon: '✅' },
  { path: '/admin/marks',       label: 'Marks',       icon: '🏆' },
  { path: '/admin/materials',   label: 'Materials',   icon: '📁' },
];

export default function AdminLayout({ children }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const active = NAV.find(n => location.pathname.startsWith(n.path));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0B0F', fontFamily: 'Inter, sans-serif', color: '#fff' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: collapsed ? 64 : 220, flexShrink: 0,
        background: '#0F0F14', borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 0' : '20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#22D3A5,#16a085)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(34,211,165,0.3)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {!collapsed && <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>VCZone Admin</span>}
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 0' : '10px 12px',
                borderRadius: 10, marginBottom: 2,
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? 'rgba(34,211,165,0.1)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(34,211,165,0.2)' : 'transparent'}`,
                color: isActive ? '#22D3A5' : '#71717A',
                fontSize: '0.875rem', fontWeight: isActive ? 600 : 400,
                textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
              onMouseOver={e => { if (!isActive) { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#fff'; }}}
              onMouseOut={e => { if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#71717A'; }}}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        {/* No logout in sidebar — it's in the top header */}
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, marginLeft: collapsed ? 64 : 220, transition: 'margin-left 0.25s ease', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Top header */}
        <header style={{
          height: 60, background: '#0F0F14',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 40,
        }}>
          {/* Left: toggle + page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setCollapsed(v => !v)} style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#A1A1AA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#fff'; }}
            onMouseOut={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='#A1A1AA'; }}
            >☰</button>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{active?.label || 'Admin'}</div>
              <div style={{ fontSize: '0.72rem', color: '#52525B' }}>Vikas Computer Zone</div>
            </div>
          </div>

          {/* Right: profile menu */}
          <ProfileMenu user={user} onLogout={handleLogout} align="right" />
        </header>

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
