import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user     = JSON.parse(localStorage.getItem('user') || '{}');
  const loggedIn = !!localStorage.getItem('token') && !!user.name;

  const isLogin    = location.pathname === '/login';
  const isRegister = location.pathname === '/register';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 5%',
      background: scrolled ? 'rgba(3,3,5,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
      fontFamily: 'Inter, sans-serif',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'linear-gradient(135deg, #22D3A5, #16a085)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 18px rgba(34,211,165,0.35)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', letterSpacing: '-0.02em' }}>VCZone</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {loggedIn ? (
          <ProfileMenu user={user} onLogout={handleLogout} />
        ) : (
          <>
            {!isLogin && (
              <Link to="/login" style={{
                padding: '7px 18px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#A1A1AA', fontSize: '0.85rem', fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.color='#fff'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#A1A1AA'; }}
              >Login</Link>
            )}
            {!isRegister && (
              <Link to="/register" style={{
                padding: '7px 18px', borderRadius: 8,
                background: 'linear-gradient(135deg, #22D3A5, #16a085)',
                color: '#000', fontSize: '0.85rem', fontWeight: 700,
                textDecoration: 'none', transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(34,211,165,0.3)',
              }}
              onMouseOver={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(34,211,165,0.4)'; }}
              onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 16px rgba(34,211,165,0.3)'; }}
              >Register</Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
