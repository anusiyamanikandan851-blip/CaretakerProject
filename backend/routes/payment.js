const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  createPayment,
  processPayment,
  getPaymentById,
  getMyPayments,
  refundPayment,
  getPaymentByBooking,
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

// @route   POST /api/payments
// @desc    Create payment for booking
// @access  Private
router.post(
  '/',
  [
    auth,
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('paymentMethod')
      .isIn(['card', 'upi', 'netbanking', 'wallet', 'cash'])
      .withMessage('Invalid payment method'),
    validateRequest,
  ],
  createPayment
);

// @route   POST /api/payments/:id/process
// @desc    Process payment (simulate payment completion)
// @access  Private
router.post('/:id/process', auth, processPayment);

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', auth, getPaymentById);

// @route   GET /api/payments/my/history
// @desc    Get user's payment history
// @access  Private
router.get('/my/history', auth, getMyPayments);

// @route   GET /api/payments/booking/:bookingId
// @desc    Get payment for a booking
// @access  Private
router.get('/booking/:bookingId', auth, getPaymentByBooking);

// @route   POST /api/payments/:id/refund
// @desc    Refund payment
// @access  Private (Admin only)
router.post(
  '/:id/refund',
  [
    auth,
    adminAuth,
    body('refundAmount').optional().isFloat({ min: 0 }),
    body('refundReason').optional().trim(),
    validateRequest,
  ],
  refundPayment
);

module.exports = router;
