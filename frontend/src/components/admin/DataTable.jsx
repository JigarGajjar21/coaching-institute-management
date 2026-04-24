import { useState } from 'react';

export default function DataTable({ columns, data, loading, emptyMsg = 'No records found', searchable = true, searchKeys = [] }) {
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const perPage = 10;

  const filtered = search && searchKeys.length
    ? data.filter(row => searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(search.toLowerCase())))
    : data;

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const inp = {
    padding: '8px 14px', background: '#0F0F14',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
    color: '#fff', fontSize: '0.85rem', outline: 'none',
    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
      {searchable && (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#52525B', fontSize: '0.9rem' }}>🔍</span>
          <input
            style={{ ...inp, flex: 1, background: 'transparent', border: 'none', padding: '4px 0' }}
            placeholder="Search..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} style={{ background: 'none', border: 'none', color: '#52525B', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
          )}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {columns.map(col => (
                <th key={col.key} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: '#52525B' }}>
                <div style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid rgba(34,211,165,0.3)', borderTopColor: '#22D3A5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
              </td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: '#52525B', fontSize: '0.875rem' }}>{emptyMsg}</td></tr>
            ) : paged.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                {columns.map(col => (
                  <td key={col.key} style={{ padding: '12px 20px', color: col.muted ? '#71717A' : '#e4e4e7', whiteSpace: col.wrap ? 'normal' : 'nowrap' }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', color: '#52525B' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                background: p === page ? '#22D3A5' : 'rgba(255,255,255,0.06)',
                color: p === page ? '#000' : '#71717A',
                transition: 'all 0.2s',
              }}>{p}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
