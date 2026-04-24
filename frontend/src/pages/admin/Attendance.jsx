import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import { getAllAttendance, getBatches } from '../../services/adminApi';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ batchId: '', subject: '' });

  const load = (f = filters) => {
    setLoading(true);
    const params = {};
    if (f.batchId) params.batchId = f.batchId;
    if (f.subject) params.subject = f.subject;
    getAllAttendance(params)
      .then(r => setRecords(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getBatches().then(r => setBatches(r.data?.data || [])).catch(console.error);
    load();
  }, []);

  const handleFilter = newF => { setFilters(newF); load(newF); };

  const statusBadge = s => (
    <span style={{ padding: '2px 10px', borderRadius: 99, background: s === 'Present' ? 'rgba(34,211,165,0.1)' : 'rgba(239,68,68,0.1)', color: s === 'Present' ? '#22D3A5' : '#f87171', fontSize: '0.75rem', fontWeight: 600 }}>{s}</span>
  );

  // Summary stats
  const total   = records.length;
  const present = records.filter(r => r.status === 'Present').length;
  const absent  = total - present;
  const pct     = total ? Math.round((present / total) * 100) : 0;

  const columns = [
    { key: 'studentId', label: 'Student',  render: v => <span style={{ color: '#fff', fontWeight: 500 }}>{v?.name || '—'}</span> },
    { key: 'scheduleId', label: 'Batch',   render: v => v?.batchId?.name || '—', muted: true },
    { key: 'scheduleId', label: 'Subject', render: v => v?.subject || '—', muted: true },
    { key: 'scheduleId', label: 'Day',     render: v => v?.day || '—', muted: true },
    { key: 'date',       label: 'Date',    muted: true, render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'status',     label: 'Status',  render: v => statusBadge(v) },
  ];

  const inp = { padding: '8px 14px', background: '#0F0F14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'Inter, sans-serif' };

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Attendance</h1>
        <p style={{ color: '#52525B', fontSize: '0.875rem' }}>View and filter attendance records across all batches.</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Records', value: total,   color: '#fff' },
          { label: 'Present',       value: present, color: '#22D3A5' },
          { label: 'Absent',        value: absent,  color: '#f87171' },
          { label: 'Attendance %',  value: `${pct}%`, color: pct >= 75 ? '#22D3A5' : '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: '0.7rem', color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <select style={{ ...inp, minWidth: 180 }} value={filters.batchId} onChange={e => handleFilter({ ...filters, batchId: e.target.value })}>
          <option value="">All Batches</option>
          {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <input style={{ ...inp, minWidth: 180 }} placeholder="Filter by subject…" value={filters.subject} onChange={e => handleFilter({ ...filters, subject: e.target.value })} />
        {(filters.batchId || filters.subject) && (
          <button onClick={() => handleFilter({ batchId: '', subject: '' })} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#71717A', fontSize: '0.82rem', cursor: 'pointer' }}>Clear</button>
        )}
      </div>

      <DataTable columns={columns} data={records} loading={loading} searchable={false} emptyMsg="No attendance records found." />
    </AdminLayout>
  );
}
