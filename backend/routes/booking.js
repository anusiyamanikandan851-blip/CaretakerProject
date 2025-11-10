const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getMyBookings,
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');

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

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post(
  '/',
  [
    auth,
    body('caretakerId').notEmpty().withMessage('Caretaker ID is required'),
    body('serviceType')
      .isIn(['child', 'elderly'])
      .withMessage('Service type must be child or elderly'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Duration must be at least 1 hour'),
    validateRequest,
  ],
  createBooking
);

// @route   GET /api/bookings
// @desc    Get all bookings (admin sees all, users see their own)
// @access  Private
router.get('/', auth, getAllBookings);

// @route   GET /api/bookings/my/history
// @desc    Get user's booking history
// @access  Private
router.get('/my/history', auth, getMyBookings);

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID
// @access  Private
router.get('/:id', auth, getBookingById);

// @route   PATCH /api/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.patch(
  '/:id/status',
  [
    auth,
    body('status')
      .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    validateRequest,
  ],
  updateBookingStatus
);

// @route   POST /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.post(
  '/:id/cancel',
  [
    auth,
    body('reason').optional().trim(),
    validateRequest,
  ],
  cancelBooking
);

module.exports = router;
