const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  getDashboardStats,
  getAllUsers,
  getAllCaretakers,
  verifyCaretaker,
  unverifyCaretaker,
  deactivateUser,
  activateUser,
  assignCaretaker,
  getAllPayments,
} = require('../controllers/adminController');
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

// All routes require authentication and admin privileges
router.use(auth);
router.use(adminAuth);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', getDashboardStats);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', getAllUsers);

// @route   POST /api/admin/users/:id/deactivate
// @desc    Deactivate user
// @access  Private (Admin only)
router.post('/users/:id/deactivate', deactivateUser);

// @route   POST /api/admin/users/:id/activate
// @desc    Activate user
// @access  Private (Admin only)
router.post('/users/:id/activate', activateUser);

// @route   GET /api/admin/caretakers
// @desc    Get all caretakers (including unverified)
// @access  Private (Admin only)
router.get('/caretakers', getAllCaretakers);

// @route   POST /api/admin/caretakers/:id/verify
// @desc    Verify caretaker
// @access  Private (Admin only)
router.post('/caretakers/:id/verify', verifyCaretaker);

// @route   POST /api/admin/caretakers/:id/unverify
// @desc    Unverify caretaker
// @access  Private (Admin only)
router.post('/caretakers/:id/unverify', unverifyCaretaker);

// @route   POST /api/admin/bookings/:id/assign
// @desc    Assign caretaker to booking
// @access  Private (Admin only)
router.post(
  '/bookings/:id/assign',
  [
    body('caretakerId').notEmpty().withMessage('Caretaker ID is required'),
    validateRequest,
  ],
  assignCaretaker
);

// @route   GET /api/admin/payments
// @desc    Get all payments
// @access  Private (Admin only)
router.get('/payments', getAllPayments);

module.exports = router;
