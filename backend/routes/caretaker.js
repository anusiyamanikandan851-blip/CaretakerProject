const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  getAllCaretakers,
  getCaretakerById,
  createCaretaker,
  updateCaretaker,
  updateAvailability,
  deleteCaretaker,
  getAvailableCaretakers,
} = require('../controllers/caretakerController');
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

// @route   GET /api/caretakers
// @desc    Get all caretakers with filters
// @access  Public
router.get('/', getAllCaretakers);

// @route   GET /api/caretakers/available
// @desc    Get available caretakers
// @access  Public
router.get('/available', getAvailableCaretakers);

// @route   GET /api/caretakers/:id
// @desc    Get single caretaker by ID
// @access  Public
router.get('/:id', getCaretakerById);

// @route   POST /api/caretakers
// @desc    Create new caretaker
// @access  Private (Admin only)
router.post(
  '/',
  [
    auth,
    adminAuth,
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('age')
      .isInt({ min: 18, max: 70 })
      .withMessage('Age must be between 18 and 70'),
    body('gender')
      .isIn(['male', 'female', 'other'])
      .withMessage('Gender must be male, female, or other'),
    body('specialization')
      .isIn(['child', 'elderly', 'both'])
      .withMessage('Specialization must be child, elderly, or both'),
    body('experience')
      .isInt({ min: 0 })
      .withMessage('Experience must be a positive number'),
    body('hourlyRate')
      .isFloat({ min: 0 })
      .withMessage('Hourly rate must be a positive number'),
    validateRequest,
  ],
  createCaretaker
);

// @route   PUT /api/caretakers/:id
// @desc    Update caretaker
// @access  Private (Admin only)
router.put('/:id', auth, adminAuth, updateCaretaker);

// @route   PATCH /api/caretakers/:id/availability
// @desc    Update caretaker availability
// @access  Private (Admin only)
router.patch(
  '/:id/availability',
  [
    auth,
    adminAuth,
    body('availability')
      .isIn(['available', 'busy', 'unavailable'])
      .withMessage('Invalid availability status'),
    validateRequest,
  ],
  updateAvailability
);

// @route   DELETE /api/caretakers/:id
// @desc    Delete (deactivate) caretaker
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, deleteCaretaker);

module.exports = router;
