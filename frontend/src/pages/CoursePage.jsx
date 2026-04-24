import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProfileMenu from '../components/ProfileMenu';

/* ─────────────────────────────────────────────
   Static course catalogue (slug → detail data)
   backendName must exactly match the course name
   created by admin in /admin/courses
───────────────────────────────────────────── */
const COURSES = {
  ccc: {
    backendName: 'CCC (Government)',
    name: 'CCC (Course on Computer Concepts)',
    subtitle: 'Government-certified computer literacy program',
    icon: '🖥️',
    duration: '3 Months',
    price: 2500,
    priceDisplay: '₹2,500',
    accent: '#22D3A5',
    glow: 'rgba(34,211,165,0.15)',
    badge: 'Government Certified',
    badgeColor: '#22D3A5',
    faculty: 'Prajapati Vikas',
    about: 'CCC (Course on Computer Concepts) is a government-certified program by NIELIT that equips students with essential computer skills for government jobs and everyday digital tasks. Ideal for beginners and job seekers.',
    highlights: ['NIELIT Government Certificate', 'Accepted for Govt. Job Applications', 'Beginner Friendly', 'Online Exam Preparation'],
    curriculum: [
      { module: 'Module 1 — Computer Fundamentals', topics: ['Introduction to computers & hardware', 'Operating system basics (Windows)', 'File management & storage', 'Keyboard shortcuts & productivity tips'] },
      { module: 'Module 2 — MS Office Suite', topics: ['MS Word — documents, formatting, tables', 'MS Excel — formulas, charts, data entry', 'MS PowerPoint — presentations & animations', 'MS Access — basic database concepts'] },
      { module: 'Module 3 — Internet & Communication', topics: ['Internet browsing & search engines', 'Email creation & management (Gmail)', 'Online forms & government portals', 'Cyber safety & digital etiquette'] },
      { module: 'Module 4 — Exam Preparation', topics: ['CCC online exam pattern & syllabus', 'Practice tests & mock exams', 'Previous year question papers', 'Tips for scoring O/A/B grade'] },
    ],
    outcomes: ['Qualify for government job computer requirements', 'Handle day-to-day office tasks confidently', 'Use internet & email professionally', 'Earn a nationally recognized certificate'],
  },
  'tally-prime': {
    backendName: 'Tally Prime with GST',
    name: 'Tally Prime with GST',
    subtitle: 'Industry-standard accounting & GST software',
    icon: '📊',
    duration: '2 Months',
    price: 3000,
    priceDisplay: '₹3,000',
    accent: '#A78BFA',
    glow: 'rgba(167,139,250,0.15)',
    badge: 'Job Ready',
    badgeColor: '#A78BFA',
    faculty: 'Prajapati Vikas',
    about: 'Tally Prime is the most widely used accounting software in India. This course covers everything from basic bookkeeping to advanced GST filing — making you job-ready for accounting roles in any business.',
    highlights: ['Tally Prime Latest Version', 'GST Filing & Returns', 'Used by 7M+ Businesses', 'Placement Assistance'],
    curriculum: [
      { module: 'Module 1 — Tally Basics', topics: ['Company creation & configuration', 'Ledger & group management', 'Voucher entry (payment, receipt, journal)', 'Day book & trial balance'] },
      { module: 'Module 2 — Inventory Management', topics: ['Stock groups & items', 'Purchase & sales orders', 'Godown management', 'Stock summary & valuation'] },
      { module: 'Module 3 — GST in Tally', topics: ['GST setup & tax ledgers', 'GSTR-1, GSTR-3B filing', 'Input tax credit (ITC)', 'E-way bill generation'] },
      { module: 'Module 4 — Advanced Features', topics: ['Payroll & salary processing', 'Bank reconciliation', 'Cost centres & profit centres', 'MIS reports & balance sheet'] },
    ],
    outcomes: ['Work as an accountant in any company', 'File GST returns independently', 'Manage complete business accounts', 'Get hired in finance & accounts roles'],
  },
  'graphic-design': {
    backendName: 'Graphic Design',
    name: 'Graphic Design',
    subtitle: 'Creative design with industry-standard tools',
    icon: '🎨',
    duration: '3 Months',
    price: 4500,
    priceDisplay: '₹4,500',
    accent: '#60A5FA',
    glow: 'rgba(96,165,250,0.15)',
    badge: 'Creative Career',
    badgeColor: '#60A5FA',
    faculty: 'Prajapati Vikas',
    about: 'Learn professional graphic design using Adobe Photoshop, Illustrator, and CorelDRAW. Build a portfolio of real-world projects — logos, posters, social media creatives, and more.',
    highlights: ['Adobe Photoshop & Illustrator', 'CorelDRAW Included', 'Portfolio Projects', 'Freelance Ready'],
    curriculum: [
      { module: 'Module 1 — Design Fundamentals', topics: ['Principles of design (balance, contrast, hierarchy)', 'Color theory & typography', 'Resolution, DPI & file formats', 'Design thinking & ideation'] },
      { module: 'Module 2 — Adobe Photoshop', topics: ['Layers, masks & selections', 'Photo editing & retouching', 'Poster & banner design', 'Social media graphics'] },
      { module: 'Module 3 — Adobe Illustrator & CorelDRAW', topics: ['Vector graphics & paths', 'Logo design from scratch', 'Business card & letterhead design', 'Brochure & flyer layout'] },
      { module: 'Module 4 — Portfolio & Freelancing', topics: ['Building a design portfolio', 'Client communication basics', 'Freelance platforms (Fiverr, Upwork)', 'Printing & production basics'] },
    ],
    outcomes: ['Design logos, posters & social media content', 'Work as a freelance graphic designer', 'Join a design agency or studio', 'Build a professional design portfolio'],
  },
  'ms-office': {
    backendName: 'Advance MS Office',
    name: 'Advance MS Office',
    subtitle: 'Master Microsoft Office for the modern workplace',
    icon: '📝',
    duration: '2 Months',
    price: 2000,
    priceDisplay: '₹2,000',
    accent: '#22D3A5',
    glow: 'rgba(34,211,165,0.15)',
    badge: 'Office Essential',
    badgeColor: '#22D3A5',
    faculty: 'Prajapati Vikas',
    about: 'Go beyond the basics with advanced MS Office skills. This course covers Word, Excel, PowerPoint, and Outlook at a professional level — the skills every employer expects.',
    highlights: ['Word, Excel, PowerPoint & Outlook', 'Advanced Excel Formulas', 'Data Analysis & Pivot Tables', 'Professional Templates'],
    curriculum: [
      { module: 'Module 1 — Advanced MS Word', topics: ['Styles, themes & templates', 'Mail merge & bulk letters', 'Table of contents & references', 'Track changes & collaboration'] },
      { module: 'Module 2 — Advanced MS Excel', topics: ['VLOOKUP, HLOOKUP, INDEX-MATCH', 'Pivot tables & pivot charts', 'Conditional formatting & data validation', 'Macros & basic VBA automation'] },
      { module: 'Module 3 — MS PowerPoint Pro', topics: ['Master slides & custom themes', 'Advanced animations & transitions', 'Embedding charts & media', 'Presenting with confidence'] },
      { module: 'Module 4 — MS Outlook & Productivity', topics: ['Email management & rules', 'Calendar & meeting scheduling', 'OneDrive & cloud collaboration', 'Keyboard shortcuts & efficiency tips'] },
    ],
    outcomes: ['Handle all office tasks professionally', 'Automate repetitive work with Excel macros', 'Create impressive presentations', 'Collaborate efficiently in any workplace'],
  },
  pgdca: {
    backendName: 'PGDCA',
    name: 'PGDCA',
    subtitle: 'Post Graduate Diploma in Computer Applications',
    icon: '🎓',
    duration: '12 Months',
    price: 12000,
    priceDisplay: '₹12,000',
    accent: '#A78BFA',
    glow: 'rgba(167,139,250,0.15)',
    badge: 'Post Graduate',
    badgeColor: '#A78BFA',
    faculty: 'Prajapati Vikas',
    about: 'PGDCA is a comprehensive post-graduate level diploma covering programming, databases, networking, and business applications. Ideal for graduates looking to build a strong IT career foundation.',
    highlights: ['Post Graduate Level', 'Programming + Database + Networking', 'Project Work Included', 'IT Career Foundation'],
    curriculum: [
      { module: 'Module 1 — Programming Fundamentals', topics: ['C programming basics & logic building', 'Data structures (arrays, linked lists)', 'Introduction to Python', 'Problem solving & algorithms'] },
      { module: 'Module 2 — Database Management', topics: ['SQL fundamentals & queries', 'MySQL database design', 'Normalization & relationships', 'Database administration basics'] },
      { module: 'Module 3 — Web & Networking', topics: ['HTML, CSS & basic JavaScript', 'Computer networking concepts', 'Internet protocols & security', 'Cloud computing introduction'] },
      { module: 'Module 4 — Business Applications & Project', topics: ['MS Office advanced (Word, Excel, PPT)', 'Tally Prime & accounting basics', 'Final project development', 'Presentation & viva voce'] },
    ],
    outcomes: ['Build a strong IT career foundation', 'Work as a programmer or database admin', 'Qualify for IT-related government jobs', 'Pursue further studies in computer science'],
  },
  dca: {
    backendName: 'Diploma in Computer Application',
    name: 'Diploma in Computer Application',
    subtitle: 'Complete computer skills for office & business',
    icon: '💻',
    duration: '6 Months',
    price: 6000,
    priceDisplay: '₹6,000',
    accent: '#60A5FA',
    glow: 'rgba(96,165,250,0.15)',
    badge: 'Diploma',
    badgeColor: '#60A5FA',
    faculty: 'Prajapati Vikas',
    about: 'DCA is a 6-month diploma covering all essential computer applications — from MS Office to internet, accounting basics, and desktop publishing. Perfect for students and job seekers.',
    highlights: ['6-Month Comprehensive Program', 'MS Office + Tally + DTP', 'Internship Support', 'Recognized Diploma Certificate'],
    curriculum: [
      { module: 'Module 1 — Computer Basics & OS', topics: ['Computer hardware & software', 'Windows OS & file management', 'Typing practice & keyboard skills', 'Antivirus & system maintenance'] },
      { module: 'Module 2 — MS Office', topics: ['MS Word — documents & reports', 'MS Excel — spreadsheets & formulas', 'MS PowerPoint — presentations', 'MS Access — basic databases'] },
      { module: 'Module 3 — Accounting & DTP', topics: ['Tally Prime basics', 'GST concepts & invoicing', 'PageMaker / CorelDRAW basics', 'Designing certificates & brochures'] },
      { module: 'Module 4 — Internet & Communication', topics: ['Internet & email usage', 'Online banking & e-commerce', 'Social media for business', 'Cyber security awareness'] },
    ],
    outcomes: ['Get entry-level office jobs', 'Handle accounts & billing software', 'Design basic marketing materials', 'Work confidently with computers in any field'],
  },
  '2d-animation': {
    backendName: '2D Animation',
    name: '2D Animation',
    subtitle: 'Create stunning animations for media & entertainment',
    icon: '🎬',
    duration: '4 Months',
    price: 5500,
    priceDisplay: '₹5,500',
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
    badge: 'Creative Media',
    badgeColor: '#f59e0b',
    faculty: 'Prajapati Vikas',
    about: 'Learn 2D animation from scratch using industry tools like Adobe Animate and After Effects. Create characters, motion graphics, explainer videos, and animated shorts for media, advertising, and entertainment.',
    highlights: ['Adobe Animate & After Effects', 'Character Design & Rigging', 'Motion Graphics', 'Showreel / Portfolio'],
    curriculum: [
      { module: 'Module 1 — Animation Principles', topics: ['12 principles of animation', 'Storyboarding & script basics', 'Frame rate, timing & spacing', 'Character design fundamentals'] },
      { module: 'Module 2 — Adobe Animate', topics: ['Drawing tools & vector art', 'Frame-by-frame animation', 'Symbol & motion tweening', 'Lip sync & character walk cycles'] },
      { module: 'Module 3 — Adobe After Effects', topics: ['Composition & layers', 'Motion graphics & text animation', 'Masking & visual effects', 'Rendering & export settings'] },
      { module: 'Module 4 — Project & Portfolio', topics: ['Animated short film project', 'Explainer video creation', 'Building an animation showreel', 'Freelance & studio opportunities'] },
    ],
    outcomes: ['Create professional 2D animations', 'Work in media, advertising & gaming', 'Build an animation portfolio / showreel', 'Freelance as a motion graphics artist'],
  },
};

