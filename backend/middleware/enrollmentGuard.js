const Enrollment = require('../models/Enrollment');

/**
 * enrollmentGuard — middleware that blocks access if the logged-in student
 * has no active enrollment. Not currently applied to any route because
 * enrollment checks are handled per-controller, but available for use.
 *
 * Usage: router.get('/some-route', protect, authorize('student'), enrollmentGuard, handler);
 */
const enrollmentGuard = async (req, res, next) => {
  const enrollment = await Enrollment.findOne({ userId: req.user._id, status: 'active' });

  if (!enrollment) {
    return res.status(403).json({ message: 'No active enrollment', code: 'NO_ENROLLMENT' });
  }

  next();
};

module.exports = enrollmentGuard;
