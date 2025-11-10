const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { signup, signin, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

// ✅ Import your User model (this fixes your "User is not defined" error)
const User = require('../models/User');

// ✅ Validation middleware
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

// ✅ Signup route
router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    validateRequest,
  ],
  signup
);

// ✅ Signin route
router.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  signin
);

// ✅ Get profile (Protected)
router.get('/profile', auth, getProfile);

// ✅ Register route (used by frontend register form)
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Register Request Body:', {
      ...req.body,
      password: '[HIDDEN]',
    });

    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      console.log('❌ User already exists:', req.body.email);
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create new user
    const user = new User(req.body);
    await user.save();

    console.log('✅ User created successfully:', user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
});

module.exports = router;
