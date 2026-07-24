const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const app  = express();
const PORT = process.env.PORT || 5000;

// Allow all Vercel preview/production domains + localhost in development
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'https://coaching-institute-management-rho.vercel.app',
  'https://coaching-institute-management-ma-git-a06ff3-jigargajjar2424-6109s-projects.vercel.app',
  'https://coaching-institute-management-kp0q8jkz2.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Also allow any *.vercel.app subdomain for future preview deployments
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Raw body for Razorpay webhook signature verification (must be before express.json())
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/courses',      require('./routes/courseRoutes'));
app.use('/api/enrollments',  require('./routes/enrollmentRoutes'));
app.use('/api/payments',     require('./routes/paymentRoutes'));
app.use('/api/batches',    require('./routes/batchRoutes'));
app.use('/api/schedules',  require('./routes/scheduleRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/tests',      require('./routes/testRoutes'));
app.use('/api/marks',      require('./routes/markRoutes'));
app.use('/api/materials',  require('./routes/materialRoutes'));
app.use('/api/stats',      require('./routes/statsRoutes'));

app.get('/', (req, res) => res.send('EduCoach API is running.'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
