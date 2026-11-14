const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Place slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: [true, 'State reference is required'],
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      default: null,
    },
    category: {
      type: String,
      enum: {
        values: ['Heritage', 'Nature', 'Adventure', 'Religious'],
        message: 'Category must be one of: Heritage, Nature, Adventure, Religious',
      },
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    historicalSignificance: {
      type: String,
      default: '',
      trim: true,
    },
    bestTimeToVisit: {
      type: String,
      default: '',
      trim: true,
    },
    entryFee: {
      type: String,
      default: 'Free',
      trim: true,
    },
    timings: {
      type: String,
      default: 'Open 24 Hours / Sunrise to Sunset',
      trim: true,
    },
    mapLink: {
      type: String,
      default: '',
      trim: true,
    },
    images: {
      type: [imageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for fast searching and filtering
placeSchema.index({ name: 'text', description: 'text', historicalSignificance: 'text' });
placeSchema.index({ category: 1 });
placeSchema.index({ state: 1 });
placeSchema.index({ city: 1 });

module.exports = mongoose.model('Place', placeSchema);
