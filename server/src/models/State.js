const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'State name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: {
        values: ['State', 'Union Territory'],
        message: 'Type must be either "State" or "Union Territory"',
      },
      required: [true, 'Type is required'],
    },
    capital: {
      type: String,
      required: [true, 'Capital is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    heroImage: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for places in this state
stateSchema.virtual('places', {
  ref: 'Place',
  localField: '_id',
  foreignField: 'state',
});

// Virtual for cities in this state
stateSchema.virtual('cities', {
  ref: 'City',
  localField: '_id',
  foreignField: 'state',
});

module.exports = mongoose.model('State', stateSchema);
