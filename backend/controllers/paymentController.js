const crypto     = require('crypto');
const Razorpay   = require('razorpay');
const Course     = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { autoAssign, createEnrollmentAndStudent } = require('../services/enrollmentService');

// @desc    Create a Razorpay order for a course
// @route   POST /api/payments/create-order
// @access  Private/Student
exports.createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Fetch course
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Check for existing active enrollment
    const existing = await Enrollment.findOne({ userId: req.user._id, courseId, status: 'active' });
    if (existing) return res.status(409).json({ message: 'Already enrolled in this course' });

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create order (amount in paise)
    const order = await razorpay.orders.create({
      amount:   course.price * 100,
      currency: 'INR',
      receipt:  'receipt_' + Date.now(),
    });

    res.status(200).json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      key:      process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify Razorpay payment and create enrollment
// @route   POST /api/payments/verify
// @access  Private/Student
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    // Compute expected HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

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
      'online',
      razorpay_order_id,
      razorpay_payment_id
    );

    res.status(201).json({ message: 'Payment verified and enrolled successfully', enrollment, batch });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Handle Razorpay webhook events
// @route   POST /api/payments/webhook
// @access  Public (raw body required for signature verification)
exports.razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature using raw body
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    // Parse the raw body
    const event = JSON.parse(req.body.toString());

    // Only handle payment.captured events
    if (event.event !== 'payment.captured') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const paymentEntity  = event.payload.payment.entity;
    const razorpayOrderId = paymentEntity.order_id;
    const courseId        = paymentEntity.notes && paymentEntity.notes.courseId;
    const userId          = paymentEntity.notes && paymentEntity.notes.userId;

    // Idempotency check — skip if enrollment already exists for this order
    const existing = await Enrollment.findOne({ razorpayOrderId });
    if (existing) {
      return res.status(200).json({ message: 'Enrollment already exists' });
    }

    // Auto-assign to a batch
    let batch;
    try {
      batch = await autoAssign(courseId);
    } catch (err) {
      // Log but still return 200 to acknowledge receipt to Razorpay
      console.error('Webhook autoAssign error:', err);
      return res.status(200).json({ message: 'Webhook received but batch assignment failed', error: err });
    }

    await createEnrollmentAndStudent(
      userId,
      courseId,
      batch,
      'online',
      razorpayOrderId,
      paymentEntity.id
    );

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
