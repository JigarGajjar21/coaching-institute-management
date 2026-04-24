export default function StatCard({ icon, label, value, color = '#22D3A5', glow = 'rgba(34,211,165,0.15)', trend }) {
  return (
    <div style={{
      background: '#141418', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
      transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden',
    }}
    onMouseOver={e => { e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${glow}`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${glow}, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ width: 44, height: 44, borderRadius: 12, background: glow, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: '#71717A', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{value ?? '—'}</div>
        {trend && <div style={{ fontSize: '0.72rem', color: '#22D3A5', marginTop: 4 }}>{trend}</div>}
      </div>
    </div>
  );
}
