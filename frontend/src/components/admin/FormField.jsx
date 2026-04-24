export default function FormField({ label, error, children, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#71717A', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {label}{required && <span style={{ color: '#f87171', marginLeft: 3 }}>*</span>}
        </label>
      )}
      {children}
      {error && <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: 5 }}>{error}</p>}
    </div>
  );
}

export const inputStyle = {
  width: '100%', padding: '10px 14px', boxSizing: 'border-box',
  background: '#0F0F14', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, color: '#fff', fontSize: '0.875rem',
  fontFamily: 'Inter, sans-serif', outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

export const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: 32,
};
