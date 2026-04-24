import { useState } from 'react';

/**
 * StudentPicker — searchable checkbox list for selecting one student.
 * Props:
 *   students   — array of { _id, name }
 *   value      — selected student _id (string)
 *   onChange   — (id) => void
 */
export default function StudentPicker({ students = [], value, onChange }) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))
    : students;

  return (
    <div>
      {/* Search box */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#52525B', fontSize: '0.85rem', pointerEvents: 'none' }}>🔍</span>
        <input
          type="text"
          placeholder="Search students…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px 8px 32px', boxSizing: 'border-box',
            background: '#0F0F14', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, color: '#fff', fontSize: '0.85rem',
            fontFamily: 'Inter, sans-serif', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = '#22D3A5'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </div>

      {/* Scrollable list */}
      <div style={{
        maxHeight: 220, overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10, background: '#0F0F14',
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#52525B', fontSize: '0.85rem' }}>
            {search ? 'No students match your search.' : 'No students available.'}
          </div>
        ) : filtered.map((s, i) => {
          const selected = value === s._id;
          return (
            <label
              key={s._id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                cursor: 'pointer',
                background: selected ? 'rgba(34,211,165,0.06)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseOver={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseOut={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Custom checkbox */}
              <div
                onClick={() => onChange(selected ? '' : s._id)}
                style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${selected ? '#22D3A5' : 'rgba(255,255,255,0.2)'}`,
                  background: selected ? '#22D3A5' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >
                {selected && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: '0.875rem', color: selected ? '#fff' : '#A1A1AA', fontWeight: selected ? 600 : 400 }}>
                {s.name || '—'}
              </span>
            </label>
          );
        })}
      </div>

      {value && (
        <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#22D3A5' }}>
          ✓ {students.find(s => s._id === value)?.name} selected
        </div>
      )}
    </div>
  );
}
