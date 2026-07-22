import { useEffect, useState } from 'react';
import FacultyLayout from '../../layouts/FacultyLayout';
import { getFacultyBatches, getBatchSchedule, getBatchAttendance, markAttendance } from '../../services/facultyApi';

const ACCENT = '#A78BFA';

export default function FacultyAttendance() {
  const [tab,        setTab]        = useState('mark');   // mark | history
  const [batches,    setBatches]    = useState([]);
  const [selBatch,   setSelBatch]   = useState('');
  const [schedules,  setSchedules]  = useState([]);
  const [selSched,   setSelSched]   = useState('');
  const [date,       setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [students,   setStudents]   = useState([]);
  const [statuses,   setStatuses]   = useState({});
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState('');

  useEffect(() => {
    getFacultyBatches().then(r => setBatches(r.data?.data || [])).catch(console.error);
    getBatchAttendance().then(r => setHistory(r.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selBatch) { setSchedules([]); setSelSched(''); return; }
    getBatchSchedule(selBatch).then(r => {
      setSchedules(r.data || []);
      setSelSched('');
    }).catch(console.error);
    // load students from selected batch
    const batch = batches.find(b => b._id === selBatch);
    const studs = batch?.students?.map(s => s.userId).filter(Boolean) || [];
    setStudents(studs);
    const init = {};
    studs.forEach(s => { init[s._id] = 'Present'; });
    setStatuses(init);
  }, [selBatch, batches]);

  const handleSubmit = async () => {
    if (!selSched || !date || students.length === 0) {
      setToast('Please select batch, schedule, date and ensure students exist.'); return;
    }
    setSaving(true);
    try {
      await markAttendance({
        scheduleId: selSched,
        date,
        attendanceRecords: students.map(s => ({ studentId: s._id, status: statuses[s._id] || 'Present' })),
      });
      setToast('Attendance marked successfully!');
      getBatchAttendance().then(r => setHistory(r.data || [])).catch(console.error);
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to mark attendance.');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(''), 3500);
    }
  };

  const inputStyle = { padding:'8px 12px', background:'#0F0F14', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#fff', fontSize:'0.85rem', outline:'none', fontFamily:'Inter, sans-serif', width:'100%' };

  return (
    <FacultyLayout>
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999, padding:'12px 20px', borderRadius:10, background: toast.includes('success') ? 'rgba(34,211,165,0.15)' : 'rgba(239,68,68,0.15)', border:`1px solid ${toast.includes('success') ? 'rgba(34,211,165,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.includes('success') ? '#22D3A5' : '#f87171', fontSize:'0.875rem', fontWeight:600, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:4 }}>Attendance</h1>
        <p style={{ color:'#52525B', fontSize:'0.875rem' }}>Mark and review attendance for your batches.</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'#0F0F14', borderRadius:10, padding:4, width:'fit-content', border:'1px solid rgba(255,255,255,0.06)' }}>
        {[['mark','✅ Mark Attendance'],['history','📋 History']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding:'8px 18px', borderRadius:8, border:'none', cursor:'pointer',
            background: tab === v ? 'rgba(167,139,250,0.15)' : 'transparent',
            color: tab === v ? ACCENT : '#71717A',
            fontSize:'0.85rem', fontWeight:600, transition:'all 0.2s', fontFamily:'Inter, sans-serif',
          }}>{l}</button>
        ))}
      </div>

      {tab === 'mark' ? (
        <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:20, alignItems:'start' }}>
          {/* Controls */}
          <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:14 }}>
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
              <label style={{ display:'block', fontSize:'0.75rem', color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Schedule</label>
              <select value={selSched} onChange={e => setSelSched(e.target.value)} style={{ ...inputStyle, cursor:'pointer' }} disabled={!selBatch}
                onFocus={e => e.target.style.borderColor=ACCENT} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
              >
                <option value="">Select schedule…</option>
                {schedules.map(s => <option key={s._id} value={s._id}>{s.day} — {s.subject} ({s.time})</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.75rem', color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor=ACCENT} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
              />
            </div>
            {students.length > 0 && (
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => { const all = {}; students.forEach(s => { all[s._id] = 'Present'; }); setStatuses(all); }} style={{ flex:1, padding:'7px', borderRadius:8, border:'1px solid rgba(34,211,165,0.3)', background:'rgba(34,211,165,0.08)', color:'#22D3A5', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>All Present</button>
                <button onClick={() => { const all = {}; students.forEach(s => { all[s._id] = 'Absent'; }); setStatuses(all); }} style={{ flex:1, padding:'7px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#f87171', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', fontFamily:'Inter, sans-serif' }}>All Absent</button>
              </div>
            )}
            <button onClick={handleSubmit} disabled={saving || !selSched || students.length === 0} style={{
              padding:'11px', borderRadius:10, border:'none', cursor: saving ? 'not-allowed' : 'pointer',
              background:`linear-gradient(135deg, ${ACCENT}, #7C3AED)`, color:'#fff',
              fontWeight:700, fontSize:'0.9rem', opacity: saving ? 0.6 : 1, transition:'all 0.2s', fontFamily:'Inter, sans-serif',
              boxShadow:`0 4px 20px rgba(167,139,250,0.3)`,
            }}>{saving ? 'Saving…' : 'Submit Attendance'}</button>
          </div>

          {/* Student list */}
          <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
            {!selBatch ? (
              <div style={{ padding:60, textAlign:'center', color:'#52525B' }}>Select a batch to see students.</div>
            ) : students.length === 0 ? (
              <div style={{ padding:60, textAlign:'center', color:'#52525B' }}>No students in this batch yet.</div>
            ) : (
              <>
                <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'0.9rem', fontWeight:600, color:'#fff' }}>{students.length} Students</span>
                  <span style={{ fontSize:'0.75rem', color:'#52525B' }}>
                    {Object.values(statuses).filter(v => v === 'Present').length} present · {Object.values(statuses).filter(v => v === 'Absent').length} absent
                  </span>
                </div>
                {students.map((s, i) => (
                  <div key={s._id} style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#A78BFA,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, color:'#fff', flexShrink:0 }}>
                        {(s.name || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#fff' }}>{s.name}</div>
                        <div style={{ fontSize:'0.72rem', color:'#52525B' }}>{s.email}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      {['Present','Absent'].map(st => (
                        <button key={st} onClick={() => setStatuses(prev => ({ ...prev, [s._id]: st }))} style={{
                          padding:'5px 14px', borderRadius:8, border:'1px solid', cursor:'pointer', fontSize:'0.78rem', fontWeight:600, transition:'all 0.2s', fontFamily:'Inter, sans-serif',
                          borderColor: statuses[s._id] === st ? (st === 'Present' ? 'rgba(34,211,165,0.5)' : 'rgba(239,68,68,0.5)') : 'rgba(255,255,255,0.08)',
                          background: statuses[s._id] === st ? (st === 'Present' ? 'rgba(34,211,165,0.12)' : 'rgba(239,68,68,0.12)') : 'transparent',
                          color: statuses[s._id] === st ? (st === 'Present' ? '#22D3A5' : '#f87171') : '#52525B',
                        }}>{st}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      ) : (
        /* History */
        <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
          {history.length === 0 ? (
            <div style={{ padding:60, textAlign:'center', color:'#52525B' }}>No attendance records yet.</div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
              <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                {['Date','Student','Subject','Batch','Status'].map(h => (
                  <th key={h} style={{ padding:'12px 20px', textAlign:'left', fontSize:'0.7rem', fontWeight:700, color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {history.map(r => (
                  <tr key={r._id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                    onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseOut={e => e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'12px 20px', color:'#fff', fontWeight:500 }}>{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                    <td style={{ padding:'12px 20px', color:'#A1A1AA' }}>{r.studentId?.name || '—'}</td>
                    <td style={{ padding:'12px 20px', color:'#A1A1AA' }}>{r.scheduleId?.subject || '—'}</td>
                    <td style={{ padding:'12px 20px', color:'#71717A' }}>{r.scheduleId?.batchId?.name || '—'}</td>
                    <td style={{ padding:'12px 20px' }}>
                      <span style={{ padding:'2px 10px', borderRadius:99, background: r.status === 'Present' ? 'rgba(34,211,165,0.1)' : 'rgba(239,68,68,0.1)', color: r.status === 'Present' ? '#22D3A5' : '#f87171', fontSize:'0.75rem', fontWeight:600 }}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </FacultyLayout>
  );
}
