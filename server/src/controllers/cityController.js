const City = require('../models/City');
const State = require('../models/State');
const Place = require('../models/Place');

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-');

// @desc    Get cities (optionally filtered by state)
// @route   GET /api/cities
// @access  Public
const getCities = async (req, res, next) => {
  try {
    const { stateId, stateSlug, search } = req.query;
    const filter = {};

    if (stateId) {
      filter.state = stateId;
    } else if (stateSlug) {
      const stateObj = await State.findOne({ slug: stateSlug.toLowerCase() });
      if (stateObj) {
        filter.state = stateObj._id;
      } else {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const cities = await City.find(filter)
      .populate('state', 'name slug type')
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new city
// @route   POST /api/admin/cities
// @access  Admin
const createCity = async (req, res, next) => {
  try {
    const { name, state: stateId, description } = req.body;

    if (!name || !stateId) {
      return res.status(400).json({
        success: false,
        message: 'City name and state ID are required',
      });
    }

    const stateExists = await State.findById(stateId);
    if (!stateExists) {
      return res.status(404).json({
        success: false,
        message: 'Associated State not found',
      });
    }

    const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);

    const existing = await City.findOne({ slug, state: stateId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `City with slug "${slug}" already exists in ${stateExists.name}`,
      });
    }

    const city = await City.create({
      name,
      slug,
      state: stateId,
      description: description || '',
    });

    const populatedCity = await City.findById(city._id).populate('state', 'name slug');

    res.status(201).json({
      success: true,
      data: populatedCity,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update city
// @route   PUT /api/admin/cities/:id
// @access  Admin
const updateCity = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (updateData.name && !updateData.slug) {
      updateData.slug = slugify(updateData.name);
    } else if (updateData.slug) {
      updateData.slug = slugify(updateData.slug);
    }

    const city = await City.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('state', 'name slug');

    if (!city) {
      return res.status(404).json({
        success: false,
        message: `City not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: city,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete city
// @route   DELETE /api/admin/cities/:id
// @access  Admin
const deleteCity = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id);

    if (!city) {
      return res.status(404).json({
        success: false,
        message: `City not found with id ${req.params.id}`,
      });
    }

    // Check if places reference this city
    const placesCount = await Place.countDocuments({ city: city._id });
    if (placesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete city "${city.name}". It is associated with ${placesCount} places. Please reassign or delete those places first.`,
      });
    }

    await city.deleteOne();

    res.status(200).json({
      success: true,
      message: `City "${city.name}" deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCities,
  createCity,
  updateCity,
  deleteCity,
};
