const mongoose = require('mongoose');

const caretakerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Caretaker must be at least 18 years old'],
      max: [70, 'Age must be less than 70'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' },
    },
    specialization: {
      type: String,
      enum: ['child', 'elderly', 'both'],
      required: [true, 'Specialization is required'],
    },
    experience: {
      type: Number,
      required: [true, 'Experience is required'],
      min: [0, 'Experience cannot be negative'],
    },
    qualifications: {
      type: String,
      trim: true,
    },
    certifications: [
      {
        name: String,
        issuedBy: String,
        year: Number,
      },
    ],
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    availability: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available',
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [0, 'Rate cannot be negative'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    profileImage: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    documents: [
      {
        type: String,
        documentUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for searching
caretakerSchema.index({ name: 'text', specialization: 1, availability: 1 });

// Method to calculate average rating
caretakerSchema.methods.updateRating = async function (newRating) {
  const totalRating = this.rating * this.totalReviews + newRating;
  this.totalReviews += 1;
  this.rating = totalRating / this.totalReviews;
  await this.save();
};

module.exports = mongoose.model('Caretaker', caretakerSchema);
