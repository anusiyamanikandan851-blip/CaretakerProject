const mongoose = require('mongoose');

// Admin is essentially a User with role='admin'
// This model can be used for admin-specific operations or extended functionality

const adminSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    permissions: [
      {
        type: String,
        enum: [
          'manage_users',
          'manage_caretakers',
          'manage_bookings',
          'manage_payments',
          'view_reports',
          'verify_caretakers',
        ],
      },
    ],
    department: {
      type: String,
      trim: true,
    },
    lastLogin: {
      type: Date,
    },
    loginHistory: [
      {
        timestamp: Date,
        ipAddress: String,
        userAgent: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Admin', adminSchema);
