import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import FormField, { inputStyle } from '../../components/admin/FormField';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../services/adminApi';

const EMPTY = { name: '', price: '', duration: '' };

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = () => {
    setLoading(true);
    getCourses().then(r => setCourses(r.data?.data || [])).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(''); setModal('create'); };
  const openEdit   = row  => { setForm({ name: row.name, price: row.price, duration: row.duration }); setEditId(row._id); setError(''); setModal('edit'); };
  const closeModal = ()   => { setModal(null); setError(''); };

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || form.price === '' || !form.duration) {
      setError('Name, fee and duration are required.'); return;
    }
    setSaving(true); setError('');
    try {
      const payload = { name: form.name, price: Number(form.price), duration: form.duration };
      if (modal === 'create') await createCourse(payload);
      else await updateCourse(editId, payload);
      load(); closeModal();
    } catch (e) { setError(e.response?.data?.message || 'Something went wrong.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this course?')) return;
    try { await deleteCourse(id); load(); } catch (e) { alert(e.response?.data?.message || 'Delete failed.'); }
  };

  const focusGreen = e => e.target.style.borderColor = '#22D3A5';
  const blurGray   = e => e.target.style.borderColor = 'rgba(255,255,255,0.1)';

  const columns = [
    { key: 'name',     label: 'Course Name', render: v => <span style={{ color: '#fff', fontWeight: 500 }}>{v}</span> },
    { key: 'duration', label: 'Duration',    muted: true },
    { key: 'price',    label: 'Fee',         render: v => <span style={{ color: '#22D3A5', fontWeight: 600 }}>₹{v?.toLocaleString()}</span> },
    { key: '_id', label: 'Actions', render: (_, row) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => openEdit(row)} style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#A78BFA', fontSize: '0.78rem', cursor: 'pointer' }}
          onMouseOver={e => e.currentTarget.style.background='rgba(167,139,250,0.2)'}
          onMouseOut={e  => e.currentTarget.style.background='rgba(167,139,250,0.1)'}
        >Edit</button>
        <button onClick={() => handleDelete(row._id)} style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer' }}
          onMouseOver={e => e.currentTarget.style.background='rgba(239,68,68,0.15)'}
          onMouseOut={e  => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
        >Delete</button>
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Courses</h1>
          <p style={{ color: '#52525B', fontSize: '0.875rem' }}>{courses.length} course{courses.length !== 1 ? 's' : ''} available.</p>
        </div>
        <button onClick={openCreate} style={{ padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#22D3A5,#16a085)', color: '#000', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(34,211,165,0.3)', transition: 'all 0.2s' }}
          onMouseOver={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(34,211,165,0.4)'; }}
          onMouseOut={e  => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 16px rgba(34,211,165,0.3)'; }}
        >+ Add Course</button>
      </div>

      <DataTable columns={columns} data={courses} loading={loading} searchKeys={['name','duration']} emptyMsg="No courses yet." />

      <Modal open={!!modal} onClose={closeModal} title={modal === 'create' ? 'Add New Course' : 'Edit Course'} width={480}>
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '0.83rem' }}>
            ⚠ {error}
          </div>
        )}

        <FormField label="Course Name" required>
          <input
            style={inputStyle} placeholder="e.g. CCC (Government)"
            value={form.name} onChange={set('name')}
            onFocus={focusGreen} onBlur={blurGray}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Fee (₹)" required>
            <input
              style={inputStyle} type="number" placeholder="2500"
              value={form.price} onChange={set('price')}
              onFocus={focusGreen} onBlur={blurGray}
            />
          </FormField>
          <FormField label="Duration" required>
            <input
              style={inputStyle} placeholder="e.g. 3 Months"
              value={form.duration} onChange={set('duration')}
              onFocus={focusGreen} onBlur={blurGray}
            />
          </FormField>
        </div>

        <div style={{ padding: '10px 14px', borderRadius: 8, marginTop: 4, marginBottom: 8, background: 'rgba(34,211,165,0.06)', border: '1px solid rgba(34,211,165,0.15)', fontSize: '0.78rem', color: '#52525B' }}>
          💡 Course description, curriculum and outcomes are managed by the developer in the frontend codebase.
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={closeModal} style={{ padding: '9px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA', fontSize: '0.875rem', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#22D3A5,#16a085)', color: '#000', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : modal === 'create' ? 'Create Course' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
