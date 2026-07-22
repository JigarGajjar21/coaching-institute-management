import { useEffect, useState } from 'react';
import FacultyLayout from '../../layouts/FacultyLayout';
import { getFacultyBatches, getTestsByBatch, createTest, getTestMarks, recordMarks } from '../../services/facultyApi';

const ACCENT = '#A78BFA';

export default function FacultyMarks() {
  const [tab,       setTab]       = useState('record');  // record | view
  const [batches,   setBatches]   = useState([]);
  const [selBatch,  setSelBatch]  = useState('');
  const [tests,     setTests]     = useState([]);
  const [selTest,   setSelTest]   = useState('');
  const [testMarks, setTestMarks] = useState(null);
  const [scores,    setScores]    = useState({});
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState('');

  // New test form
  const [newTest, setNewTest] = useState({ subject:'', date:'', maxMarks:'' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getFacultyBatches().then(r => setBatches(r.data?.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selBatch) { setTests([]); setSelTest(''); setTestMarks(null); return; }
    getTestsByBatch(selBatch).then(r => setTests(r.data || [])).catch(console.error);
    setSelTest(''); setTestMarks(null);
  }, [selBatch]);

  useEffect(() => {
    if (!selTest) { setTestMarks(null); return; }
    getTestMarks(selTest).then(r => {
      setTestMarks(r.data);
      const init = {};
      r.data.marks?.forEach(m => { init[m.studentId._id] = m.marksObtained; });
      setScores(init);
    }).catch(console.error);
  }, [selTest]);

  const handleCreateTest = async () => {
    if (!selBatch || !newTest.subject || !newTest.date || !newTest.maxMarks) {
      setToast('Fill all test fields.'); return;
    }
    setCreating(true);
    try {
      await createTest({ batchId: selBatch, ...newTest, maxMarks: Number(newTest.maxMarks) });
      setToast('Test created!');
      setNewTest({ subject:'', date:'', maxMarks:'' });
      getTestsByBatch(selBatch).then(r => setTests(r.data || [])).catch(console.error);
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to create test.');
    } finally {
      setCreating(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleSaveMarks = async () => {
    if (!selTest || !testMarks) return;
    const batch = batches.find(b => b._id === selBatch);
    const students = batch?.students?.map(s => s.userId).filter(Boolean) || [];
    if (students.length === 0) { setToast('No students in this batch.'); return; }
    setSaving(true);
    try {
      await recordMarks({
        testId: selTest,
        marksRecords: students.map(s => ({ studentId: s._id, marksObtained: Number(scores[s._id] || 0) })),
      });
      setToast('Marks saved successfully!');
      getTestMarks(selTest).then(r => setTestMarks(r.data)).catch(console.error);
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to save marks.');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const inputStyle = { padding:'8px 12px', background:'#0F0F14', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#fff', fontSize:'0.85rem', outline:'none', fontFamily:'Inter, sans-serif', width:'100%' };

  const batch = batches.find(b => b._id === selBatch);
  const students = batch?.students?.map(s => s.userId).filter(Boolean) || [];

  return (
    <FacultyLayout>
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999, padding:'12px 20px', borderRadius:10, background: toast.includes('success') || toast.includes('created') ? 'rgba(34,211,165,0.15)' : 'rgba(239,68,68,0.15)', border:`1px solid ${toast.includes('success') || toast.includes('created') ? 'rgba(34,211,165,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.includes('success') || toast.includes('created') ? '#22D3A5' : '#f87171', fontSize:'0.875rem', fontWeight:600, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', marginBottom:4 }}>Marks</h1>
        <p style={{ color:'#52525B', fontSize:'0.875rem' }}>Create tests and record student marks.</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'#0F0F14', borderRadius:10, padding:4, width:'fit-content', border:'1px solid rgba(255,255,255,0.06)' }}>
        {[['record','✏️ Record Marks'],['view','📊 View Results']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding:'8px 18px', borderRadius:8, border:'none', cursor:'pointer',
            background: tab === v ? 'rgba(167,139,250,0.15)' : 'transparent',
            color: tab === v ? ACCENT : '#71717A',
            fontSize:'0.85rem', fontWeight:600, transition:'all 0.2s', fontFamily:'Inter, sans-serif',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:20, alignItems:'start' }}>
        {/* Left panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Batch + Test selectors */}
          <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:12 }}>
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
              <label style={{ display:'block', fontSize:'0.75rem', color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Test</label>
              <select value={selTest} onChange={e => setSelTest(e.target.value)} style={{ ...inputStyle, cursor:'pointer' }} disabled={!selBatch}
                onFocus={e => e.target.style.borderColor=ACCENT} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
              >
                <option value="">Select test…</option>
                {tests.map(t => <option key={t._id} value={t._id}>{t.subject} — {t.date} (/{t.maxMarks})</option>)}
              </select>
            </div>
          </div>

          {/* Create new test */}
          <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20 }}>
            <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#fff', marginBottom:14 }}>+ Create New Test</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <input placeholder="Subject" value={newTest.subject} onChange={e => setNewTest(p => ({ ...p, subject: e.target.value }))} style={inputStyle}
                onFocus={e => e.target.style.borderColor=ACCENT} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
              />
              <input type="date" value={newTest.date} onChange={e => setNewTest(p => ({ ...p, date: e.target.value }))} style={inputStyle}
                onFocus={e => e.target.style.borderColor=ACCENT} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
              />
              <input type="number" placeholder="Max Marks" value={newTest.maxMarks} onChange={e => setNewTest(p => ({ ...p, maxMarks: e.target.value }))} style={inputStyle}
                onFocus={e => e.target.style.borderColor=ACCENT} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
              />
              <button onClick={handleCreateTest} disabled={creating || !selBatch} style={{
                padding:'9px', borderRadius:8, border:'none', cursor: creating || !selBatch ? 'not-allowed' : 'pointer',
                background:`linear-gradient(135deg, ${ACCENT}, #7C3AED)`, color:'#fff',
                fontWeight:600, fontSize:'0.85rem', opacity: creating || !selBatch ? 0.5 : 1, fontFamily:'Inter, sans-serif',
              }}>{creating ? 'Creating…' : 'Create Test'}</button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ background:'#141418', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
          {!selTest ? (
            <div style={{ padding:60, textAlign:'center', color:'#52525B' }}>Select a batch and test to {tab === 'record' ? 'enter marks' : 'view results'}.</div>
          ) : tab === 'record' ? (
            <>
              <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'0.9rem', fontWeight:600, color:'#fff' }}>
                  {testMarks?.testInfo?.subject} — Max: {testMarks?.testInfo?.maxMarks}
                </span>
                <button onClick={handleSaveMarks} disabled={saving} style={{
                  padding:'7px 18px', borderRadius:8, border:'none', cursor: saving ? 'not-allowed' : 'pointer',
                  background:`linear-gradient(135deg, ${ACCENT}, #7C3AED)`, color:'#fff',
                  fontWeight:600, fontSize:'0.82rem', opacity: saving ? 0.6 : 1, fontFamily:'Inter, sans-serif',
                }}>{saving ? 'Saving…' : 'Save Marks'}</button>
              </div>
              {students.length === 0 ? (
                <div style={{ padding:40, textAlign:'center', color:'#52525B' }}>No students in this batch.</div>
              ) : students.map(s => {
                const max = testMarks?.testInfo?.maxMarks || 100;
                const val = scores[s._id] ?? '';
                const pct = val !== '' ? Math.round((Number(val) / max) * 100) : null;
                const color = pct === null ? '#52525B' : pct >= 75 ? '#22D3A5' : pct >= 50 ? '#f59e0b' : '#f87171';
                return (
                  <div key={s._id} style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#A78BFA,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, color:'#fff', flexShrink:0 }}>
                        {(s.name || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#fff' }}>{s.name}</div>
                        <div style={{ fontSize:'0.72rem', color:'#52525B' }}>{s.email}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      {pct !== null && <span style={{ fontSize:'0.78rem', fontWeight:700, color, minWidth:36, textAlign:'right' }}>{pct}%</span>}
                      <input
                        type="number" min={0} max={max}
                        value={val}
                        onChange={e => setScores(p => ({ ...p, [s._id]: e.target.value }))}
                        placeholder={`0–${max}`}
                        style={{ ...inputStyle, width:90, textAlign:'center', borderColor: pct !== null ? `${color}40` : 'rgba(255,255,255,0.1)' }}
                        onFocus={e => e.target.style.borderColor=ACCENT}
                        onBlur={e => e.target.style.borderColor= pct !== null ? `${color}40` : 'rgba(255,255,255,0.1)'}
                      />
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            /* View results */
            <>
              {testMarks && (
                <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:20, flexWrap:'wrap' }}>
                  {[
                    { l:'Subject', v: testMarks.testInfo?.subject },
                    { l:'Date',    v: testMarks.testInfo?.date },
                    { l:'Max',     v: testMarks.testInfo?.maxMarks },
                    { l:'Batch',   v: testMarks.testInfo?.batchName },
                  ].map(i => (
                    <div key={i.l}>
                      <div style={{ fontSize:'0.65rem', color:'#52525B', textTransform:'uppercase', letterSpacing:'0.06em' }}>{i.l}</div>
                      <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#fff' }}>{i.v}</div>
                    </div>
                  ))}
                </div>
              )}
              {!testMarks?.marks?.length ? (
                <div style={{ padding:40, textAlign:'center', color:'#52525B' }}>No marks recorded yet.</div>
              ) : testMarks.marks.map(m => {
                const pct = testMarks.testInfo?.maxMarks ? Math.round((m.marksObtained / testMarks.testInfo.maxMarks) * 100) : 0;
                const color = pct >= 75 ? '#22D3A5' : pct >= 50 ? '#f59e0b' : '#f87171';
                return (
                  <div key={m._id} style={{ padding:'12px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#A78BFA,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, color:'#fff' }}>
                        {(m.studentId?.name || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize:'0.875rem', fontWeight:600, color:'#fff' }}>{m.studentId?.name}</div>
                        <div style={{ fontSize:'0.72rem', color:'#52525B' }}>{m.studentId?.email}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'0.95rem', fontWeight:800, color }}>{m.marksObtained}/{testMarks.testInfo?.maxMarks}</div>
                      <div style={{ fontSize:'0.72rem', color }}>{pct}%</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </FacultyLayout>
  );
}
