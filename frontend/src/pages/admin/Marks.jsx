import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import { getAllMarks, getBatches } from '../../services/adminApi';

export default function Marks() {
  const [marks, setMarks]     = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ batchId: '' });

  const load = (f = filters) => {
    setLoading(true);
    const params = {};
    if (f.batchId) params.batchId = f.batchId;
    getAllMarks(params)
      .then(r => setMarks(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getBatches().then(r => setBatches(r.data?.data || [])).catch(console.error);
    load();
  }, []);

  const handleFilter = newF => { setFilters(newF); load(newF); };

  const scoreBadge = (obtained, max) => {
    const pct = max ? Math.round((obtained / max) * 100) : 0;
    const color = pct >= 75 ? '#22D3A5' : pct >= 50 ? '#f59e0b' : '#f87171';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color, fontWeight: 700 }}>{obtained}/{max}</span>
        <span style={{ fontSize: '0.72rem', padding: '1px 8px', borderRadius: 99, background: `${color}15`, color, fontWeight: 600 }}>{pct}%</span>
      </div>
    );
  };

  const columns = [
    { key: 'studentId', label: 'Student',  render: v => <span style={{ color: '#fff', fontWeight: 500 }}>{v?.name || '—'}</span> },
    { key: 'testId',    label: 'Subject',  render: v => v?.subject || '—', muted: true },
    { key: 'testId',    label: 'Batch',    render: v => v?.batchId?.name || '—', muted: true },
    { key: 'testId',    label: 'Date',     render: v => v?.date ? new Date(v.date).toLocaleDateString() : '—', muted: true },
    { key: 'marksObtained', label: 'Score', render: (v, row) => scoreBadge(v, row.testId?.maxMarks) },
  ];

  const inp = { padding: '8px 14px', background: '#0F0F14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Inter, sans-serif' };

  // Top performers
  const sorted = [...marks].sort((a, b) => {
    const pA = a.testId?.maxMarks ? a.marksObtained / a.testId.maxMarks : 0;
    const pB = b.testId?.maxMarks ? b.marksObtained / b.testId.maxMarks : 0;
    return pB - pA;
  }).slice(0, 3);

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Marks</h1>
        <p style={{ color: '#52525B', fontSize: '0.875rem' }}>View test results across all batches.</p>
      </div>

      {/* Top performers */}
      {sorted.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Top Performers</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {sorted.map((m, i) => {
              const pct = m.testId?.maxMarks ? Math.round((m.marksObtained / m.testId.maxMarks) * 100) : 0;
              const medals = ['🥇','🥈','🥉'];
              return (
                <div key={m._id} style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 200 }}>
                  <span style={{ fontSize: '1.4rem' }}>{medals[i]}</span>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>{m.studentId?.name || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#52525B' }}>{m.testId?.subject} · {pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <select style={{ ...inp, minWidth: 180 }} value={filters.batchId} onChange={e => handleFilter({ batchId: e.target.value })}>
          <option value="">All Batches</option>
          {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        {filters.batchId && (
          <button onClick={() => handleFilter({ batchId: '' })} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#71717A', fontSize: '0.82rem', cursor: 'pointer' }}>Clear</button>
        )}
      </div>

      <DataTable columns={columns} data={marks} loading={loading} searchable={false} emptyMsg="No marks recorded yet." />
    </AdminLayout>
  );
}
