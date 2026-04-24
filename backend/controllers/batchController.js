const Batch   = require('../models/Batch');
const User    = require('../models/User');
const Student = require('../models/Student');
const Course  = require('../models/Course');

// @desc    Create a new batch
// @route   POST /api/batches
// @access  Private/Admin
exports.createBatch = async (req, res) => {
  try {
    const { name, facultyId, courseId } = req.body;

    if (!name || !facultyId || !courseId)
      return res.status(400).json({ message: 'Please provide name, facultyId and courseId' });

    const faculty = await User.findById(facultyId);
    if (!faculty)
      return res.status(404).json({ message: 'Faculty not found' });
    if (faculty.role !== 'faculty')
      return res.status(400).json({ message: 'Assigned user is not a faculty member' });

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(400).json({ message: 'Course not found' });

    if (await Batch.findOne({ name }))
      return res.status(400).json({ message: 'Batch with this name already exists' });

    const batch = await Batch.create({ name, facultyId, courseId });
    res.status(201).json({ message: 'Batch created successfully', batch });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Assign a student to a batch
// @route   POST /api/batches/assign
// @access  Private/Admin
exports.assignStudent = async (req, res) => {
  try {
    const { studentId, batchId } = req.body;

    if (!studentId || !batchId)
      return res.status(400).json({ message: 'Please provide studentId and batchId' });

    const user = await User.findById(studentId);
    if (!user || user.role !== 'student')
      return res.status(404).json({ message: 'User not found or is not a student' });

    if (!(await Batch.findById(batchId)))
      return res.status(404).json({ message: 'Batch not found' });

    if (await Student.findOne({ userId: studentId, batchId }))
      return res.status(400).json({ message: 'Student is already assigned to this batch' });

    const assignment = await Student.create({ userId: studentId, batchId });
    res.status(200).json({ message: 'Student assigned to batch successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove a student from a specific batch
// @route   POST /api/batches/unassign
// @access  Private/Admin
exports.unassignStudent = async (req, res) => {
  try {
    const { studentId, batchId } = req.body;
    if (!studentId || !batchId)
      return res.status(400).json({ message: 'Please provide studentId and batchId' });

    await Student.deleteOne({ userId: studentId, batchId });
    res.status(200).json({ message: 'Student removed from batch' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all batches (role-scoped)
// @route   GET /api/batches
// @access  Private
exports.getBatches = async (req, res) => {
  try {
    const { role } = req.user;
    let batches    = [];

    if (role === 'admin') {
      batches = await Batch.find()
        .populate('facultyId', 'name email role')
        .populate('courseId', 'name price duration')
        .populate({ path: 'students', populate: { path: 'userId', select: 'name email' } });

    } else if (role === 'faculty') {
      batches = await Batch.find({ facultyId: req.user._id })
        .populate('facultyId', 'name email role')
        .populate('courseId', 'name price duration')
        .populate({ path: 'students', populate: { path: 'userId', select: 'name email' } });

    } else if (role === 'student') {
      const assignments = await Student.find({ userId: req.user._id }).populate({
        path:     'batchId',
        populate: { path: 'facultyId', select: 'name email role' },
      });
      batches = assignments.map(a => a.batchId).filter(Boolean);
    }

    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get batch details with faculty and students
// @route   GET /api/batches/:id
// @access  Private/Admin or Faculty
exports.getBatchDetails = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('facultyId', 'name email role')
      .populate('courseId', 'name price duration')
      .populate({ path: 'students', populate: { path: 'userId', select: 'name email role' } });

    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    if (req.user.role === 'faculty' && batch.facultyId._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied: this batch is not assigned to you' });

    res.status(200).json(batch);
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Invalid Batch ID' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update batch name and/or faculty
// @route   PUT /api/batches/:id
// @access  Private/Admin
exports.updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const { name, facultyId, courseId } = req.body;

    if (name && name !== batch.name) {
      if (await Batch.findOne({ name }))
        return res.status(400).json({ message: 'Batch name already exists' });
      batch.name = name;
    }
    if (facultyId) {
      const faculty = await User.findById(facultyId);
      if (!faculty || faculty.role !== 'faculty')
        return res.status(400).json({ message: 'Invalid faculty user' });
      batch.facultyId = facultyId;
    }
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course)
        return res.status(400).json({ message: 'Course not found' });
      batch.courseId = courseId;
    }

    await batch.save();
    res.status(200).json({ message: 'Batch updated successfully', batch });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a batch (cascades schedules and student assignments)
// @route   DELETE /api/batches/:id
// @access  Private/Admin
exports.deleteBatch = async (req, res) => {
  try {
    const Schedule = require('../models/Schedule');

    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    await Schedule.deleteMany({ batchId: req.params.id });
    await Student.deleteMany({ batchId: req.params.id });
    await batch.deleteOne();

    res.status(200).json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
