const express = require('express');
const router  = express.Router();
const { markAttendance, getMyAttendance, getBatchAttendance, getAllAttendance, getScheduleAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/',                                    protect, authorize('faculty'), markAttendance);
router.get('/my-attendance',                        protect, authorize('student'), getMyAttendance);
router.get('/my-batch',                             protect, authorize('faculty'), getBatchAttendance);
router.get('/schedule/:scheduleId',                 protect, authorize('admin'),   getScheduleAttendance);
router.get('/',                                     protect, authorize('admin'),   getAllAttendance);

module.exports = router;
