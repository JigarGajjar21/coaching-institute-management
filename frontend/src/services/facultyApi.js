import api from './api';

export const getFacultySchedule  = ()              => api.get('/schedules/faculty-schedule');
export const getFacultyBatches   = ()              => api.get('/batches');
export const getBatchDetails     = (id)            => api.get(`/batches/${id}`);
export const getBatchSchedule    = (batchId)       => api.get(`/schedules/batch/${batchId}`);

// Attendance
export const getBatchAttendance  = (params)        => api.get('/attendance/my-batch', { params });
export const markAttendance      = (data)          => api.post('/attendance', data);

// Tests
export const getTestsByBatch     = (batchId)       => api.get(`/tests/batch/${batchId}`);
export const createTest          = (data)          => api.post('/tests', data);
export const getTestMarks        = (testId)        => api.get(`/marks/test/${testId}`);
export const recordMarks         = (data)          => api.post('/marks', data);

// Materials
export const getBatchMaterials   = (batchId)       => api.get(`/materials/batch/${batchId}`);
export const uploadMaterial      = (formData)      => api.post('/materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteMaterial      = (id)            => api.delete(`/materials/${id}`);
