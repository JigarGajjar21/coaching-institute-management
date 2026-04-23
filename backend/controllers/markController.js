const Mark = require('../models/Mark');
const Test = require('../models/Test');

// @desc    Record or update marks for a specific test
// @route   POST /api/marks
// @access  Private/Faculty
exports.recordMarks = async (req, res) => {
  try {
    const { testId, marksRecords } = req.body;

    if (!testId || !marksRecords || !Array.isArray(marksRecords))
      return res.status(400).json({ message: 'Please provide testId and a valid marksRecords array' });

    const test = await Test.findById(testId).populate('batchId');
    if (!test)           return res.status(404).json({ message: 'Test not found' });
    if (!test.batchId)   return res.status(404).json({ message: 'Associated batch not found' });

    for (const record of marksRecords) {
      if (record.marksObtained < 0 || record.marksObtained > test.maxMarks)
        return res.status(400).json({
          message: `Marks for student ${record.studentId} must be between 0 and ${test.maxMarks}`,
        });
    }

    const bulkOps = marksRecords.map(record => ({
      updateOne: {
        filter: { testId, studentId: record.studentId },
        update: { $set: { marksObtained: record.marksObtained } },
        upsert: true,
      },
    }));

    if (bulkOps.length) await Mark.bulkWrite(bulkOps);

    res.status(200).json({ message: 'Marks recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all marks for logged-in student
// @route   GET /api/marks/my-marks
// @access  Private/Student
exports.getMyMarks = async (req, res) => {
  try {
    const marksHistory = await Mark.find({ studentId: req.user._id })
      .populate({
        path:     'testId',
        select:   'subject date maxMarks batchId',
        populate: { path: 'batchId', select: 'name' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(marksHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all student marks for a specific test
// @route   GET /api/marks/test/:testId
// @access  Private/Faculty or Admin
exports.getTestMarks = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId).populate('batchId', 'name facultyId');
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const marks = await Mark.find({ testId: req.params.testId })
      .populate('studentId', 'name email')
      .sort({ marksObtained: -1 });

    res.status(200).json({
      testInfo: {
        subject:   test.subject,
        date:      test.date,
        maxMarks:  test.maxMarks,
        batchName: test.batchId.name,
      },
      marks,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid Test ID format' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all marks with optional batch/student/test filter
// @route   GET /api/marks
// @access  Private/Admin
exports.getAllMarks = async (req, res) => {
  try {
    const { batchId, studentId, testId } = req.query;
    const filter = {};

    if (testId) {
      filter.testId = testId;
    } else if (batchId) {
      const tests   = await Test.find({ batchId }).select('_id');
      const testIds = tests.map(t => t._id);
      if (!testIds.length) return res.status(200).json([]);
      filter.testId = { $in: testIds };
    }

    if (studentId) filter.studentId = studentId;

    const marks = await Mark.find(filter)
      .populate('studentId', 'name email')
      .populate({ path: 'testId', select: 'subject date maxMarks batchId', populate: { path: 'batchId', select: 'name' } })
      .sort({ createdAt: -1 });

    res.status(200).json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
