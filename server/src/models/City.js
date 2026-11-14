const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'City slug is required'],
      trim: true,
      lowercase: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: [true, 'State reference is required'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

citySchema.index({ slug: 1, state: 1 }, { unique: true });

citySchema.virtual('places', {
  ref: 'Place',
  localField: '_id',
  foreignField: 'city',
});

module.exports = mongoose.model('City', citySchema);
