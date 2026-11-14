const State = require('../models/State');
const City = require('../models/City');
const Place = require('../models/Place');

// Helper to make slug
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-');

// @desc    Get all states & UTs
// @route   GET /api/states
// @access  Public
const getStates = async (req, res, next) => {
  try {
    const { type, search, activeOnly } = req.query;
    const filter = {};

    if (type) {
      filter.type = type;
    }

    // Default to activeOnly=true unless explicitly false (e.g. For admin)
    if (activeOnly === 'false') {
      // return all
    } else {
      filter.isActive = true;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const states = await State.find(filter).sort({ name: 1 }).lean();

    // Attach count of places per state
    const placeCounts = await Place.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    placeCounts.forEach((pc) => {
      countMap[pc._id.toString()] = pc.count;
    });

    const statesWithCounts = states.map((s) => ({
      ...s,
      placesCount: countMap[s._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      count: statesWithCounts.length,
      data: statesWithCounts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single state by slug (with cities and places)
// @route   GET /api/states/:slug
// @access  Public
const getStateBySlug = async (req, res, next) => {
  try {
    const state = await State.findOne({ slug: req.params.slug.toLowerCase() });

    if (!state) {
      return res.status(404).json({
        success: false,
        message: `State/UT not found with slug ${req.params.slug}`,
      });
    }

    // Get cities and places for this state
    const [cities, places] = await Promise.all([
      City.find({ state: state._id }).sort({ name: 1 }).lean(),
      Place.find({ state: state._id }).populate('city', 'name slug').sort({ name: 1 }).lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...state.toObject(),
        cities,
        places,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new state
// @route   POST /api/admin/states
// @access  Admin
const createState = async (req, res, next) => {
  try {
    const { name, type, capital, description, heroImage, isActive } = req.body;

    if (!name || !type || !capital || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, type (State/Union Territory), capital, and description',
      });
    }

    const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);

    // Check slug collision
    const existing = await State.findOne({ $or: [{ name }, { slug }] });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `State with name "${name}" or slug "${slug}" already exists`,
      });
    }

    const state = await State.create({
      name,
      slug,
      type,
      capital,
      description,
      heroImage: heroImage || '',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      data: state,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update state
// @route   PUT /api/admin/states/:id
// @access  Admin
const updateState = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (updateData.name && !updateData.slug) {
      updateData.slug = slugify(updateData.name);
    } else if (updateData.slug) {
      updateData.slug = slugify(updateData.slug);
    }

    const state = await State.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!state) {
      return res.status(404).json({
        success: false,
        message: `State not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: state,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete state
// @route   DELETE /api/admin/states/:id
// @access  Admin
const deleteState = async (req, res, next) => {
  try {
    const state = await State.findById(req.params.id);

    if (!state) {
      return res.status(404).json({
        success: false,
        message: `State not found with id ${req.params.id}`,
      });
    }

    // Check if places or cities exist
    const [placesCount, citiesCount] = await Promise.all([
      Place.countDocuments({ state: state._id }),
      City.countDocuments({ state: state._id }),
    ]);

    if (placesCount > 0 || citiesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete "${state.name}". It still has ${citiesCount} cities and ${placesCount} places associated with it. Please remove or reassign them first.`,
      });
    }

    await state.deleteOne();

    res.status(200).json({
      success: true,
      message: `State "${state.name}" deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStates,
  getStateBySlug,
  createState,
  updateState,
  deleteState,
};
