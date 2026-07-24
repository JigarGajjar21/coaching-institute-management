# VCZone — Comprehensive Testing Checklist

Run through this checklist after deploying the bug fixes to verify all features work correctly.

---

## Prerequisites

### Backend
```bash
cd backend
npm install
# Create .env file with all required variables (see .env.example)
node seedAdmin.js  # Create initial admin user
npm run dev        # Start on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
# Create .env file with VITE_API_URL=http://localhost:5000/api
npm run dev        # Start on http://localhost:5173
```

### MongoDB Atlas Index Fix (CRITICAL)
Before testing enrollment flows, you MUST manually drop the old unique index:
1. MongoDB Atlas → Browse Collections → your_db → enrollments
2. Indexes tab → Drop the old `{ userId: 1, courseId: 1 }` index
3. Restart backend → Mongoose recreates the correct partial index

Without this step, re-enrollment will still fail (Bug 1 not fully fixed).

---

## 1. Authentication & User Management

### Public Routes
- [ ] **Home page** loads at `http://localhost:5173/`
- [ ] **Navbar** shows Login/Register buttons when logged out
- [ ] **Register page** — create a new student account
  - Email validation works
  - Password must be 6+ characters
  - JWT token stored in localStorage on success
  - Redirects to /courses after registration
- [ ] **Login page** — log in with any user
  - Invalid credentials show error message
  - Valid login stores token + user object in localStorage
  - Admin redirects to `/admin/dashboard`
  - Faculty redirects to `/faculty/dashboard`
  - Student with enrollment redirects to `/dashboard`
  - Student without enrollment redirects to `/courses`
- [ ] **Forgot Password** — request reset link
  - Email sent with reset link (check nodemailer logs or email inbox)
  - Email says "expires in 15 minutes" (Bug 5 fix verified)
- [ ] **Reset Password** — click link from email
  - Token validates correctly
  - New password saved and can log in with it
  - Expired token shows error

### Admin — User Management (`/admin/users`)
- [ ] **View all users** — table shows students, faculty, admins
- [ ] **Filter by role** — tabs filter correctly (all/student/faculty/admin)
- [ ] **Create user** — add new user with any role
  - Email uniqueness enforced
  - Password min 6 characters enforced
- [ ] **Edit user** — update name, email, role, password (optional)
- [ ] **Delete user** — remove user (cannot delete self)
- [ ] **Logout** — ProfileMenu → Logout clears token and redirects to /login

---

## 2. Course Management

### Admin — Courses (`/admin/courses`)
- [ ] **View all courses** — table lists all courses with price/duration
- [ ] **Create course**
  - Name, price, duration all required
  - Duplicate name rejected
  - Free course (price = 0) works
- [ ] **Edit course** — update name/price/duration
- [ ] **Delete course**
  - Blocked if any batch exists for this course
  - Success if no batches
- [ ] **Search** — filter courses by name/duration

### Public — Browse Courses (`/courses`)
- [ ] **All courses display** with icons, price, duration
- [ ] **Known courses** (in RICH map) show "View Course →" button
- [ ] **Unknown FREE courses** show "Enroll Free" button (Bug 6 fix)
  - Click → POST /enrollments/free → success toast → redirect to /dashboard
  - Non-logged-in user redirected to /login first
- [ ] **Unknown PAID courses** show "Enroll →" button
  - Redirects to login if not authenticated
- [ ] **Course fee displays "FREE"** for price = 0 courses (Bug 6 fix)

---

## 3. Batch & Enrollment Management

### Admin — Batches (`/admin/batches`)
- [ ] **View all batches** — table shows batch name, course, faculty, student count
- [ ] **Create batch**
  - Name, course, faculty all required
  - Duplicate name rejected
- [ ] **Edit batch** — update name, course, or assigned faculty
- [ ] **Delete batch** — cascades to schedules and student assignments
- [ ] **View batch detail** (`/admin/batches/:id`)
  - Shows course, faculty, student count, test count
  - Tabs: Students, Schedule, Materials, Tests

### Admin — Batch Detail: Students Tab
- [ ] **Assign student to batch**
  - Search/select student from dropdown
  - Assign button adds student
  - Fresh student list appears immediately (Bug 2 fix verified)
