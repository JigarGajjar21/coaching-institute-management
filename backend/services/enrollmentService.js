const Batch = require('../models/Batch');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');

/**
 * Auto-assigns a student to the least-full batch for a given course.
 *
 * @param {string|ObjectId} courseId - The course to find a batch for
 * @returns {Promise<Object>} The selected Batch document
 * @throws {'NO_BATCH'} If no batches exist for the course
 * @throws {'ALL_BATCHES_FULL'} If all batches are at capacity
 */
async function autoAssign(courseId) {
  const batches = await Batch.find({ courseId });

  if (!batches.length) {
    throw 'NO_BATCH';
  }

  // Count active enrollments per batch
  const counts = await Promise.all(
    batches.map(async (b) => ({
      batch: b,
      count: await Enrollment.countDocuments({ batchId: b._id, status: 'active' }),
    }))
  );

  // Filter out batches that have reached maxStudents capacity
  const available = counts.filter((c) => c.count < c.batch.maxStudents);

  if (!available.length) {
    throw 'ALL_BATCHES_FULL';
  }

  // Sort by count ascending, then by createdAt ascending as tiebreaker
  available.sort((a, b) => {
    if (a.count !== b.count) {
      return a.count - b.count;
    }
    return a.batch.createdAt - b.batch.createdAt;
  });

  return available[0].batch;
}

/**
 * Creates an Enrollment record and upserts a Student record.
 *
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} courseId
 * @param {Object} batch - The Batch document to enroll into
 * @param {string} paymentMethod - 'online' | 'offline' | 'free'
 * @param {string|null} razorpayOrderId
 * @param {string|null} razorpayPaymentId
 * @returns {Promise<Object>} The created Enrollment document
 */
async function createEnrollmentAndStudent(
  userId,
  courseId,
  batch,
  paymentMethod,
  razorpayOrderId = null,
  razorpayPaymentId = null
) {
  // Create the enrollment record
  const enrollment = await Enrollment.create({
    userId,
    courseId,
    batchId: batch._id,
    status: 'active',
    paymentMethod,
    razorpayOrderId,
    razorpayPaymentId,
  });

  // Upsert Student record — only create if the userId+batchId pair doesn't exist
  const existingStudent = await Student.findOne({ userId, batchId: batch._id });
  if (!existingStudent) {
    await Student.create({ userId, batchId: batch._id });
  }

  return enrollment;
}

module.exports = { autoAssign, createEnrollmentAndStudent };
