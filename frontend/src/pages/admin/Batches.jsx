import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import FormField, { inputStyle, selectStyle } from '../../components/admin/FormField';
import { getBatches, createBatch, updateBatch, deleteBatch, getCourses, getUsers } from '../../services/adminApi';

const EMPTY = { name: '', facultyId: '', courseId: '' };

export default function Batches() {
  const [batches, setBatches]   = useState([]);
  const [courses, setCourses]   = useState([]);
  const [faculty, setFaculty]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getBatches(), getCourses(), getUsers()])
      .then(([b, c, u]) => {
        setBatches(b.data?.data || []);
        setCourses(c.data?.data || []);
        setFaculty((u.data || []).filter(u => u.role === 'faculty'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(''); setModal('create'); };
  const openEdit   = row => { setForm({ name: row.name, facultyId: row.facultyId?._id || '', courseId: row.courseId?._id || '' }); setEditId(row._id); setError(''); setModal('edit'); };
  const closeModal = () => { setModal(null); setError(''); };

  const handleSave = async () => {
    if (!form.name || !form.facultyId || !form.courseId) { setError('All fields are required.'); return; }
    setSaving(true); setError('');
    try {
      if (modal === 'create') await createBatch(form);
      else await updateBatch(editId, form);
      load(); closeModal();
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this batch? This will also remove all schedules and student assignments.')) return;
    try { await deleteBatch(id); load(); } catch (e) { alert(e.response?.data?.message || 'Delete failed.'); }
  };

  const columns = [
    { key: 'name',      label: 'Batch Name', render: (v, row) => <Link to={`/admin/batches/${row._id}`} style={{ color: '#22D3A5', fontWeight: 600, textDecoration: 'none' }}>{v}</Link> },
    { key: 'courseId',  label: 'Course',     render: v => v?.name || '—', muted: true },
    { key: 'facultyId', label: 'Faculty',    render: v => v?.name || '—', muted: true },
    { key: 'students',  label: 'Students',   render: v => <span style={{ padding: '2px 10px', borderRadius: 99, background: 'rgba(34,211,165,0.1)', color: '#22D3A5', fontSize: '0.78rem', fontWeight: 600 }}>{v?.length ?? 0}</span> },
    { key: '_id', label: 'Actions', render: (_, row) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <Link to={`/admin/batches/${row._id}`} style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60A5FA', fontSize: '0.78rem', textDecoration: 'none' }}>View</Link>
        <button onClick={() => openEdit(row)} style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#A78BFA', fontSize: '0.78rem', cursor: 'pointer' }}
          onMouseOver={e=>e.currentTarget.style.background='rgba(167,139,250,0.2)'} onMouseOut={e=>e.currentTarget.style.background='rgba(167,139,250,0.1)'}
        >Edit</button>
        <button onClick={() => handleDelete(row._id)} style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer' }}
          onMouseOver={e=>e.currentTarget.style.background='rgba(239,68,68,0.15)'} onMouseOut={e=>e.currentTarget.style.background='rgba(239,68,68,0.08)'}
        >Delete</button>
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Batches</h1>
          <p style={{ color: '#52525B', fontSize: '0.875rem' }}>{batches.length} batch{batches.length !== 1 ? 'es' : ''} total.</p>
        </div>
        <button onClick={openCreate} style={{ padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#22D3A5,#16a085)', color: '#000', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(34,211,165,0.3)', transition: 'all 0.2s' }}
          onMouseOver={e=>{e.currentTarget.style.transform='translateY(-1px)';}} onMouseOut={e=>{e.currentTarget.style.transform='';}}
        >+ Create Batch</button>
      </div>

      <DataTable columns={columns} data={batches} loading={loading} searchKeys={['name']} emptyMsg="No batches yet." />

      <Modal open={!!modal} onClose={closeModal} title={modal === 'create' ? 'Create Batch' : 'Edit Batch'}>
        {error && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '0.83rem' }}>⚠ {error}</div>}
        <FormField label="Batch Name" required>
          <input style={inputStyle} placeholder="e.g. CCC Batch A" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} onFocus={e=>e.target.style.borderColor='#22D3A5'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
        </FormField>
        <FormField label="Course" required>
          <select style={selectStyle} value={form.courseId} onChange={e=>setForm(f=>({...f,courseId:e.target.value}))}>
            <option value="">Select course…</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField label="Faculty" required>
          <select style={selectStyle} value={form.facultyId} onChange={e=>setForm(f=>({...f,facultyId:e.target.value}))}>
            <option value="">Select faculty…</option>
            {faculty.map(f => <option key={f._id} value={f._id}>{f.name} ({f.email})</option>)}
          </select>
        </FormField>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={closeModal} style={{ padding: '9px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA', fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#22D3A5,#16a085)', color: '#000', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: saving?'not-allowed':'pointer', opacity: saving?0.7:1 }}>
            {saving ? 'Saving…' : modal === 'create' ? 'Create Batch' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
