const Enrollment = require('../models/Enrollment');

const enrollmentGuard = async (req, res, next) => {
  const enrollment = await Enrollment.findOne({ userId: req.user._id, status: 'active' });

  if (!enrollment) {
    return res.status(403).json({ message: 'No active enrollment', code: 'NO_ENROLLMENT' });
  }

  next();
};

module.exports = enrollmentGuard;