/* ─────────────────────────────────────────────
   Shared Navbar — shows user state
───────────────────────────────────────────── */
const Navbar = ({ scrolled }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };

  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'0 5%', height:68, display:'flex', alignItems:'center', justifyContent:'space-between', background: scrolled ? 'rgba(11,11,15,0.9)' : 'rgba(11,11,15,0.6)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)', transition:'all 0.3s ease' }}>
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#22D3A5,#16a085)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(34,211,165,0.3)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span style={{ fontWeight:800, fontSize:'1.1rem', letterSpacing:'-0.02em', color:'#fff' }}>VCZone</span>
      </Link>
      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
        {user?.name ? (
          <ProfileMenu user={user} onLogout={handleLogout} />
        ) : (
          <>
            <Link to="/login" style={{ padding:'8px 20px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', color:'#A1A1AA', fontSize:'0.875rem', fontWeight:500, transition:'all 0.2s', textDecoration:'none' }}
              onMouseOver={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.color='#fff'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#A1A1AA'; }}
            >Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding:'8px 20px', fontSize:'0.875rem' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

/* ─────────────────────────────────────────────
   Payment hook — handles Razorpay flow
───────────────────────────────────────────── */
function useRazorpay() {
  const loadScript = () =>
    new Promise(resolve => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const pay = async ({ courseId, courseName, amount, userEmail, userName, onSuccess, onError }) => {
    const loaded = await loadScript();
    if (!loaded) return onError('Failed to load payment gateway. Check your internet connection.');

    let orderData;
    try {
      const res = await api.post('/payments/create-order', { courseId });
      orderData = res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not create payment order.';
      return onError(msg);
    }

    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'VCZone',
      description: courseName,
      order_id: orderData.orderId,
      prefill: { name: userName || '', email: userEmail || '' },
      theme: { color: '#22D3A5' },
      handler: async (response) => {
        try {
          const verifyRes = await api.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            courseId,
          });
          onSuccess(verifyRes.data);
        } catch (err) {
          onError(err.response?.data?.message || 'Payment verification failed.');
        }
      },
      modal: { ondismiss: () => onError('Payment cancelled.') },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return { pay };
}

/* ─────────────────────────────────────────────
   Main CoursePage component
───────────────────────────────────────────── */
export default function CoursePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { pay } = useRazorpay();

  const course = COURSES[slug];

  const [scrolled, setScrolled]       = useState(false);
  const [payState, setPayState]       = useState('idle'); // idle | loading | success | error | enrolled
  const [payMsg, setPayMsg]           = useState('');
  const [openModule, setOpenModule]   = useState(0);
  const [backendCourse, setBackendCourse] = useState(null); // live data from API

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);

    const token = localStorage.getItem('token');
    api.get('/courses').then(r => {
      const list = r.data?.data || r.data || [];
      const found = list.find(c =>
        c.name.toLowerCase() === (course?.backendName || '').toLowerCase()
      );
      if (found) {
        setBackendCourse(found); // store full backend object
        if (token) {
          api.get('/enrollments/status').then(res => {
            if (res.data?.enrolled) setPayState('enrolled');
          }).catch(() => {});
        }
      }
    }).catch(() => {});

    return () => window.removeEventListener('scroll', onScroll);
  }, [slug]);

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontSize: '3rem' }}>🔍</div>
        <h2 style={{ color: '#fff', fontWeight: 800 }}>Course not found</h2>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </div>
    );
  }

  const handleEnroll = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { redirect: `/course/${slug}` } });
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role && user.role !== 'student') {
      setPayState('error');
      setPayMsg('Only students can enroll in courses.');
      return;
    }

    // Use pre-fetched courseId — no fragile name matching at payment time
    if (!backendCourse) {
      setPayState('error');
      setPayMsg('This course is not yet available for enrollment. Please contact the institute.');
      return;
    }

    setPayState('loading');
    setPayMsg('');

    pay({
      courseId: backendCourse._id,
      courseName: backendCourse.name,
      amount: backendCourse.price, // always use live price from backend
      userEmail: user.email || '',
      userName: user.name || '',
      onSuccess: () => {
        setPayState('success');
        setPayMsg('🎉 Payment successful! You are now enrolled.');
        setTimeout(() => navigate('/dashboard'), 2000);
      },
      onError: (msg) => {
        if (msg === 'Payment cancelled.') {
          setPayState('idle');
        } else {
          setPayState('error');
          setPayMsg(msg);
        }
      },
    });
  };

  const accentRgb = course.accent.startsWith('#')
    ? course.accent
    : course.accent;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: '#fff' }}>
      <Navbar scrolled={scrolled} />

      {/* ── Hero Banner ── */}
      <section style={{
        paddingTop: 120, paddingBottom: 80, padding: '120px 5% 80px',
        position: 'relative', overflow: 'hidden',
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${course.glow}, transparent 70%)`,
      }}>
        {/* Back link */}
        <Link to="/courses" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 32,
          transition: 'color 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.color = '#fff'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ← All Courses
        </Link>

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }}>
          {/* Left — course info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{
                padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700,
                background: `${accentRgb}20`, color: accentRgb,
                border: `1px solid ${accentRgb}30`, letterSpacing: '0.06em',
              }}>{course.badge}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>⏱ {backendCourse?.duration || course.duration}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18, flexShrink: 0,
                background: course.glow, border: `1px solid ${accentRgb}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
              }}>{course.icon}</div>
              <div>
                <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 6 }}>
                  {course.name}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{course.subtitle}</p>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8, maxWidth: 620, marginBottom: 28 }}>
              {course.about}
            </p>

            {/* Highlight pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {course.highlights.map(h => (
                <div key={h} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 99,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  fontSize: '0.82rem', color: 'var(--text-secondary)',
                }}>
                  <span style={{ color: accentRgb, fontSize: '0.7rem' }}>✦</span>
                  {h}
                </div>
              ))}
            </div>
          </div>

          {/* Right — sticky enroll card */}
          <div style={{
            width: 300, flexShrink: 0,
            background: 'var(--bg-card)',
            border: `1px solid ${accentRgb}25`,
            borderRadius: 24,
            padding: 28,
            boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 40px ${course.glow}`,
            position: 'sticky', top: 88,
          }}>
            {/* Top accent line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '24px 24px 0 0',
              background: `linear-gradient(90deg, transparent, ${accentRgb}, transparent)`,
            }} />

            <div style={{ marginBottom: 6, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Course Fee</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: accentRgb, marginBottom: 4 }}>
              {backendCourse ? `₹${backendCourse.price?.toLocaleString()}` : course.priceDisplay}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 24 }}>One-time payment · Lifetime access</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                { icon: '⏱', label: 'Duration',    value: backendCourse?.duration || course.duration },
                { icon: '📋', label: 'Modules',     value: `${course.curriculum.length} Modules` },
                { icon: '🏆', label: 'Certificate', value: 'Yes, on completion' },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>{icon} {label}</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Pay status messages */}
            {payState === 'error' && (
              <div className="error-banner" style={{ marginBottom: 14, fontSize: '0.8rem' }}>{payMsg}</div>
            )}
            {payState === 'success' && (
              <div className="success-banner" style={{ marginBottom: 14, fontSize: '0.8rem' }}>
                🎉 {payMsg}
              </div>
            )}
            {payState === 'enrolled' && (
              <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 14, background: 'rgba(34,211,165,0.08)', border: '1px solid rgba(34,211,165,0.2)', color: '#22D3A5', fontSize: '0.82rem', textAlign: 'center' }}>
                ✓ You are already enrolled in a course
              </div>
            )}

            {payState === 'enrolled' ? (
              <Link to="/dashboard" style={{
                display: 'block', width: '100%', padding: '14px', borderRadius: 12, textAlign: 'center',
                background: 'linear-gradient(135deg, #22D3A5, #16a085)',
                color: '#000', fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(34,211,165,0.3)',
              }}>Go to My Dashboard →</Link>
            ) : !backendCourse ? (
              <div style={{ padding: '13px', borderRadius: 12, textAlign: 'center', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '0.85rem' }}>
                ⚠ Enrollment not yet open.<br/>
                <span style={{ fontSize: '0.75rem', color: '#71717A' }}>Contact the institute to enroll.</span>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={payState === 'loading' || payState === 'success'}
                className="btn-primary"
                style={{
                  width: '100%', justifyContent: 'center', padding: '14px',
                  fontSize: '1rem', borderRadius: 12,
                  background: payState === 'success'
                    ? 'rgba(34,211,165,0.2)'
                    : `linear-gradient(135deg, ${accentRgb}, ${accentRgb}cc)`,
                  boxShadow: `0 4px 20px ${course.glow}`,
                  opacity: payState === 'loading' ? 0.7 : 1,
                  cursor: payState === 'loading' || payState === 'success' ? 'not-allowed' : 'pointer',
                }}
              >
                {payState === 'loading' ? '⏳ Processing...' : payState === 'success' ? '✓ Enrolled! Redirecting…' : 'Enroll Now →'}
              </button>
            )}

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>
              🔒 Secure payment via Razorpay
            </p>
          </div>
        </div>
      </section>

      {/* ── Curriculum ── */}
      <section style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <div className="badge badge-purple" style={{ marginBottom: 14, display: 'inline-flex' }}>Curriculum</div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            What you'll learn
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {course.curriculum.map((mod, i) => (
            <div key={mod.module}
              style={{
                background: 'var(--bg-card)', border: `1px solid ${openModule === i ? `${accentRgb}30` : 'var(--border)'}`,
                borderRadius: 16, overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: openModule === i ? `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${course.glow}` : 'none',
              }}
            >
              {/* Module header */}
              <button
                onClick={() => setOpenModule(openModule === i ? -1 : i)}
                style={{
                  width: '100%', padding: '18px 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#fff', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: openModule === i ? `${accentRgb}20` : 'var(--bg-elevated)',
                    border: `1px solid ${openModule === i ? `${accentRgb}40` : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700,
                    color: openModule === i ? accentRgb : 'var(--text-muted)',
                    transition: 'all 0.3s',
                  }}>{i + 1}</div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{mod.module}</span>
                </div>
                <span style={{
                  color: openModule === i ? accentRgb : 'var(--text-muted)',
                  fontSize: '1.2rem', transition: 'transform 0.3s',
                  transform: openModule === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  display: 'inline-block',
                }}>⌄</span>
              </button>

              {/* Topics */}
              {openModule === i && (
                <div style={{ padding: '0 24px 20px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, paddingTop: 16 }}>
                    {mod.topics.map(topic => (
                      <div key={topic} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '10px 14px', borderRadius: 10,
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        fontSize: '0.85rem', color: 'var(--text-secondary)',
                      }}>
                        <span style={{ color: accentRgb, fontSize: '0.7rem', marginTop: 3, flexShrink: 0 }}>✦</span>
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Outcomes ── */}
      <section style={{ padding: '0 5% 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <div className="badge badge-green" style={{ marginBottom: 14, display: 'inline-flex' }}>Outcomes</div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            After completing this course
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {course.outcomes.map((o, i) => (
            <div key={o} className="animate-fade-up" style={{
              animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: 'forwards',
              padding: '20px 22px', borderRadius: 16,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              transition: 'all 0.3s ease',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = `${accentRgb}30`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3), 0 0 20px ${course.glow}`; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `${accentRgb}15`, border: `1px solid ${accentRgb}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accentRgb, fontWeight: 800, fontSize: '0.85rem',
              }}>✓</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{o}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ padding: '0 5% 100px' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto', textAlign: 'center',
          background: `linear-gradient(135deg, ${course.glow}, rgba(167,139,250,0.06))`,
          border: `1px solid ${accentRgb}20`,
          borderRadius: 28, padding: '56px 40px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 400, height: 400,
            background: `radial-gradient(circle, ${course.glow}, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{course.icon}</div>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
            Ready to start {course.name}?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.95rem' }}>
            Join hundreds of students already learning at VCZone. Enroll today and get started immediately.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {payState === 'enrolled' ? (
              <Link to="/dashboard" className="btn-primary" style={{ padding: '14px 36px', fontSize: '1rem', background: `linear-gradient(135deg, ${accentRgb}, ${accentRgb}cc)`, boxShadow: `0 4px 20px ${course.glow}` }}>
                Go to My Dashboard →
              </Link>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={payState === 'loading' || payState === 'success'}
                className="btn-primary"
                style={{
                  padding: '14px 36px', fontSize: '1rem',
                  background: `linear-gradient(135deg, ${accentRgb}, ${accentRgb}cc)`,
                  boxShadow: `0 4px 20px ${course.glow}`,
                }}
              >
                {payState === 'loading' ? '⏳ Processing...' : payState === 'success' ? '✓ Enrolled! Redirecting…' : 'Enroll Now →'}
              </button>
            )}
            <Link to="/courses" className="btn-secondary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
              ← Browse All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', padding: '32px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #22D3A5, #16a085)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>VCZone</span>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>© 2026 Vikas Computer Zone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
