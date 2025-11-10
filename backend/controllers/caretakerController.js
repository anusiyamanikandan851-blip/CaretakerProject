const Caretaker = require('../models/Caretaker');
const Feedback = require('../models/Feedback');

// @desc    Get all caretakers with filters
// @route   GET /api/caretakers
// @access  Public
exports.getAllCaretakers = async (req, res) => {
  try {
    const {
      specialization,
      availability,
      minRating,
      city,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (specialization) {
      query.specialization = specialization;
    }

    if (availability) {
      query.availability = availability;
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
      ];
    }

    // Only show verified caretakers to public
    query.isVerified = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const caretakers = await Caretaker.find(query)
      .select('-documents')
      .sort({ rating: -1, createdAt: -1 })
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
    console.error('Get caretakers error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Get single caretaker by ID
// @route   GET /api/caretakers/:id
// @access  Public
exports.getCaretakerById = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.params.id).select('-documents');

    if (!caretaker) {
      return res.status(404).json({
        success: false,
        message: 'Caretaker not found',
      });
    }

    // Get feedback for this caretaker
    const feedbacks = await Feedback.find({
      caretaker: req.params.id,
      isVisible: true,
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      caretaker,
      feedbacks,
    });
  } catch (err) {
    console.error('Get caretaker error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Create new caretaker
// @route   POST /api/caretakers
// @access  Private (Admin only)
exports.createCaretaker = async (req, res) => {
  try {
    const caretakerData = req.body;

    // Check if email already exists
    const existingCaretaker = await Caretaker.findOne({ email: caretakerData.email });
    if (existingCaretaker) {
      return res.status(400).json({
        success: false,
        message: 'Caretaker with this email already exists',
      });
    }

    const caretaker = await Caretaker.create(caretakerData);

    res.status(201).json({
      success: true,
      message: 'Caretaker created successfully',
      caretaker,
    });
  } catch (err) {
    console.error('Create caretaker error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Update caretaker
// @route   PUT /api/caretakers/:id
// @access  Private (Admin only)
exports.updateCaretaker = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.params.id);

    if (!caretaker) {
      return res.status(404).json({
        success: false,
        message: 'Caretaker not found',
      });
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        caretaker[key] = req.body[key];
      }
    });

    await caretaker.save();

    res.json({
      success: true,
      message: 'Caretaker updated successfully',
      caretaker,
    });
  } catch (err) {
    console.error('Update caretaker error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Update caretaker availability
// @route   PATCH /api/caretakers/:id/availability
// @access  Private (Admin only)
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!['available', 'busy', 'unavailable'].includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status',
      });
    }

    const caretaker = await Caretaker.findById(req.params.id);

    if (!caretaker) {
      return res.status(404).json({
        success: false,
        message: 'Caretaker not found',
      });
    }

    caretaker.availability = availability;
    await caretaker.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      caretaker,
    });
  } catch (err) {
    console.error('Update availability error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Delete caretaker
// @route   DELETE /api/caretakers/:id
// @access  Private (Admin only)
exports.deleteCaretaker = async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.params.id);

    if (!caretaker) {
      return res.status(404).json({
        success: false,
        message: 'Caretaker not found',
      });
    }

    // Soft delete - just deactivate
    caretaker.isActive = false;
    await caretaker.save();

    res.json({
      success: true,
      message: 'Caretaker deactivated successfully',
    });
  } catch (err) {
    console.error('Delete caretaker error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// @desc    Get available caretakers
// @route   GET /api/caretakers/available
// @access  Public
exports.getAvailableCaretakers = async (req, res) => {
  try {
    const { specialization } = req.query;

    const query = {
      isActive: true,
      isVerified: true,
      availability: 'available',
    };

    if (specialization) {
      query.specialization = specialization;
    }

    const caretakers = await Caretaker.find(query)
      .select('-documents')
      .sort({ rating: -1 });

    res.json({
      success: true,
      count: caretakers.length,
      caretakers,
    });
  } catch (err) {
    console.error('Get available caretakers error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};
