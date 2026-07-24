const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'offline', 'free'],
    required: true
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Partial unique index — only prevents duplicate ACTIVE enrollments for the same student+course.
// This allows a student to re-enroll after their previous enrollment is set to 'inactive'.
enrollmentSchema.index(
  { userId: 1, courseId: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

module.exports = mongoose.model('Enrollment', enrollmentSchema);
