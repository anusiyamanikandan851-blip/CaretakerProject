const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');
const Caretaker = require('../models/Caretaker');

// @desc    Submit feedback for a booking
// @route   POST /api/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const { bookingId, rating, comment, categories } = req.body;

    // Validate booking exists and belongs to user
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
        message: 'Not authorized to submit feedback for this booking',
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only submit feedback for completed bookings',
      });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ booking: bookingId });
    
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted for this booking',
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      user: req.user._id,
      caretaker: booking.caretaker,
      booking: bookingId,
      rating,
      comment,
      categories,
    });

    // Update caretaker rating
    const caretaker = await Caretaker.findById(booking.caretaker);
    if (caretaker) {
      await caretaker.updateRating(rating);
    }

    await feedback.populate('user', 'name');
    await feedback.populate('caretaker', 'name');

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback,
    });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Get feedback for a caretaker
// @route   GET /api/feedback/caretaker/:caretakerId
// @access  Public
exports.getCaretakerFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find({
      caretaker: req.params.caretakerId,
      isVisible: true,
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments({
      caretaker: req.params.caretakerId,
      isVisible: true,
    });

    // Calculate average ratings
    const allFeedbacks = await Feedback.find({
      caretaker: req.params.caretakerId,
      isVisible: true,
    });

    const avgRating = allFeedbacks.length > 0
      ? allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length
      : 0;

    const avgCategories = {
      professionalism: 0,
      punctuality: 0,
      communication: 0,
      careQuality: 0,
    };

    if (allFeedbacks.length > 0) {
      allFeedbacks.forEach((f) => {
        if (f.categories) {
          avgCategories.professionalism += f.categories.professionalism || 0;
          avgCategories.punctuality += f.categories.punctuality || 0;
          avgCategories.communication += f.categories.communication || 0;
          avgCategories.careQuality += f.categories.careQuality || 0;
        }
      });

      Object.keys(avgCategories).forEach((key) => {
        avgCategories[key] = avgCategories[key] / allFeedbacks.length;
      });
    }

    res.json({
      success: true,
      count: feedbacks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      avgRating: avgRating.toFixed(1),
      avgCategories,
      feedbacks,
    });
  } catch (err) {
    console.error('Get caretaker feedback error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Get user's submitted feedbacks
// @route   GET /api/feedback/my
// @access  Private
exports.getMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id })
      .populate('caretaker', 'name specialization')
      .populate('booking')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (err) {
    console.error('Get my feedbacks error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private
exports.updateFeedback = async (req, res) => {
  try {
    const { rating, comment, categories } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    if (feedback.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this feedback',
      });
    }

    // Update fields
    if (rating) feedback.rating = rating;
    if (comment !== undefined) feedback.comment = comment;
    if (categories) feedback.categories = categories;

    await feedback.save();

    // Recalculate caretaker rating
    const caretaker = await Caretaker.findById(feedback.caretaker);
    if (caretaker) {
      const allFeedbacks = await Feedback.find({ caretaker: caretaker._id });
      const avgRating = allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length;
      caretaker.rating = avgRating;
      caretaker.totalReviews = allFeedbacks.length;
      await caretaker.save();
    }

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback,
    });
  } catch (err) {
    console.error('Update feedback error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    if (feedback.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this feedback',
      });
    }

    await feedback.deleteOne();

    // Recalculate caretaker rating
    const caretaker = await Caretaker.findById(feedback.caretaker);
    if (caretaker) {
      const allFeedbacks = await Feedback.find({ caretaker: caretaker._id });
      if (allFeedbacks.length > 0) {
        const avgRating = allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length;
        caretaker.rating = avgRating;
        caretaker.totalReviews = allFeedbacks.length;
      } else {
        caretaker.rating = 0;
        caretaker.totalReviews = 0;
      }
      await caretaker.save();
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (err) {
    console.error('Delete feedback error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

module.exports = exports;
