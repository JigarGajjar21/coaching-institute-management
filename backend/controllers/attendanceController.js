const Attendance = require('../models/Attendance');
const Schedule   = require('../models/Schedule');
const Batch      = require('../models/Batch');

// @desc    Mark attendance for a specific schedule
// @route   POST /api/attendance
// @access  Private/Faculty
exports.markAttendance = async (req, res) => {
  try {
    const { scheduleId, date, attendanceRecords } = req.body;

    if (!scheduleId || !date || !attendanceRecords || !Array.isArray(attendanceRecords))
      return res.status(400).json({ message: 'Please provide scheduleId, date, and a valid attendanceRecords array' });

    const schedule = await Schedule.findById(scheduleId).populate('batchId');
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const batch = schedule.batchId;
    if (!batch) return res.status(404).json({ message: 'Associated batch not found' });

    if (batch.facultyId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied: this schedule does not belong to your batch' });

    const bulkOps = attendanceRecords.map(record => ({
      updateOne: {
        filter: { scheduleId, studentId: record.studentId, date },
        update: { $set: { status: record.status } },
        upsert: true,
      },
    }));

    if (bulkOps.length) await Attendance.bulkWrite(bulkOps);

    res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get attendance history for logged-in student
// @route   GET /api/attendance/my-attendance
// @access  Private/Student
exports.getMyAttendance = async (req, res) => {
  try {
    const attendanceHistory = await Attendance.find({ studentId: req.user._id })
      .populate({
        path:     'scheduleId',
        select:   'subject day time batchId',
        populate: { path: 'batchId', select: 'name' },
      })
      .sort({ date: -1 });

    res.status(200).json(attendanceHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get attendance records for faculty's batches
// @route   GET /api/attendance/my-batch
// @access  Private/Faculty
exports.getBatchAttendance = async (req, res) => {
  try {
    const { studentId, subject } = req.query;

    const batches = await Batch.find({ facultyId: req.user._id }).select('_id');
    if (!batches.length) return res.status(200).json([]);

    const batchIds       = batches.map(b => b._id);
    const scheduleFilter = { batchId: { $in: batchIds } };
    if (subject) scheduleFilter.subject = { $regex: subject, $options: 'i' };

    const schedules    = await Schedule.find(scheduleFilter).select('_id');
    const scheduleIds  = schedules.map(s => s._id);
    if (!scheduleIds.length) return res.status(200).json([]);

    const filter = { scheduleId: { $in: scheduleIds } };
    if (studentId) filter.studentId = studentId;

    const records = await Attendance.find(filter)
      .populate('studentId', 'name email')
      .populate({ path: 'scheduleId', select: 'subject day time batchId', populate: { path: 'batchId', select: 'name' } })
      .sort({ date: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all attendance records with optional batch/student/subject filter
// @route   GET /api/attendance
// @access  Private/Admin
exports.getAllAttendance = async (req, res) => {
  try {
    const { batchId, studentId, subject } = req.query;

    let scheduleIds;
    if (batchId || subject) {
      const scheduleFilter = {};
      if (batchId) scheduleFilter.batchId = batchId;
      if (subject) scheduleFilter.subject = { $regex: subject, $options: 'i' };
      const schedules = await Schedule.find(scheduleFilter).select('_id');
      scheduleIds = schedules.map(s => s._id);
      if (!scheduleIds.length) return res.status(200).json([]);
    }

    const filter = {};
    if (scheduleIds) filter.scheduleId = { $in: scheduleIds };
    if (studentId)   filter.studentId  = studentId;

    const records = await Attendance.find(filter)
      .populate('studentId', 'name email')
      .populate({ path: 'scheduleId', select: 'subject day time batchId', populate: { path: 'batchId', select: 'name' } })
      .sort({ date: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get attendance for a specific schedule on a specific date
// @route   GET /api/attendance/schedule/:scheduleId?date=YYYY-MM-DD
// @access  Private/Admin
exports.getScheduleAttendance = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { date }       = req.query;

    if (!scheduleId || !date)
      return res.status(400).json({ message: 'Please provide scheduleId and date query param' });

    const records = await Attendance.find({ scheduleId, date })
      .populate('studentId', 'email role')
      .populate('scheduleId', 'day time subject');

    if (!records.length)
      return res.status(404).json({ message: 'No attendance records found for this schedule on the given date' });

    const summary = {
      total:   records.length,
      present: records.filter(r => r.status === 'Present').length,
      absent:  records.filter(r => r.status === 'Absent').length,
    };

    res.status(200).json({ summary, date, records });
  } catch (error) {
    if (error.kind === 'ObjectId')
      return res.status(400).json({ message: 'Invalid Schedule ID format' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
