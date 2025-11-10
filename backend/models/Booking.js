const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
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
    serviceType: {
      type: String,
      enum: ['child', 'elderly'],
      required: [true, 'Service type is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    duration: {
      type: Number, // in hours
      required: true,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    specialRequirements: {
      type: String,
      trim: true,
      maxlength: [500, 'Special requirements cannot exceed 500 characters'],
    },
    patientDetails: {
      name: String,
      age: Number,
      gender: String,
      medicalConditions: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Validate end date is after start date
bookingSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Index for queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ caretaker: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
