import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CoursePage from './pages/CoursePage';
import CoursesPage from './pages/CoursesPage';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';

// Admin pages
import Dashboard    from './pages/admin/Dashboard';
import Users        from './pages/admin/Users';
import Courses      from './pages/admin/Courses';
import Batches      from './pages/admin/Batches';
import BatchDetail  from './pages/admin/BatchDetail';
import Enrollments  from './pages/admin/Enrollments';
import Schedule     from './pages/admin/Schedule';
import Attendance   from './pages/admin/Attendance';
import Marks        from './pages/admin/Marks';
import Materials    from './pages/admin/Materials';

// Student pages
import StudentDashboard  from './pages/student/Dashboard';
import StudentSchedule   from './pages/student/Schedule';
import StudentAttendance from './pages/student/Attendance';
import StudentMarks      from './pages/student/Marks';
import StudentMaterials  from './pages/student/Materials';

import './index.css';

const AdminRoute   = ({ children }) => <ProtectedRoute role="admin">{children}</ProtectedRoute>;
const StudentRoute = ({ children }) => <ProtectedRoute role="student">{children}</ProtectedRoute>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/"                element={<Home />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/courses"         element={<CoursesPage />} />
        <Route path="/course/:slug"    element={<CoursePage />} />
        <Route path="/about"           element={<Navigate to="/" replace />} />

        {/* Student */}
        <Route path="/dashboard"              element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="/dashboard/schedule"     element={<StudentRoute><StudentSchedule /></StudentRoute>} />
        <Route path="/dashboard/attendance"   element={<StudentRoute><StudentAttendance /></StudentRoute>} />
        <Route path="/dashboard/marks"        element={<StudentRoute><StudentMarks /></StudentRoute>} />
        <Route path="/dashboard/materials"    element={<StudentRoute><StudentMaterials /></StudentRoute>} />

        {/* Admin */}
        <Route path="/admin"             element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard"   element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/users"       element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/admin/courses"     element={<AdminRoute><Courses /></AdminRoute>} />
        <Route path="/admin/batches"     element={<AdminRoute><Batches /></AdminRoute>} />
        <Route path="/admin/batches/:id" element={<AdminRoute><BatchDetail /></AdminRoute>} />
        <Route path="/admin/enrollments" element={<AdminRoute><Enrollments /></AdminRoute>} />
        <Route path="/admin/schedule"    element={<AdminRoute><Schedule /></AdminRoute>} />
        <Route path="/admin/attendance"  element={<AdminRoute><Attendance /></AdminRoute>} />
        <Route path="/admin/marks"       element={<AdminRoute><Marks /></AdminRoute>} />
        <Route path="/admin/materials"   element={<AdminRoute><Materials /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
