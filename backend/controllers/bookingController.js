const Booking = require('../models/Booking');
const Caretaker = require('../models/Caretaker');
const Payment = require('../models/Payment');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const {
      caretakerId,
      serviceType,
      startDate,
      endDate,
      duration,
      specialRequirements,
      patientDetails,
      address,
    } = req.body;

    // Validate caretaker exists and is available
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
        message: 'Caretaker is not verified',
      });
    }

    if (caretaker.availability !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Caretaker is not available',
      });
    }

    // Calculate total amount
    const totalAmount = duration * caretaker.hourlyRate;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      caretaker: caretakerId,
      serviceType,
      startDate,
      endDate,
      duration,
      totalAmount,
      specialRequirements,
      patientDetails,
      address,
      assignedBy: req.user._id,
    });

    // Update caretaker availability
    caretaker.availability = 'busy';
    await caretaker.save();

    // Populate booking details
    await booking.populate('caretaker', 'name email phone specialization hourlyRate');
    await booking.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Get all bookings (with filters)
// @route   GET /api/bookings
// @access  Private
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};

    // If user is not admin, only show their bookings
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('caretaker', 'name email phone specialization hourlyRate rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      bookings,
    });
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('caretaker', 'name email phone specialization hourlyRate rating bio')
      .populate('assignedBy', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    // Get payment info if exists
    const payment = await Payment.findOne({ booking: booking._id });

    res.json({
      success: true,
      booking,
      payment,
    });
  } catch (err) {
    console.error('Get booking error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Admin or booking owner)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking',
      });
    }

    booking.status = status;

    // Update timestamps
    if (status === 'completed') {
      booking.completedAt = new Date();
      
      // Update caretaker availability
      const caretaker = await Caretaker.findById(booking.caretaker);
      if (caretaker) {
        caretaker.availability = 'available';
        await caretaker.save();
      }
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking,
    });
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status} booking`,
      });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = req.user._id;
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();

    await booking.save();

    // Update caretaker availability
    const caretaker = await Caretaker.findById(booking.caretaker);
    if (caretaker && caretaker.availability === 'busy') {
      caretaker.availability = 'available';
      await caretaker.save();
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Get user's booking history
// @route   GET /api/bookings/my/history
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('caretaker', 'name email phone specialization rating')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (err) {
    console.error('Get my bookings error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};
