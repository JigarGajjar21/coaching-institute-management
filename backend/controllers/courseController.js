const Course = require('../models/Course');
const Batch  = require('../models/Batch');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  try {
    const { name, price, duration } = req.body;

    if (!name || price === undefined || price === null || !duration)
      return res.status(400).json({ message: 'Please provide name, price and duration' });

    if (await Course.findOne({ name }))
      return res.status(400).json({ message: 'Course with this name already exists' });

    const course = await Course.create({ name, price, duration });
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.status(200).json(course);
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Course not found' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { name, price, duration } = req.body;

    if (name !== undefined)     course.name     = name;
    if (price !== undefined)    course.price    = price;
    if (duration !== undefined) course.duration = duration;

    await course.save();
    res.status(200).json({ message: 'Course updated successfully', course });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Course not found' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const activeBatch = await Batch.findOne({ courseId: req.params.id });
    if (activeBatch)
      return res.status(400).json({ message: 'Cannot delete course with active batches' });

    await course.deleteOne();
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Course not found' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
