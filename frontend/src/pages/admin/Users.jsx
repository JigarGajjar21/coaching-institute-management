import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import FormField, { inputStyle, selectStyle } from '../../components/admin/FormField';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/adminApi';

const EMPTY = { name: '', email: '', password: '', role: 'student' };

export default function Users() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // null | 'create' | 'edit'
  const [form, setForm]       = useState(EMPTY);
  const [editId, setEditId]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('all');

  const load = () => {
    setLoading(true);
    getUsers().then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setError(''); setModal('create'); };
  const openEdit   = row => { setForm({ name: row.name, email: row.email, password: '', role: row.role }); setEditId(row._id); setError(''); setModal('edit'); };
  const closeModal = () => { setModal(null); setError(''); };

  const handleSave = async () => {
    if (!form.email || !form.role) { setError('Email and role are required.'); return; }
    if (modal === 'create' && !form.password) { setError('Password is required.'); return; }
    setSaving(true); setError('');
    try {
      if (modal === 'create') await createUser(form);
      else await updateUser(editId, form);
      load(); closeModal();
    } catch (e) {
      setError(e.response?.data?.message || 'Something went wrong.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try { await deleteUser(id); load(); } catch (e) { alert(e.response?.data?.message || 'Delete failed.'); }
  };

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  const roleBadge = role => {
    const map = { admin: ['#f59e0b','rgba(245,158,11,0.15)'], faculty: ['#A78BFA','rgba(167,139,250,0.15)'], student: ['#22D3A5','rgba(34,211,165,0.15)'] };
    const [c, bg] = map[role] || ['#71717A','rgba(255,255,255,0.08)'];
    return <span style={{ padding: '2px 10px', borderRadius: 99, background: bg, color: c, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{role}</span>;
  };

  const columns = [
    { key: 'name',  label: 'Name',  render: v => <span style={{ color: '#fff', fontWeight: 500 }}>{v || '—'}</span> },
    { key: 'email', label: 'Email', muted: true },
    { key: 'role',  label: 'Role',  render: v => roleBadge(v) },
    { key: 'createdAt', label: 'Joined', muted: true, render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: '_id', label: 'Actions', render: (_, row) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => openEdit(row)} style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#A78BFA', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background='rgba(167,139,250,0.2)'}
          onMouseOut={e => e.currentTarget.style.background='rgba(167,139,250,0.1)'}
        >Edit</button>
        <button onClick={() => handleDelete(row._id)} style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseOver={e => e.currentTarget.style.background='rgba(239,68,68,0.15)'}
          onMouseOut={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
        >Delete</button>
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Users</h1>
          <p style={{ color: '#52525B', fontSize: '0.875rem' }}>Manage students, faculty and admins.</p>
        </div>
        <button onClick={openCreate} style={{ padding: '9px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#22D3A5,#16a085)', color: '#000', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(34,211,165,0.3)', transition: 'all 0.2s' }}
          onMouseOver={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(34,211,165,0.4)'; }}
          onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 16px rgba(34,211,165,0.3)'; }}
        >+ Add User</button>
      </div>

      {/* Role filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all','student','faculty','admin'].map(r => (
          <button key={r} onClick={() => setFilter(r)} style={{
            padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s', textTransform: 'capitalize',
            background: filter === r ? '#22D3A5' : 'rgba(255,255,255,0.06)',
            color: filter === r ? '#000' : '#71717A',
          }}>{r === 'all' ? `All (${users.length})` : `${r} (${users.filter(u=>u.role===r).length})`}</button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} searchKeys={['name','email','role']} emptyMsg="No users found." />

      <Modal open={!!modal} onClose={closeModal} title={modal === 'create' ? 'Add New User' : 'Edit User'}>
        {error && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '0.83rem' }}>⚠ {error}</div>}
        <FormField label="Full Name"><input style={inputStyle} placeholder="Rahul Sharma" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} onFocus={e=>e.target.style.borderColor='#22D3A5'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} /></FormField>
        <FormField label="Email" required><input style={inputStyle} type="email" placeholder="user@example.com" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} onFocus={e=>e.target.style.borderColor='#22D3A5'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} /></FormField>
        <FormField label={modal === 'create' ? 'Password' : 'New Password (leave blank to keep)'} required={modal==='create'}>
          <input style={inputStyle} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} onFocus={e=>e.target.style.borderColor='#22D3A5'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
        </FormField>
        <FormField label="Role" required>
          <select style={selectStyle} value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={closeModal} style={{ padding: '9px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA', fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#22D3A5,#16a085)', color: '#000', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : modal === 'create' ? 'Create User' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
