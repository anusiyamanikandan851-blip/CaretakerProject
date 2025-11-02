const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { signup, signin, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};

// Routes
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').
      isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest,
  ],
  signup
);

router.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  signin
);

router.get('/profile', auth, getProfile);

module.exports = router;
