const User = require('../models/User');
const Caretaker = require('../models/Caretaker');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Feedback = require('../models/Feedback');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalCaretakers = await Caretaker.countDocuments();
    const verifiedCaretakers = await Caretaker.countDocuments({ isVerified: true });
    const pendingCaretakers = await Caretaker.countDocuments({ isVerified: false });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ 
      status: { $in: ['confirmed', 'in-progress'] } 
    });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    
    // Calculate total revenue
    const payments = await Payment.find({ status: 'completed' });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('caretaker', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCaretakers,
        verifiedCaretakers,
        pendingCaretakers,
        totalBookings,
        activeBookings,
        completedBookings,
        totalRevenue,
      },
      recentBookings,
    });
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = { role: 'user' };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      users,
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Get all caretakers (including unverified)
// @route   GET /api/admin/caretakers
// @access  Private (Admin only)
exports.getAllCaretakers = async (req, res) => {
  try {
    const { page = 1, limit = 10, isVerified, search } = req.query;

    const query = {};

    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const caretakers = await Caretaker.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Caretaker.countDocuments(query);

    res.json({
      success: true,
      count: caretakers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      caretakers,
    });
  } catch (err) {
    console.error('Get all caretakers error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Verify caretaker
// @route   POST /api/admin/caretakers/:id/verify
// @access  Private (Admin only)
exports.verifyCaretaker = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.params.id);

    if (!caretaker) {
      return res.status(404).json({
        success: false,
        message: 'Caretaker not found',
      });
    }

    if (caretaker.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Caretaker is already verified',
      });
    }

    caretaker.isVerified = true;
    caretaker.verifiedBy = req.user._id;
    caretaker.verifiedAt = new Date();
    await caretaker.save();

    res.json({
      success: true,
      message: 'Caretaker verified successfully',
      caretaker,
    });
  } catch (err) {
    console.error('Verify caretaker error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Unverify caretaker
// @route   POST /api/admin/caretakers/:id/unverify
// @access  Private (Admin only)
exports.unverifyCaretaker = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.params.id);

    if (!caretaker) {
      return res.status(404).json({
        success: false,
        message: 'Caretaker not found',
      });
    }

    caretaker.isVerified = false;
    caretaker.verifiedBy = null;
    caretaker.verifiedAt = null;
    await caretaker.save();

    res.json({
      success: true,
      message: 'Caretaker verification removed',
      caretaker,
    });
  } catch (err) {
    console.error('Unverify caretaker error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Deactivate user
// @route   POST /api/admin/users/:id/deactivate
// @access  Private (Admin only)
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate admin users',
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (err) {
    console.error('Deactivate user error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Activate user
// @route   POST /api/admin/users/:id/activate
// @access  Private (Admin only)
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'User activated successfully',
    });
  } catch (err) {
    console.error('Activate user error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Assign caretaker to booking
// @route   POST /api/admin/bookings/:id/assign
// @access  Private (Admin only)
exports.assignCaretaker = async (req, res) => {
  try {
    const { caretakerId } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const caretaker = await Caretaker.findById(caretakerId);

    if (!caretaker) {
      return res.status(404).json({
        success: false,
        message: 'Caretaker not found',
      });
    }

    if (!caretaker.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign unverified caretaker',
      });
    }

    // Update old caretaker availability if exists
    if (booking.caretaker) {
      const oldCaretaker = await Caretaker.findById(booking.caretaker);
      if (oldCaretaker) {
        oldCaretaker.availability = 'available';
        await oldCaretaker.save();
      }
    }

    booking.caretaker = caretakerId;
    booking.assignedBy = req.user._id;
    booking.status = 'confirmed';
    await booking.save();

    // Update new caretaker availability
    caretaker.availability = 'busy';
    await caretaker.save();

    await booking.populate('caretaker', 'name email phone specialization');
    await booking.populate('user', 'name email phone');

    res.json({
      success: true,
      message: 'Caretaker assigned successfully',
      booking,
    });
  } catch (err) {
    console.error('Assign caretaker error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private (Admin only)
exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('caretaker', 'name')
      .populate('booking')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      count: payments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      payments,
    });
  } catch (err) {
    console.error('Get all payments error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};
