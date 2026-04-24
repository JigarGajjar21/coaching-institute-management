import api from './api';

export const getMyEnrollmentStatus = ()       => api.get('/enrollments/status');
export const getMySchedule         = ()       => api.get('/schedules/my-schedule');
export const getMyAttendance       = ()       => api.get('/attendance/my-attendance');
export const getMyMarks            = ()       => api.get('/marks/my-marks');
export const getMyMaterials        = ()       => api.get('/materials/my-materials');
export const getCourses            = ()       => api.get('/courses');
export const createOrder           = (data)   => api.post('/payments/create-order', data);
export const verifyPayment         = (data)   => api.post('/payments/verify', data);
export const getBatches            = ()       => api.get('/batches');
