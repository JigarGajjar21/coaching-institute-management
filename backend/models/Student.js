const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  }
}, { timestamps: true });

// A student can be in many batches, but only once per batch
studentSchema.index({ userId: 1, batchId: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);
