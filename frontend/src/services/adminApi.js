import api from './api';

// ── Stats ──────────────────────────────────────────────
export const getStats = () => api.get('/stats');

// ── Users ──────────────────────────────────────────────
export const getUsers       = ()         => api.get('/auth/users');
export const createUser     = (data)     => api.post('/auth/create-user', data);
export const updateUser     = (id, data) => api.put(`/auth/users/${id}`, data);
export const deleteUser     = (id)       => api.delete(`/auth/users/${id}`);

// ── Courses ────────────────────────────────────────────
export const getCourses     = ()         => api.get('/courses');
export const createCourse   = (data)     => api.post('/courses', data);
export const updateCourse   = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse   = (id)       => api.delete(`/courses/${id}`);

// ── Batches ────────────────────────────────────────────
export const getBatches       = ()           => api.get('/batches');
export const getBatchById     = (id)         => api.get(`/batches/${id}`);
export const createBatch      = (data)       => api.post('/batches', data);
export const updateBatch      = (id, data)   => api.put(`/batches/${id}`, data);
export const deleteBatch      = (id)         => api.delete(`/batches/${id}`);
export const assignStudent    = (data)       => api.post('/batches/assign', data);
export const unassignStudent  = (data)       => api.post('/batches/unassign', data);

// ── Enrollments ────────────────────────────────────────
export const getEnrollments   = ()     => api.get('/enrollments');
export const manualEnroll     = (data) => api.post('/enrollments/manual', data);

// ── Schedules ──────────────────────────────────────────
export const getAllSchedules    = ()           => api.get('/schedules');
export const getBatchSchedule   = (batchId)   => api.get(`/schedules/batch/${batchId}`);
export const addSchedule        = (data)      => api.post('/schedules', data);
export const updateSchedule     = (id, data)  => api.put(`/schedules/${id}`, data);
export const deleteSchedule     = (id)        => api.delete(`/schedules/${id}`);

// ── Attendance ─────────────────────────────────────────
export const getAllAttendance = (params) => api.get('/attendance', { params });

// ── Marks ──────────────────────────────────────────────
export const getAllMarks   = (params)  => api.get('/marks', { params });
export const getTestMarks = (testId)  => api.get(`/marks/test/${testId}`);

// ── Tests ──────────────────────────────────────────────
export const getTestsByBatch = (batchId) => api.get(`/tests/batch/${batchId}`);

// ── Materials ──────────────────────────────────────────
export const getBatchMaterials = (batchId) => api.get(`/materials/batch/${batchId}`);
