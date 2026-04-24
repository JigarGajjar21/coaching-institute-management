import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import { getStats, getBatches, getEnrollments } from '../../services/adminApi';

export default function Dashboard() {
  const [stats, setStats]           = useState(null);
  const [recentBatches, setRecent]  = useState([]);
  const [enrollCount, setEnroll]    = useState(0);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getBatches(), getEnrollments()])
      .then(([s, b, e]) => {
        setStats(s.data);
        setRecent((b.data?.data || []).slice(0, 5));
        setEnroll((e.data?.data || []).length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon: '👥', label: 'Total Students',  value: stats?.students, color: '#22D3A5', glow: 'rgba(34,211,165,0.15)' },
    { icon: '🎓', label: 'Faculty Members', value: stats?.faculty,  color: '#A78BFA', glow: 'rgba(167,139,250,0.15)' },
    { icon: '🗂',  label: 'Active Batches',  value: stats?.batches,  color: '#60A5FA', glow: 'rgba(96,165,250,0.15)' },
    { icon: '📋', label: 'Enrollments',     value: enrollCount,     color: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: '#52525B', fontSize: '0.875rem' }}>Welcome back — here's what's happening at VCZone.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <StatCard key={c.label} {...c} value={loading ? '...' : c.value} />
        ))}
      </div>

      {/* Recent batches */}
      <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>Recent Batches</h2>
          <a href="/admin/batches" style={{ fontSize: '0.78rem', color: '#22D3A5', textDecoration: 'none' }}>View all →</a>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#52525B' }}>Loading…</div>
        ) : recentBatches.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#52525B' }}>No batches yet</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Batch Name', 'Course', 'Faculty', 'Students'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBatches.map(b => (
                <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 20px', color: '#fff', fontWeight: 500 }}>{b.name}</td>
                  <td style={{ padding: '12px 20px', color: '#71717A' }}>{b.courseId?.name || '—'}</td>
                  <td style={{ padding: '12px 20px', color: '#71717A' }}>{b.facultyId?.name || '—'}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ padding: '2px 10px', borderRadius: 99, background: 'rgba(34,211,165,0.1)', color: '#22D3A5', fontSize: '0.78rem', fontWeight: 600 }}>
                      {b.students?.length ?? 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