- [ ] **Remove student from batch** — unassigns correctly

### Admin — Batch Detail: Schedule Tab
- [ ] **Add schedule slot**
  - Day, time, subject all required
  - Duplicate day+time rejected (unique index)
- [ ] **Edit schedule** — update day/time/subject
- [ ] **Delete schedule** — removes slot

### Admin — Enrollments (`/admin/enrollments`)
- [ ] **View all enrollments** — shows student, course, batch, status, payment method
- [ ] **Manual enrollment (offline)**
  - Select student, course, batch (filtered by selected course)
  - Creates enrollment with `paymentMethod: 'offline'`
  - **Re-enrollment test (Bug 1 fix):**
    - Manually set an enrollment to `status: 'inactive'` in MongoDB Atlas
    - Try enrolling the same student in the same course again
    - Should succeed (partial index allows this)

---

## 4. Payment & Online Enrollment

### Student — Enroll in Paid Course
- [ ] **Browse courses** → select a paid course with detail page
- [ ] **Click "Enroll Now"** → Razorpay modal opens
- [ ] **Complete test payment** (use Razorpay test card)
  - Payment verified via HMAC-SHA256 signature
  - Enrollment created with `paymentMethod: 'online'`
  - Student auto-assigned to least-full batch
  - Redirects to /dashboard
- [ ] **Payment failure** — error handled gracefully
- [ ] **Duplicate enrollment blocked** — "Already enrolled" message if active enrollment exists

### Razorpay Webhook (backend test)
- [ ] **Webhook signature verification** works (check logs)
- [ ] **Idempotency** — webhook for same order_id processed only once

---

## 5. Schedule Management

### Admin — Schedule (`/admin/schedule`)
- [ ] **View all schedules** — table view shows all batches' schedules
- [ ] **Week view** — visual calendar by day (color-coded)
- [ ] **Search** — filter by subject/day

### Faculty — My Schedule (`/faculty/schedule`)
- [ ] **View only own batches' schedules**
- [ ] **Week view** — shows classes by day with "TODAY" badge
- [ ] **List view** — sortable table
- [ ] **Empty state** if no schedules assigned (200 response, not 404 — Bug 4 fix)

### Student — My Schedule (`/dashboard/schedule`)
- [ ] **View schedules for all enrolled batches**
- [ ] **Week view** with color-coded days
- [ ] **Today's classes highlighted**
- [ ] **Empty state** if not assigned to any batch yet (200 response — Bug 4 fix)

---

## 6. Attendance Management

### Faculty — Mark Attendance (`/faculty/attendance`)
- [ ] **Select batch** → schedules populate
- [ ] **Select schedule** → date defaults to today
- [ ] **Student list loads from fresh API call** (Bug 2 fix verified)
  - If you assign a new student to the batch in another tab, they appear when you reselect the batch
- [ ] **Mark attendance** — toggle Present/Absent per student
- [ ] **Bulk actions** — "All Present" / "All Absent" buttons work
- [ ] **Submit** → success toast → records saved
- [ ] **History tab** — view all past attendance records
  - Date displays as "YYYY-MM-DD" string, not converted (Bug 4 fix)

### Admin — View Attendance (`/admin/attendance`)
- [ ] **View all attendance** across all batches
- [ ] **Filter by batch** — dropdown filters correctly
- [ ] **Filter by subject** — text input filters
- [ ] **Summary stats** — total/present/absent/percentage display
- [ ] **Date displays correctly** without off-by-one error (Bug 4 fix)

### Student — My Attendance (`/dashboard/attendance`)
- [ ] **View personal attendance history** across all subjects
- [ ] **Shows schedule, batch, date, status**
- [ ] **Attendance percentage calculated** correctly

---

## 7. Marks & Tests Management

### Faculty — Create Test & Record Marks (`/faculty/marks`)
- [ ] **Select batch** → tests populate
- [ ] **Create new test**
  - Subject, date, max marks required
  - Duplicate subject+date+batch rejected (unique index)
- [ ] **Select test** → student list loads
  - **Fresh student list from getBatchDetails()** (Bug 3 fix verified)
  - If you assign a new student to batch, they appear when you reselect batch
