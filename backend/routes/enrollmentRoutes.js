const express = require('express');
const router  = express.Router();
const {
  enrollFree,
  manualEnroll,
  getMyEnrollmentStatus,
  getEnrollments
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/status', protect, authorize('student'), getMyEnrollmentStatus);
router.get('/',       protect, authorize('admin'),   getEnrollments);
router.post('/free',  protect, authorize('student'), enrollFree);
router.post('/manual', protect, authorize('admin'),  manualEnroll);

module.exports = router;
