import { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import { getMyMaterials } from '../../services/studentApi';

export default function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    getMyMaterials().then(r => setMaterials(r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? materials.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase()))
    : materials;

  const fileIcon = url => {
    if (!url) return '📄';
    const ext = url.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📕';
    if (['doc','docx'].includes(ext)) return '📘';
    if (['xls','xlsx'].includes(ext)) return '📗';
    if (['ppt','pptx'].includes(ext)) return '📙';
    if (['jpg','jpeg','png','gif'].includes(ext)) return '🖼';
    return '📄';
  };

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <StudentLayout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:4 }}>Study Materials</h1>
          <p style={{ color:'#52525B', fontSize:'0.875rem' }}>{materials.length} file{materials.length !== 1 ? 's' : ''} available from your batches.</p>
        </div>
        <div style={{ position:'relative' }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#52525B', fontSize:'0.9rem', pointerEvents:'none' }}>🔍</span>
          <input
            style={{ padding:'8px 14px 8px 36px', background:'#0F0F14', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#fff', fontSize:'0.85rem', outline:'none', fontFamily:'Inter, sans-serif', width:220 }}
            placeholder="Search materials…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => e.target.style.borderColor='#22D3A5'}
            onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
          />
        </div>
      </div>

      {loading ? <div style={{ padding:60, textAlign:'center', color:'#52525B' }}>Loading materials…</div>
      : filtered.length === 0 ? (
        <div style={{ padding:60, textAlign:'center', background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📁</div>
          <div style={{ color:'#52525B' }}>{search ? 'No materials match your search.' : 'No materials uploaded yet.'}</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
          {filtered.map(m => (
            <div key={m._id} style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, transition:'all 0.25s', position:'relative', overflow:'hidden' }}
              onMouseOver={e => { e.currentTarget.style.borderColor='rgba(34,211,165,0.2)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.3)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
            >
              <div style={{ position:'absolute', top:0, right:0, width:80, height:80, background:'radial-gradient(circle at top right, rgba(34,211,165,0.08), transparent 70%)', pointerEvents:'none' }} />
              <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>
                  {fileIcon(m.fileUrl)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.9rem', fontWeight:600, color:'#fff', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</div>
                  {m.description && <div style={{ fontSize:'0.78rem', color:'#52525B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.description}</div>}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize:'0.72rem', color:'#52525B' }}>
                  {m.facultyId?.name || '—'} · {new Date(m.createdAt).toLocaleDateString()}
                </div>
                <a href={`${baseUrl}${m.fileUrl}`} target="_blank" rel="noreferrer"
                  style={{ padding:'5px 14px', borderRadius:8, background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.2)', color:'#22D3A5', fontSize:'0.78rem', fontWeight:600, textDecoration:'none', transition:'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background='rgba(34,211,165,0.2)'}
                  onMouseOut={e => e.currentTarget.style.background='rgba(34,211,165,0.1)'}
                >Download ↓</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