- [ ] **Enter marks** — per-student input with live percentage display
- [ ] **Color coding** — green (≥75%), orange (50-74%), red (<50%)
- [ ] **Save marks** → success toast → marks saved
  - **Verify in MongoDB** that all students have marks records
  - Bug 3 would cause empty marksRecords array — this is now fixed
- [ ] **View results tab** — see all students' scores and percentages

### Admin — View All Marks (`/admin/marks`)
- [ ] **View marks across all batches**
- [ ] **Filter by batch** — dropdown filters
- [ ] **Top performers card** — shows top 3 students with medals
- [ ] **Score badges** with percentage and color coding

### Student — My Marks (`/dashboard/marks`)
- [ ] **View personal test results** across all subjects
- [ ] **Shows test, batch, score, percentage**
- [ ] **Color-coded by performance** (green/orange/red)

---

## 8. Study Materials Management

### Faculty — Upload Materials (`/faculty/materials`)
- [ ] **Select batch**
- [ ] **Upload form**
  - Title, description (optional), file (drag/drop or browse)
  - File icon displays based on extension (PDF📕, DOC📘, XLS📗, etc.)
- [ ] **Upload** → success toast → material appears in grid
- [ ] **Material card** shows title, description, faculty, date, download button
- [ ] **Delete material** → confirmation → file removed from server

### Admin — View Materials (`/admin/materials`)
- [ ] **View materials per batch** (batch selector tabs)
- [ ] **Download button** opens file in new tab
- [ ] **Base URL strips /api** correctly (no 404)

### Student — My Materials (`/dashboard/materials`)
- [ ] **View materials from all enrolled batches**
- [ ] **File icon, title, description, faculty, date display**
- [ ] **Download button** works
- [ ] **Search filter** — filters by title/description

---

## 9. Dashboard & Stats

### Admin Dashboard (`/admin/dashboard`)
- [ ] **Stats cards** — total students, faculty, batches, enrollments
- [ ] **Recent batches table** — shows 5 most recent batches
- [ ] **All data loads** via Promise.all without breaking on single failure

### Faculty Dashboard (`/faculty/dashboard`)
- [ ] **Stats cards** — my batches, total students, today's classes, attendance taken
- [ ] **Today's classes list** — filtered by current day
- [ ] **My batches list** — shows top 5 batches
- [ ] **Quick links** — navigate to schedule/attendance/marks/materials

### Student Dashboard (`/dashboard`)
- [ ] **Stats cards** — attendance %, avg score %, today's classes, materials count
- [ ] **Today's classes** — filtered by current day
- [ ] **Recent marks** — shows last 4 test results
- [ ] **Quick links** — navigate to schedule/attendance/marks/materials/courses

---

## 10. Role-Based Access Control

### Protection Tests
- [ ] **Anonymous user** redirected to /login when accessing protected routes
- [ ] **Student** cannot access `/admin/*` or `/faculty/*` routes (redirects to /)
- [ ] **Faculty** cannot access `/admin/*` routes
- [ ] **Admin** can access all routes
- [ ] **JWT expiry** (30 days) — token refresh not needed for 30 days

### Route Guards in Action
- [ ] Try accessing `/admin/users` as a student → redirected
- [ ] Try accessing `/faculty/attendance` as a student → redirected
- [ ] Try accessing `/dashboard` as admin → allowed (ProtectedRoute only checks role match, not exclusive)

---

## 11. Edge Cases & Error Handling

### Form Validations
- [ ] **Empty fields** show error messages before submit
- [ ] **Email format** validated on register/login
- [ ] **Duplicate entries** (course name, batch name, user email) rejected with clear error
- [ ] **Date pickers** enforce valid date format

### API Error Handling
- [ ] **Network error** — shows error toast/message to user
- [ ] **401 Unauthorized** — token expired, redirects to login
- [ ] **403 Forbidden** — role not allowed, shows error
- [ ] **404 Not Found** — entity missing, shows "not found" message
- [ ] **500 Server Error** — shows generic error, logs detail to console

### Empty States
- [ ] **No courses yet** — "No courses available" message
- [ ] **No batches** — "No batches yet" message
- [ ] **No students in batch** — "No students assigned" message
- [ ] **No schedule** — "No classes today 🎉" or "No schedule assigned"
- [ ] **No materials** — "No materials uploaded yet"
- [ ] **No marks** — "No tests yet"

