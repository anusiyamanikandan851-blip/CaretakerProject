const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Create payment for booking
// @route   POST /api/payments
// @access  Private
exports.createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, paymentDetails } = req.body;

    // Validate booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this booking',
      });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this booking',
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ booking: bookingId });
    
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this booking',
      });
    }

    // Create payment
    const payment = await Payment.create({
      user: req.user._id,
      booking: bookingId,
      caretaker: booking.caretaker,
      amount: booking.totalAmount,
      paymentMethod,
      paymentDetails,
      status: 'pending',
      paymentGateway: 'manual', // Can be updated for actual gateway integration
    });

    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully',
      payment,
    });
  } catch (err) {
    console.error('Create payment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Process payment (simulate payment completion)
// @route   POST /api/payments/:id/process
// @access  Private
exports.processPayment = async (req, res) => {
  try {
    const { gatewayPaymentId, gatewaySignature } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process this payment',
      });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed',
      });
    }

    // Simulate payment processing
    // In production, verify with actual payment gateway
    payment.status = 'completed';
    payment.gatewayPaymentId = gatewayPaymentId || `PAY${Date.now()}`;
    payment.gatewaySignature = gatewaySignature;
    payment.paidAt = new Date();

    await payment.save();

    // Update booking payment status
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment,
    });
  } catch (err) {
    console.error('Process payment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('caretaker', 'name')
      .populate('booking');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Check authorization
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment',
      });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (err) {
    console.error('Get payment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/my/history
// @access  Private
exports.getMyPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find({ user: req.user._id })
      .populate('caretaker', 'name specialization')
      .populate('booking', 'serviceType startDate endDate status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments({ user: req.user._id });

    // Calculate total spent
    const completedPayments = await Payment.find({
      user: req.user._id,
      status: 'completed',
    });
    const totalSpent = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      count: payments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      totalSpent,
      payments,
    });
  } catch (err) {
    console.error('Get my payments error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Refund payment
// @route   POST /api/payments/:id/refund
// @access  Private (Admin only)
exports.refundPayment = async (req, res) => {
  try {
    const { refundAmount, refundReason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed payments',
      });
    }

    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Payment already refunded',
      });
    }

    const refundAmt = refundAmount || payment.amount;

    if (refundAmt > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed payment amount',
      });
    }

    payment.status = 'refunded';
    payment.refundAmount = refundAmt;
    payment.refundedAt = new Date();
    payment.refundReason = refundReason;

    await payment.save();

    // Update booking payment status
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'refunded';
      await booking.save();
    }

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      payment,
    });
  } catch (err) {
    console.error('Refund payment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Get payment for a booking
// @route   GET /api/payments/booking/:bookingId
// @access  Private
exports.getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId })
      .populate('user', 'name email')
      .populate('caretaker', 'name')
      .populate('booking');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this booking',
      });
    }

    // Check authorization
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment',
      });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (err) {
    console.error('Get payment by booking error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

module.exports = exports;
