const Course      = require('../models/Course');
const Batch       = require('../models/Batch');
const Enrollment  = require('../models/Enrollment');
const User        = require('../models/User');
const { autoAssign, createEnrollmentAndStudent } = require('../services/enrollmentService');

// @desc    Enroll in a free course
// @route   POST /api/enrollments/free
// @access  Private/Student
exports.enrollFree = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Fetch course
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Must be a free course
    if (course.price !== 0)
      return res.status(400).json({ message: 'This course is not free' });

    // Check for existing active enrollment
    const existing = await Enrollment.findOne({ userId: req.user._id, courseId, status: 'active' });
    if (existing) return res.status(409).json({ message: 'Already enrolled in this course' });

    // Auto-assign to a batch
    let batch;
    try {
      batch = await autoAssign(courseId);
    } catch (err) {
      if (err === 'NO_BATCH')
        return res.status(422).json({ message: 'No batches available for this course' });
      if (err === 'ALL_BATCHES_FULL')
        return res.status(422).json({ message: 'All batches for this course are full' });
      throw err;
    }

    const enrollment = await createEnrollmentAndStudent(
      req.user._id,
      courseId,
      batch,
      'free'
    );

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Manually enroll a student (admin)
// @route   POST /api/enrollments/manual
// @access  Private/Admin
exports.manualEnroll = async (req, res) => {
  try {
    const { userId, courseId, batchId } = req.body;

    // Validate required fields
    if (!userId || !courseId || !batchId)
      return res.status(400).json({ message: 'userId, courseId, and batchId are required' });

    // Check user exists and is a student
    const user = await User.findById(userId);
    if (!user || user.role !== 'student')
      return res.status(400).json({ message: 'User not found or is not a student' });

    // Check batch exists and belongs to the specified course
    const batch = await Batch.findById(batchId);
    if (!batch)
      return res.status(400).json({ message: 'Batch not found' });

    if (batch.courseId.toString() !== courseId)
      return res.status(400).json({ message: 'Batch does not belong to the specified course' });

    // Check for existing active enrollment
    const existing = await Enrollment.findOne({ userId, courseId, status: 'active' });
    if (existing) return res.status(409).json({ message: 'Student is already enrolled in this course' });

    const enrollment = await createEnrollmentAndStudent(
      userId,
      courseId,
      batch,
      'offline'
    );

    res.status(201).json({ message: 'Student enrolled successfully', enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current student's enrollment status
// @route   GET /api/enrollments/status
// @access  Private/Student
exports.getMyEnrollmentStatus = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ userId: req.user._id, status: 'active' });
    res.status(200).json({ enrolled: !!enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private/Admin
exports.getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('userId', 'name email')
      .populate('courseId', 'name')
      .populate('batchId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
