import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import FormField, { selectStyle } from '../../components/admin/FormField';
import StudentPicker from '../../components/admin/StudentPicker';
import { getEnrollments, manualEnroll, getUsers, getCourses, getBatches } from '../../services/adminApi';

const EMPTY = { userId: '', courseId: '', batchId: '' };

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(false);
  const [form, setForm]               = useState(EMPTY);
  const [students, setStudents]       = useState([]);
  const [courses, setCourses]         = useState([]);
  const [batches, setBatches]         = useState([]);
  const [filteredBatches, setFiltered] = useState([]);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getEnrollments(), getUsers(), getCourses(), getBatches()])
      .then(([e, u, c, b]) => {
        setEnrollments(e.data?.data || []);
        setStudents((u.data || []).filter(u => u.role === 'student'));
        setCourses(c.data?.data || []);
        setBatches(b.data?.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCourseChange = courseId => {
    setForm(f => ({ ...f, courseId, batchId: '' }));
    setFiltered(batches.filter(b => b.courseId?._id === courseId || b.courseId === courseId));
  };

  const handleSave = async () => {
    if (!form.userId || !form.courseId || !form.batchId) { setError('All fields are required.'); return; }
    setSaving(true); setError('');
    try { await manualEnroll(form); load(); setModal(false); setForm(EMPTY); }
    catch (e) { setError(e.response?.data?.message || 'Enrollment failed.'); }
    finally { setSaving(false); }
  };

  const statusBadge = s => {
    const active = s === 'active';
    return <span style={{ padding: '2px 10px', borderRadius: 99, background: active ? 'rgba(34,211,165,0.1)' : 'rgba(239,68,68,0.1)', color: active ? '#22D3A5' : '#f87171', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{s}</span>;
  };

  const methodBadge = m => {
    const map = { online: ['#60A5FA','rgba(96,165,250,0.1)'], offline: ['#f59e0b','rgba(245,158,11,0.1)'], free: ['#A78BFA','rgba(167,139,250,0.1)'] };
    const [c, bg] = map[m] || ['#71717A','rgba(255,255,255,0.08)'];
    return <span style={{ padding: '2px 10px', borderRadius: 99, background: bg, color: c, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{m}</span>;
  };

  const columns = [
    { key: 'userId',    label: 'Student',  render: v => <span style={{ color: '#fff', fontWeight: 500 }}>{v?.name || '—'}</span> },
    { key: 'courseId',  label: 'Course',   render: v => v?.name || '—', muted: true },
    { key: 'batchId',   label: 'Batch',    render: v => v?.name || '—', muted: true },
    { key: 'status',         label: 'Status',  render: v => statusBadge(v) },
    { key: 'paymentMethod',  label: 'Method',  render: v => methodBadge(v) },
    { key: 'createdAt', label: 'Date',     muted: true, render: v => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Enrollments</h1>
          <p style={{ color: '#52525B', fontSize: '0.875rem' }}>{enrollments.length} total enrollment{enrollments.length !== 1 ? 's' : ''}.</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setError(''); setModal(true); }} style={{ padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#22D3A5,#16a085)', color: '#000', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(34,211,165,0.3)', transition: 'all 0.2s' }}
          onMouseOver={e=>{e.currentTarget.style.transform='translateY(-1px)';}} onMouseOut={e=>{e.currentTarget.style.transform='';}}
        >+ Manual Enroll</button>
      </div>

      <DataTable columns={columns} data={enrollments} loading={loading} searchKeys={[]} emptyMsg="No enrollments yet." searchable={false} />

      <Modal open={modal} onClose={() => setModal(false)} title="Manual Enrollment (Offline)">
        {error && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '0.83rem' }}>⚠ {error}</div>}
        <FormField label="Student" required>
          <StudentPicker
            students={students}
            value={form.userId}
            onChange={id => setForm(f => ({ ...f, userId: id }))}
          />
        </FormField>
        <FormField label="Course" required>
          <select style={selectStyle} value={form.courseId} onChange={e=>handleCourseChange(e.target.value)}>
            <option value="">Select course…</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField label="Batch" required>
          <select style={selectStyle} value={form.batchId} onChange={e=>setForm(f=>({...f,batchId:e.target.value}))} disabled={!form.courseId}>
            <option value="">Select batch…</option>
            {filteredBatches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </FormField>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => setModal(false)} style={{ padding: '9px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA', fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#22D3A5,#16a085)', color: '#000', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: saving?'not-allowed':'pointer', opacity: saving?0.7:1 }}>
            {saving ? 'Enrolling…' : 'Enroll Student'}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