---

## 12. UI/UX Polish

### Visual Feedback
- [ ] **Loading states** — "Loading…" message while fetching data
- [ ] **Toast notifications** — success (green) and error (red) toasts display and auto-dismiss
- [ ] **Button states**
  - Disabled while saving/uploading (cursor: not-allowed, reduced opacity)
  - Hover effects on interactive elements
- [ ] **Modal open/close** — ESC key closes modals

### Animations
- [ ] **Page transitions** — smooth fadeUp animation on course cards
- [ ] **Hover effects** — cards lift on hover with glow
- [ ] **Floating illustration** on login/register pages

### Responsive Design
- [ ] **Mobile view** — test on narrow viewport (400px)
  - Login/register cards stack vertically
  - Tables scroll horizontally or collapse
  - Navbar hamburger menu (if implemented)
- [ ] **Tablet view** — layouts adapt at 768px breakpoint
- [ ] **Desktop view** — optimal at 1200px+

---

## 13. Performance & Security

### Performance
- [ ] **API calls debounced** where applicable (search inputs)
- [ ] **Images optimized** (if any large images added)
- [ ] **Bundle size** — frontend build completes in <30s
- [ ] **No memory leaks** — useEffect cleanup functions present

### Security
- [ ] **Passwords hashed** with bcrypt (check DB — passwords should look like `$2b$10$...`)
- [ ] **JWT signed** with secret, includes role in payload
- [ ] **CORS restricted** to FRONTEND_URL only
- [ ] **Reset tokens hashed** before storing in DB (SHA-256)
- [ ] **Razorpay signatures verified** before processing payments
- [ ] **SQL injection impossible** (Mongoose escapes queries)
- [ ] **XSS prevented** (React auto-escapes JSX)

---

## 14. Deployment Verification (Production)

### Backend on Render
- [ ] **Environment variables set** in Render dashboard
  - MONGO_URI, JWT_SECRET, FRONTEND_URL, EMAIL_USER, EMAIL_PASS, RAZORPAY_*
- [ ] **Build succeeds** — `npm install` runs without errors
- [ ] **Health check** — `GET https://your-render-url.com/` returns "EduCoach API is running."
- [ ] **MongoDB logs** show "MongoDB Connected"
- [ ] **No crash on startup** — logs show "Server running on port..."

### Frontend on Vercel
- [ ] **Environment variable** `VITE_API_URL` set to `https://your-render-url.com/api`
  - **CRITICAL:** Must include `/api` suffix (Bug 0 from original report)
- [ ] **Build succeeds** — `vite build` completes
- [ ] **Home page loads** at your Vercel URL
- [ ] **Login works** — JWT stored, API calls succeed
- [ ] **CORS works** — no "blocked by CORS policy" errors in console

### Post-Deployment Smoke Test
- [ ] Register new student → enroll in free course → view dashboard
- [ ] Login as admin → create batch → assign student → mark attendance
- [ ] Login as faculty → view schedule → record marks → upload material
- [ ] Login as student → view attendance → view marks → download material

---

## Test Result Summary

| Category | Tests Passed | Tests Failed | Notes |
|----------|--------------|--------------|-------|
| Auth & Users | __ / __ | __ | |
| Courses | __ / __ | __ | |
| Batches & Enrollment | __ / __ | __ | |
| Payments | __ / __ | __ | |
| Schedule | __ / __ | __ | |
| Attendance | __ / __ | __ | |
| Marks & Tests | __ / __ | __ | |
| Materials | __ / __ | __ | |
| Dashboards | __ / __ | __ | |
| RBAC | __ / __ | __ | |
| Edge Cases | __ / __ | __ | |
| UI/UX | __ / __ | __ | |
| Performance | __ / __ | __ | |
| Deployment | __ / __ | __ | |

---

## Known Issues (Post-Testing)

Document any issues found during testing here:

1. 
2. 
3. 

---

## Test Environment

- **Node.js Version:** _____________
- **MongoDB Version:** _____________
- **Browser(s) Tested:** _____________
- **Operating System:** _____________
- **Date Tested:** _____________
- **Tester Name:** _____________

---

**All bug fixes have been applied. This checklist ensures every feature works end-to-end after the fixes.**
