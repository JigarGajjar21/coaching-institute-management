import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getBatches, getBatchMaterials } from '../../services/adminApi';

export default function Materials() {
  const [batches, setBatches]   = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading]   = useState(false);
  const [batchLoading, setBatchLoading] = useState(true);

  useEffect(() => {
    getBatches()
      .then(r => { const b = r.data?.data || []; setBatches(b); if (b.length) { setSelected(b[0]._id); loadMaterials(b[0]._id); } })
      .catch(console.error)
      .finally(() => setBatchLoading(false));
  }, []);

  const loadMaterials = id => {
    setLoading(true);
    getBatchMaterials(id)
      .then(r => setMaterials(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleBatchChange = id => { setSelected(id); loadMaterials(id); };

  const fileIcon = url => {
    if (!url) return '📄';
    const ext = url.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return '📕';
    if (['doc','docx'].includes(ext)) return '📘';
    if (['xls','xlsx'].includes(ext)) return '📗';
    if (['ppt','pptx'].includes(ext)) return '📙';
    if (['jpg','jpeg','png','gif'].includes(ext)) return '🖼';
    return '📄';
  };

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Materials</h1>
        <p style={{ color: '#52525B', fontSize: '0.875rem' }}>Study materials uploaded by faculty for each batch.</p>
      </div>

      {/* Batch selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {batchLoading ? <div style={{ color: '#52525B', fontSize: '0.875rem' }}>Loading batches…</div> :
          batches.map(b => (
            <button key={b._id} onClick={() => handleBatchChange(b._id)} style={{
              padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s',
              background: selected === b._id ? '#22D3A5' : 'rgba(255,255,255,0.06)',
              color: selected === b._id ? '#000' : '#71717A',
            }}>{b.name}</button>
          ))
        }
      </div>

      {/* Materials grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#52525B' }}>Loading materials…</div>
      ) : materials.length === 0 ? (
        <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 60, textAlign: 'center', color: '#52525B' }}>
          No materials uploaded for this batch yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {materials.map(m => (
            <div key={m._id} style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20, transition: 'all 0.25s', position: 'relative', overflow: 'hidden' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(34,211,165,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'radial-gradient(circle at top right, rgba(34,211,165,0.08), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                  {fileIcon(m.fileUrl)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
                  {m.description && <div style={{ fontSize: '0.78rem', color: '#52525B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.description}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: '#52525B' }}>
                  {m.facultyId?.name || '—'} · {new Date(m.createdAt).toLocaleDateString()}
                </div>
                <a href={`${baseUrl}${m.fileUrl}`} target="_blank" rel="noreferrer" style={{ padding: '5px 14px', borderRadius: 8, background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.2)', color: '#22D3A5', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background='rgba(34,211,165,0.2)'}
                  onMouseOut={e => e.currentTarget.style.background='rgba(34,211,165,0.1)'}
                >Download</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
