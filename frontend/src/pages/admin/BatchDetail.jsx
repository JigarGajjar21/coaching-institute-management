import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Modal from '../../components/admin/Modal';
import FormField, { selectStyle, inputStyle } from '../../components/admin/FormField';
import StudentPicker from '../../components/admin/StudentPicker';
import { getBatchById, getBatchSchedule, addSchedule, updateSchedule, deleteSchedule, assignStudent, unassignStudent, getUsers, getBatchMaterials, getTestsByBatch } from '../../services/adminApi';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const EMPTY_SCH = { day: 'Monday', time: '', subject: '' };

export default function BatchDetail() {
  const { id } = useParams();
  const [batch, setBatch]         = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tests, setTests]         = useState([]);
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('students');
  const [schModal, setSchModal]   = useState(null);
  const [schForm, setSchForm]     = useState(EMPTY_SCH);
  const [schEditId, setSchEditId] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [assignModal, setAssignModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      getBatchById(id),
      getBatchSchedule(id),
      getBatchMaterials(id),
      getTestsByBatch(id),
      getUsers(),
    ]).then(([b, s, m, t, u]) => {
      setBatch(b.data);
      setSchedules(s.data || []);
      setMaterials(m.data || []);
      setTests(t.data || []);
      const batchStudentIds = new Set((b.data?.students || []).map(s => s.userId?._id));
      setStudents(b.data?.students || []);
      setAllStudents((u.data || []).filter(u => u.role === 'student' && !batchStudentIds.has(u._id)));
    }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const openAddSch  = () => { setSchForm(EMPTY_SCH); setSchEditId(null); setError(''); setSchModal('add'); };
  const openEditSch = s => { setSchForm({ day: s.day, time: s.time, subject: s.subject }); setSchEditId(s._id); setError(''); setSchModal('edit'); };

  const saveSch = async () => {
    if (!schForm.time || !schForm.subject) { setError('Time and subject are required.'); return; }
    setSaving(true); setError('');
    try {
      if (schModal === 'add') await addSchedule({ ...schForm, batchId: id });
      else await updateSchedule(schEditId, schForm);
      const s = await getBatchSchedule(id);
      setSchedules(s.data || []);
      setSchModal(null);
    } catch (e) { setError(e.response?.data?.message || 'Failed to save schedule.'); }
    finally { setSaving(false); }
  };

  const deleteSch = async sid => {
    if (!window.confirm('Delete this schedule entry?')) return;
    await deleteSchedule(sid);
    const s = await getBatchSchedule(id);
    setSchedules(s.data || []);
  };

  const handleAssign = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try { await assignStudent({ studentId: selectedStudent, batchId: id }); load(); setAssignModal(false); setSelectedStudent(''); }
    catch (e) { alert(e.response?.data?.message || 'Failed to assign.'); }
    finally { setSaving(false); }
  };

  const handleUnassign = async studentId => {
    if (!window.confirm('Remove this student from the batch?')) return;
    try { await unassignStudent({ studentId, batchId: id }); load(); }
    catch (e) { alert(e.response?.data?.message || 'Failed to remove.'); }
  };

  const card = (label, value, color = '#22D3A5') => (
    <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' }}>
      <div style={{ fontSize: '0.72rem', color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color }}>{value || '—'}</div>
    </div>
  );

  const tabBtn = (key, label) => (
    <button key={key} onClick={() => setTab(key)} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', background: tab === key ? '#22D3A5' : 'rgba(255,255,255,0.06)', color: tab === key ? '#000' : '#71717A' }}>{label}</button>
  );

  if (loading) return <AdminLayout><div style={{ padding: 60, textAlign: 'center', color: '#52525B' }}>Loading batch…</div></AdminLayout>;
  if (!batch)  return <AdminLayout><div style={{ padding: 60, textAlign: 'center', color: '#f87171' }}>Batch not found.</div></AdminLayout>;

  return (
    <AdminLayout>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.82rem', color: '#52525B' }}>
        <Link to="/admin/batches" style={{ color: '#22D3A5', textDecoration: 'none' }}>Batches</Link>
        <span>›</span>
        <span style={{ color: '#A1A1AA' }}>{batch.name}</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>{batch.name}</h1>
        <p style={{ color: '#52525B', fontSize: '0.875rem' }}>Batch details, students, schedule and materials.</p>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        {card('Course',   batch.courseId?.name,   '#22D3A5')}
        {card('Faculty',  batch.facultyId?.name,  '#A78BFA')}
        {card('Students', batch.students?.length, '#60A5FA')}
        {card('Tests',    tests.length,           '#f59e0b')}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabBtn('students', `Students (${students.length})`)}
        {tabBtn('schedule', `Schedule (${schedules.length})`)}
        {tabBtn('materials', `Materials (${materials.length})`)}
        {tabBtn('tests', `Tests (${tests.length})`)}
      </div>

      {/* Students tab */}
      {tab === 'students' && (
        <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Enrolled Students</span>
            <button onClick={() => setAssignModal(true)} style={{ padding: '6px 16px', borderRadius: 8, background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.2)', color: '#22D3A5', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>+ Assign Student</button>
          </div>
          {students.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#52525B' }}>No students assigned yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Name','Email','Action'].map(h => <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseOut={e=>e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding: '12px 20px', color: '#fff', fontWeight: 500 }}>{s.userId?.name || '—'}</td>
                    <td style={{ padding: '12px 20px', color: '#71717A' }}>{s.userId?.email || '—'}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <button onClick={() => handleUnassign(s.userId?._id)} style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer' }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Schedule tab */}
      {tab === 'schedule' && (
        <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Class Schedule</span>
            <button onClick={openAddSch} style={{ padding: '6px 16px', borderRadius: 8, background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.2)', color: '#22D3A5', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>+ Add Slot</button>
          </div>
          {schedules.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#52525B' }}>No schedule entries yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Day','Time','Subject','Actions'].map(h => <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {schedules.map(s => (
                  <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseOut={e=>e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding: '12px 20px', color: '#fff', fontWeight: 500 }}>{s.day}</td>
                    <td style={{ padding: '12px 20px', color: '#22D3A5', fontWeight: 600 }}>{s.time}</td>
                    <td style={{ padding: '12px 20px', color: '#A1A1AA' }}>{s.subject}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEditSch(s)} style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#A78BFA', fontSize: '0.78rem', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => deleteSch(s._id)} style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Materials tab */}
      {tab === 'materials' && (
        <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Study Materials</span>
          </div>
          {materials.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#52525B' }}>No materials uploaded yet.</div>
          ) : (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {materials.map(m => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginBottom: 2 }}>{m.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#52525B' }}>By {m.facultyId?.name || '—'} · {new Date(m.createdAt).toLocaleDateString()}</div>
                  </div>
                  <a href={`${import.meta.env.VITE_API_URL?.replace('/api','')}${m.fileUrl}`} target="_blank" rel="noreferrer" style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.2)', color: '#22D3A5', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>Download</a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tests tab */}
      {tab === 'tests' && (
        <div style={{ background: '#141418', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Tests</span>
          </div>
          {tests.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#52525B' }}>No tests created yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Subject','Date','Max Marks'].map(h => <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {tests.map(t => (
                  <tr key={t._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 20px', color: '#fff', fontWeight: 500 }}>{t.subject}</td>
                    <td style={{ padding: '12px 20px', color: '#71717A' }}>{new Date(t.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 20px' }}><span style={{ color: '#f59e0b', fontWeight: 600 }}>{t.maxMarks}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Schedule modal */}
      <Modal open={!!schModal} onClose={() => setSchModal(null)} title={schModal === 'add' ? 'Add Schedule Slot' : 'Edit Schedule Slot'}>
        {error && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '0.83rem' }}>⚠ {error}</div>}
        <FormField label="Day" required>
          <select style={selectStyle} value={schForm.day} onChange={e=>setSchForm(f=>({...f,day:e.target.value}))}>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </FormField>
        <FormField label="Time" required>
          <input style={inputStyle} type="time" value={schForm.time} onChange={e=>setSchForm(f=>({...f,time:e.target.value}))} onFocus={e=>e.target.style.borderColor='#22D3A5'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
        </FormField>
        <FormField label="Subject" required>
          <input style={inputStyle} placeholder="e.g. MS Excel" value={schForm.subject} onChange={e=>setSchForm(f=>({...f,subject:e.target.value}))} onFocus={e=>e.target.style.borderColor='#22D3A5'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
        </FormField>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => setSchModal(null)} style={{ padding: '9px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA', fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={saveSch} disabled={saving} style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#22D3A5,#16a085)', color: '#000', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: saving?'not-allowed':'pointer', opacity: saving?0.7:1 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </Modal>

      {/* Assign student modal */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Student to Batch">
        <FormField label="Select Student" required>
          <StudentPicker
            students={allStudents}
            value={selectedStudent}
            onChange={setSelectedStudent}
          />
        </FormField>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => setAssignModal(false)} style={{ padding: '9px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA', fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleAssign} disabled={saving || !selectedStudent} style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#22D3A5,#16a085)', color: '#000', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: (saving||!selectedStudent)?'not-allowed':'pointer', opacity: (saving||!selectedStudent)?0.6:1 }}>
            {saving ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
