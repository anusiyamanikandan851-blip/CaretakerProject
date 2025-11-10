const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    caretaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Caretaker',
      required: [true, 'Caretaker is required'],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    categories: {
      professionalism: {
        type: Number,
        min: 1,
        max: 5,
      },
      punctuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      careQuality: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    response: {
      comment: String,
      respondedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one feedback per booking
feedbackSchema.index({ booking: 1 }, { unique: true });

// Index for caretaker feedback queries
feedbackSchema.index({ caretaker: 1, isVisible: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
