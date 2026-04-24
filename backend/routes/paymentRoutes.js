const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createOrder,
  verifyPayment,
  razorpayWebhook,
} = require('../controllers/paymentController');

// POST /api/payments/create-order — Student only
router.post('/create-order', protect, authorize('student'), createOrder);

// POST /api/payments/verify — Student only
router.post('/verify', protect, authorize('student'), verifyPayment);

// POST /api/payments/webhook — Public (no auth; raw body handled in index.js)
router.post('/webhook', razorpayWebhook);

module.exports = router;
