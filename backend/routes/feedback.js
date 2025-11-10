const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  submitFeedback,
  getCaretakerFeedback,
  getMyFeedbacks,
  updateFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');
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

// @route   POST /api/feedback
// @desc    Submit feedback for a booking
// @access  Private
router.post(
  '/',
  [
    auth,
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
    validateRequest,
  ],
  submitFeedback
);

// @route   GET /api/feedback/caretaker/:caretakerId
// @desc    Get feedback for a caretaker
// @access  Public
router.get('/caretaker/:caretakerId', getCaretakerFeedback);

// @route   GET /api/feedback/my
// @desc    Get user's submitted feedbacks
// @access  Private
router.get('/my', auth, getMyFeedbacks);

// @route   PUT /api/feedback/:id
// @desc    Update feedback
// @access  Private
router.put(
  '/:id',
  [
    auth,
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
    validateRequest,
  ],
  updateFeedback
);

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback
// @access  Private
router.delete('/:id', auth, deleteFeedback);

module.exports = router;
