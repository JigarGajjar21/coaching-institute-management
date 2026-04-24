import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import { getAllSchedules } from '../../services/adminApi';

const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState('table'); // 'table' | 'week'

  useEffect(() => {
    getAllSchedules()
      .then(r => setSchedules(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'batchId', label: 'Batch',   render: v => <span style={{ color: '#fff', fontWeight: 500 }}>{v?.name || '—'}</span> },
    { key: 'day',     label: 'Day',     render: v => <span style={{ color: '#A78BFA', fontWeight: 600 }}>{v}</span> },
    { key: 'time',    label: 'Time',    render: v => <span style={{ color: '#22D3A5', fontWeight: 600 }}>{v}</span> },
    { key: 'subject', label: 'Subject', muted: true },
    { key: 'batchId', label: 'Faculty', render: v => v?.facultyId?.name || '—', muted: true },
  ];

  // Group by day for week view
  const byDay = DAY_ORDER.reduce((acc, d) => {
    acc[d] = schedules.filter(s => s.day === d).sort((a, b) => a.time.localeCompare(b.time));
    return acc;
  }, {});

  const dayColors = { Monday:'#22D3A5', Tuesday:'#A78BFA', Wednesday:'#60A5FA', Thursday:'#f59e0b', Friday:'#f87171', Saturday:'#34d399', Sunday:'#c084fc' };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Schedule</h1>
          <p style={{ color: '#52525B', fontSize: '0.875rem' }}>All class schedules across batches.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['table','week'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s', background: view === v ? '#22D3A5' : 'rgba(255,255,255,0.06)', color: view === v ? '#000' : '#71717A', textTransform: 'capitalize' }}>{v} view</button>
          ))}
        </div>
      </div>

      {view === 'table' ? (
        <DataTable columns={columns} data={schedules} loading={loading} searchKeys={['subject','day']} emptyMsg="No schedules found." />
      ) : (
        loading ? <div style={{ padding: 60, textAlign: 'center', color: '#52525B' }}>Loading…</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {DAY_ORDER.map(day => (
              <div key={day} style={{ background: '#141418', border: `1px solid ${dayColors[day]}20`, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', background: `${dayColors[day]}12`, borderBottom: `1px solid ${dayColors[day]}20` }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: dayColors[day] }}>{day}</span>
                  <span style={{ fontSize: '0.72rem', color: '#52525B', marginLeft: 8 }}>{byDay[day].length} class{byDay[day].length !== 1 ? 'es' : ''}</span>
                </div>
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {byDay[day].length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: '#3f3f46', textAlign: 'center', padding: '12px 0' }}>No classes</div>
                  ) : byDay[day].map(s => (
                    <div key={s._id} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff', marginBottom: 2 }}>{s.subject}</div>
                      <div style={{ fontSize: '0.72rem', color: '#52525B' }}>{s.batchId?.name}</div>
                      <div style={{ fontSize: '0.72rem', color: dayColors[day], marginTop: 2, fontWeight: 600 }}>{s.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </AdminLayout>
  );
}
