# VCZone — Coaching Institute Management System

A full-stack MERN application built to digitize and automate the complete operations of a computer coaching institute — from student enrollment and fee collection to attendance, marks, and study material delivery.

**Live Demo:** [vczone.vercel.app](coaching-institute-management-rho.vercel.app) &nbsp;|&nbsp; **Backend API:** [coaching-institute-management.onrender.com](https://coaching-institute-management.onrender.com)

---

## The Problem It Solves

Small and mid-size coaching institutes typically manage everything through paper registers, WhatsApp groups, and Excel sheets. VCZone replaces that entire workflow with a single platform — students enroll and pay online, faculty mark attendance and upload notes, and the admin gets a real-time overview of the institute.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Axios, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (30-day tokens), bcrypt password hashing |
| Payments | Razorpay (orders + webhook verification) |
| Email | Nodemailer + Gmail SMTP |
| File Uploads | Multer (study materials) |
| Deployment | Vercel (frontend) · Render (backend) |

---

## Features by Role

### Admin
- Dashboard with live stats — total students, faculty, batches, scheduled classes
- Full CRUD on courses, batches, users (admin / faculty / student)
- Manually enroll students into any batch of any course
- View all enrollments, attendance records, test marks with filters
- Assign or unassign students from batches

### Faculty
- View only their own assigned batches and student rosters
- Mark attendance per schedule with bulk upsert (present / absent)
- Record test marks per student with validation against max marks
- Upload study materials (PDF, docs, etc.) per batch
- Delete materials they uploaded

### Student
- Browse and enroll in free courses instantly
- Pay for paid courses via Razorpay — auto-assigned to a batch on payment
- View personal attendance history across all subjects
- View personal marks across all tests
- Download study materials uploaded for their batch
- Password reset via email link (10-minute expiry)

---

## System Design Highlights

**Auto Batch Assignment** — On enrollment (free or paid), the system automatically picks the least-full available batch for that course. If all batches are full, it returns a descriptive error rather than silently failing.

**Razorpay Webhook** — Payment verification uses HMAC-SHA256 signature validation on the raw request body. Webhook events include idempotency checks so double-processing a payment is impossible.

**Role-Based Access Control** — Every protected route passes through `authMiddleware` (JWT verify) and `authorize()` (role check). Faculty can only access their own batches; students only see their own data.

**Cascade Deletes** — Deleting a batch automatically removes all associated schedules and student assignments to keep the database consistent.

**Password Reset Flow** — SHA-256 hashed reset token stored in DB with 15-minute expiry. Plain token sent in email link, never stored.

---

## Project Structure

```
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Business logic (auth, courses, batches, enrollment,
│   │                    #   payments, attendance, marks, materials, stats)
│   ├── middleware/       # JWT auth guard, enrollment guard
│   ├── models/          # Mongoose schemas (User, Course, Batch, Enrollment,
│   │                    #   Student, Schedule, Attendance, Test, Mark, Material)
│   ├── routes/          # Express routers (one per resource)
│   ├── services/        # Shared enrollment service (autoAssign)
│   └── index.js         # App entry point, CORS, route mounting
│
└── frontend/
    └── src/
        ├── pages/       # Login, Register, ForgotPassword, ResetPassword,
        │   ├── admin/   #   Dashboard, Courses, Batches, Users, Enrollments,
        │   ├── faculty/ #   Attendance, Marks, Materials, Schedule
        │   └── student/ #
        ├── services/    # Axios instances (api.jsx, adminApi, facultyApi, studentApi)
        ├── components/  # Navbar, ProtectedRoute, admin UI components
        └── layouts/     # Role-specific layout wrappers
```

---

## API Reference

### Auth  `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register as student |
| POST | `/login` | Public | Login, returns JWT |
| POST | `/forgot-password` | Public | Send reset email |
| PUT | `/reset-password/:token` | Public | Reset with token |
| PUT | `/change-password` | Private | Change own password |
| POST | `/create-user` | Admin | Create any role user |
| GET | `/users` | Admin | List all users |
| PUT | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Delete user |

### Courses  `/api/courses`
`GET /` (public) · `GET /:id` (public) · `POST /` · `PUT /:id` · `DELETE /:id` (admin)

### Batches  `/api/batches`
`GET /` (role-scoped) · `GET /:id` · `POST /` · `PUT /:id` · `DELETE /:id` (admin)  
`POST /assign` · `POST /unassign` — assign/remove students

### Enrollments  `/api/enrollments`
`POST /free` (student) · `POST /manual` (admin) · `GET /status` (student) · `GET /` (admin)

### Payments  `/api/payments`
`POST /create-order` · `POST /verify` (student) · `POST /webhook` (Razorpay)

### Attendance  `/api/attendance`
`POST /` (faculty) · `GET /my-attendance` (student) · `GET /my-batch` (faculty)  
`GET /` (admin) · `GET /schedule/:scheduleId` (admin)

### Marks  `/api/marks`
`POST /` (faculty) · `GET /my-marks` (student) · `GET /test/:testId` (faculty/admin) · `GET /` (admin)

### Materials  `/api/materials`
`POST /` (faculty, multipart) · `GET /my-materials` (student) · `GET /batch/:batchId` · `DELETE /:id` (faculty)

### Stats  `GET /api/stats` (admin)

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Razorpay test account
- Gmail account with App Password enabled

### 1. Clone
```bash
git clone https://github.com/JigarGajjar21/coaching-institute-management.git
cd coaching-management-system
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Fill in .env values (see below)
npm install
npm run dev
```

**`backend/.env`**
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/coaching_db
PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

### 4. Seed Admin
```bash
cd backend
node seedAdmin.js
```

App runs at `http://localhost:5173`

---

## Deployment

### Backend → Render
1. New Web Service → connect repo → set root directory to `backend`
2. Build command: `npm install` · Start command: `node index.js`
3. Add all environment variables from `.env.example`

### Frontend → Vercel
1. New Project → connect repo → set root directory to `frontend`
2. Framework preset: Vite
3. Add environment variable:
   ```
   VITE_API_URL = https://your-render-service.onrender.com/api
   ```
   > ⚠ The `/api` suffix is required. Without it every API call will 404.

---

## Security Practices

- Passwords hashed with bcrypt (salt rounds: 10) — plaintext never stored
- JWT signed with a secret, role embedded in payload
- Password reset tokens SHA-256 hashed before DB storage, 15-minute expiry
- Razorpay webhooks verified via HMAC-SHA256 on raw request body
- CORS restricted to `FRONTEND_URL` environment variable
- Role-based route guards on every protected endpoint
- Faculty and student data access scoped to their own records only

---

## License

MIT
