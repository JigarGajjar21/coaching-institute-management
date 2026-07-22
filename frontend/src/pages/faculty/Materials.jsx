import { useEffect, useRef, useState } from 'react';
import FacultyLayout from '../../layouts/FacultyLayout';
import { getFacultyBatches, getBatchMaterials, uploadMaterial, deleteMaterial } from '../../services/facultyApi';

const ACCENT = '#A78BFA';

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

export default function FacultyMaterials() {
  const [batches,    setBatches]    = useState([]);
  const [selBatch,   setSelBatch]   = useState('');
  const [materials,  setMaterials]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [toast,      setToast]      = useState('');
  const [search,     setSearch]     = useState('');
  const [form,       setForm]       = useState({ title:'', description:'' });
  const [file,       setFile]       = useState(null);
  const [dragOver,   setDragOver]   = useState(false);
  const fileRef = useRef();

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    getFacultyBatches().then(r => setBatches(r.data?.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selBatch) { setMaterials([]); return; }
    setLoading(true);
    getBatchMaterials(selBatch).then(r => setMaterials(r.data || [])).catch(console.error).finally(() => setLoading(false));
  }, [selBatch]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleUpload = async e => {
    e.preventDefault();
    if (!selBatch || !form.title || !file) { showToast('Please select batch, enter title, and choose a file.'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('batchId', selBatch);
      fd.append('file', file);
      await uploadMaterial(fd);
      showToast('Material uploaded successfully!');
      setForm({ title:'', description:'' });
      setFile(null);
      getBatchMaterials(selBatch).then(r => setMaterials(r.data || [])).catch(console.error);
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed.');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await deleteMaterial(id);
      setMaterials(prev => prev.filter(m => m._id !== id));
      showToast('Deleted.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.');
    }
  };

  const filtered = search
    ? materials.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase()))
    : materials;

  const inputStyle = { padding:'8px 12px', background:'#0F0F14', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#fff', fontSize:'0.85rem', outline:'none', fontFamily:'Inter, sans-serif', width:'100%' };

  return (
    <FacultyLayout>
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999, padding:'12px 20px', borderRadius:10, background: toast.includes('success') || toast.includes('Deleted') ? 'rgba(34,211,165,0.15)' : 'rgba(239,68,68,0.15)', border:`1px solid ${toast.includes('success') || toast.includes('Deleted') ? 'rgba(34,211,165,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.includes('success') || toast.includes('Deleted') ? '#22D3A5' : '#f87171', fontSize:'0.875rem', fontWeight:600, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:4 }}>Materials</h1>
        <p style={{ color:'#52525B', fontSize:'0.875rem' }}>Upload and manage study materials for your batches.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:20, alignItems:'start' }}>
        {/* Upload form */}
        <form onSubmit={handleUpload} style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ fontSize:'0.9rem', fontWeight:700, color:'#fff', marginBottom:2 }}>Upload Material</div>

          <div>
            <label style={{ display:'block', fontSize:'0.75rem', color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Batch</label>
            <select value={selBatch} onChange={e => setSelBatch(e.target.value)} style={{ ...inputStyle, cursor:'pointer' }}
              onFocus={e => e.target.style.borderColor=ACCENT} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
            >
              <option value="">Select batch…</option>
              {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display:'block', fontSize:'0.75rem', color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Title</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Chapter 3 Notes" style={inputStyle}
              onFocus={e => e.target.style.borderColor=ACCENT} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label style={{ display:'block', fontSize:'0.75rem', color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description…" rows={2}
              style={{ ...inputStyle, resize:'vertical', lineHeight:1.5 }}
              onFocus={e => e.target.style.borderColor=ACCENT} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
            style={{
              border:`2px dashed ${dragOver ? ACCENT : file ? 'rgba(34,211,165,0.4)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius:10, padding:'20px 16px', textAlign:'center', cursor:'pointer',
              background: dragOver ? 'rgba(167,139,250,0.06)' : file ? 'rgba(34,211,165,0.04)' : 'transparent',
              transition:'all 0.2s',
            }}
          >
            <input ref={fileRef} type="file" style={{ display:'none' }} onChange={e => setFile(e.target.files[0])} />
            {file ? (
              <div>
                <div style={{ fontSize:'1.5rem', marginBottom:4 }}>{fileIcon(file.name)}</div>
                <div style={{ fontSize:'0.82rem', color:'#22D3A5', fontWeight:600 }}>{file.name}</div>
                <div style={{ fontSize:'0.72rem', color:'#52525B', marginTop:2 }}>{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize:'1.5rem', marginBottom:6 }}>📎</div>
                <div style={{ fontSize:'0.82rem', color:'#52525B' }}>Drop file here or <span style={{ color:ACCENT }}>browse</span></div>
              </div>
            )}
          </div>

          <button type="submit" disabled={uploading} style={{
            padding:'11px', borderRadius:10, border:'none', cursor: uploading ? 'not-allowed' : 'pointer',
            background:`linear-gradient(135deg, ${ACCENT}, #7C3AED)`, color:'#fff',
            fontWeight:700, fontSize:'0.9rem', opacity: uploading ? 0.6 : 1, transition:'all 0.2s', fontFamily:'Inter, sans-serif',
            boxShadow:`0 4px 20px rgba(167,139,250,0.3)`,
          }}>{uploading ? 'Uploading…' : 'Upload Material'}</button>
        </form>

        {/* Materials list */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:10 }}>
            <span style={{ fontSize:'0.9rem', fontWeight:600, color:'#fff' }}>
              {selBatch ? `${filtered.length} material${filtered.length !== 1 ? 's' : ''}` : 'Select a batch to view materials'}
            </span>
            {selBatch && (
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#52525B', fontSize:'0.85rem', pointerEvents:'none' }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                  style={{ ...inputStyle, paddingLeft:32, width:200 }}
                  onFocus={e => e.target.style.borderColor=ACCENT} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
                />
              </div>
            )}
          </div>

          {!selBatch ? (
            <div style={{ padding:60, textAlign:'center', background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, color:'#52525B' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📁</div>
              Select a batch to view its materials.
            </div>
          ) : loading ? (
            <div style={{ padding:60, textAlign:'center', background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, color:'#52525B' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:60, textAlign:'center', background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16 }}>
              <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📁</div>
              <div style={{ color:'#52525B' }}>{search ? 'No materials match your search.' : 'No materials uploaded yet.'}</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14 }}>
              {filtered.map(m => (
                <div key={m._id} style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:18, transition:'all 0.25s', position:'relative', overflow:'hidden' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='rgba(167,139,250,0.25)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.3)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
                >
                  <div style={{ position:'absolute', top:0, right:0, width:70, height:70, background:'radial-gradient(circle at top right, rgba(167,139,250,0.08), transparent 70%)', pointerEvents:'none' }} />
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:'rgba(167,139,250,0.12)', border:'1px solid rgba(167,139,250,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
                      {fileIcon(m.fileUrl)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#fff', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</div>
                      {m.description && <div style={{ fontSize:'0.75rem', color:'#52525B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.description}</div>}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize:'0.7rem', color:'#52525B' }}>{new Date(m.createdAt).toLocaleDateString()}</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <a href={`${baseUrl}${m.fileUrl}`} target="_blank" rel="noreferrer"
                        style={{ padding:'4px 12px', borderRadius:7, background:'rgba(34,211,165,0.1)', border:'1px solid rgba(34,211,165,0.2)', color:'#22D3A5', fontSize:'0.75rem', fontWeight:600, textDecoration:'none', transition:'all 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background='rgba(34,211,165,0.2)'}
                        onMouseOut={e => e.currentTarget.style.background='rgba(34,211,165,0.1)'}
                      >↓ View</a>
                      <button onClick={() => handleDelete(m._id)} style={{ padding:'4px 10px', borderRadius:7, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s', fontFamily:'Inter, sans-serif' }}
                        onMouseOver={e => e.currentTarget.style.background='rgba(239,68,68,0.18)'}
                        onMouseOut={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                      >🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FacultyLayout>
  );
}
