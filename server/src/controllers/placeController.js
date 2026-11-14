const Place = require('../models/Place');
const State = require('../models/State');
const City = require('../models/City');

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-');

// @desc    Get all places with filters & search
// @route   GET /api/places
// @access  Public
const getPlaces = async (req, res, next) => {
  try {
    const { q, state, city, category, sort, limit = 100, page = 1 } = req.query;
    const filter = {};

    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // State filter (can be slug or ObjectId)
    if (state && state !== 'All') {
      if (state.match(/^[0-9a-fA-F]{24}$/)) {
        filter.state = state;
      } else {
        const stateObj = await State.findOne({ slug: state.toLowerCase() });
        if (stateObj) {
          filter.state = stateObj._id;
        } else {
          return res.status(200).json({ success: true, count: 0, total: 0, data: [] });
        }
      }
    }

    // City filter (can be slug or ObjectId)
    if (city && city !== 'All') {
      if (city.match(/^[0-9a-fA-F]{24}$/)) {
        filter.city = city;
      } else {
        const cityObj = await City.findOne({ slug: city.toLowerCase() });
        if (cityObj) {
          filter.city = cityObj._id;
        }
      }
    }

    // Search query (name, description, historicalSignificance)
    if (q && q.trim()) {
      const searchRegex = { $regex: q.trim(), $options: 'i' };
      
      // If state is not already filtered, also match states with matching name
      const matchingStates = await State.find({ name: searchRegex }).select('_id');
      const stateIds = matchingStates.map((s) => s._id);

      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { historicalSignificance: searchRegex },
        { bestTimeToVisit: searchRegex },
        { state: { $in: stateIds } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOption = { name: 1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'category') sortOption = { category: 1, name: 1 };

    const total = await Place.countDocuments(filter);
    const places = await Place.find(filter)
      .populate('state', 'name slug type heroImage')
      .populate('city', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: places.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: places,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single place by slug
// @route   GET /api/places/:slug
// @access  Public
const getPlaceBySlug = async (req, res, next) => {
  try {
    const place = await Place.findOne({ slug: req.params.slug.toLowerCase() })
      .populate('state', 'name slug type capital heroImage')
      .populate('city', 'name slug description');

    if (!place) {
      return res.status(404).json({
        success: false,
        message: `Place not found with slug ${req.params.slug}`,
      });
    }

    // Fetch related places in the same state or category
    const relatedPlaces = await Place.find({
      _id: { $ne: place._id },
      $or: [{ state: place.state?._id }, { category: place.category }],
    })
      .populate('state', 'name slug')
      .limit(4)
      .lean();

    res.status(200).json({
      success: true,
      data: place,
      relatedPlaces,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new place
// @route   POST /api/admin/places
// @access  Admin
const createPlace = async (req, res, next) => {
  try {
    const {
      name,
      state: stateId,
      city: cityId,
      category,
      description,
      historicalSignificance,
      bestTimeToVisit,
      entryFee,
      timings,
      mapLink,
      images,
    } = req.body;

    if (!name || !stateId || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name, state, category, and description are required',
      });
    }

    // Check state existence
    const stateObj = await State.findById(stateId);
    if (!stateObj) {
      return res.status(404).json({
        success: false,
        message: 'Associated State not found',
      });
    }

    const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);

    const existing = await Place.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Place with slug "${slug}" already exists`,
      });
    }

    // Ensure at least one primary image if images provided
    let formattedImages = Array.isArray(images) ? [...images] : [];
    if (formattedImages.length > 0) {
      const hasPrimary = formattedImages.some((img) => img.isPrimary);
      if (!hasPrimary) {
        formattedImages[0].isPrimary = true;
      }
    }

    const place = await Place.create({
      name,
      slug,
      state: stateId,
      city: cityId || null,
      category,
      description,
      historicalSignificance: historicalSignificance || '',
      bestTimeToVisit: bestTimeToVisit || '',
      entryFee: entryFee || 'Free',
      timings: timings || 'Open 24 Hours',
      mapLink: mapLink || '',
      images: formattedImages,
    });

    const populatedPlace = await Place.findById(place._id)
      .populate('state', 'name slug')
      .populate('city', 'name slug');

    res.status(201).json({
      success: true,
      data: populatedPlace,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update place
// @route   PUT /api/admin/places/:id
// @access  Admin
const updatePlace = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (updateData.name && !updateData.slug) {
      updateData.slug = slugify(updateData.name);
    } else if (updateData.slug) {
      updateData.slug = slugify(updateData.slug);
    }

    // If city is empty string, convert to null
    if (updateData.city === '' || updateData.city === 'null') {
      updateData.city = null;
    }

    if (Array.isArray(updateData.images) && updateData.images.length > 0) {
      const hasPrimary = updateData.images.some((img) => img.isPrimary);
      if (!hasPrimary) {
        updateData.images[0].isPrimary = true;
      }
    }

    const place = await Place.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('state', 'name slug')
      .populate('city', 'name slug');

    if (!place) {
      return res.status(404).json({
        success: false,
        message: `Place not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: place,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete place
// @route   DELETE /api/admin/places/:id
// @access  Admin
const deletePlace = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: `Place not found with id ${req.params.id}`,
      });
    }

    await place.deleteOne();

    res.status(200).json({
      success: true,
      message: `Place "${place.name}" deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get categories with counts
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = ['Heritage', 'Nature', 'Adventure', 'Religious'];
    const counts = await Place.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id] = c.count;
    });

    const categoryDetails = [
      {
        name: 'Heritage',
        description: 'Magnificent palaces, historic forts, ancient temples, and UNESCO World Heritage sites that chronicle millennia of Indian civilization.',
        icon: 'Castle',
        count: countMap['Heritage'] || 0,
        sampleImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Nature',
        description: 'Serene backwaters, misty hill stations, lush national parks, pristine beaches, and majestic snow-capped Himalayan ranges.',
        icon: 'Mountain',
        count: countMap['Nature'] || 0,
        sampleImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Adventure',
        description: 'River rafting in Rishikesh, high-altitude passes in Ladakh, trekking across lush Western Ghats, and desert safaris in Thar.',
        icon: 'Compass',
        count: countMap['Adventure'] || 0,
        sampleImage: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Religious',
        description: 'Sacred river ghats, sacred pilgrimage circuits, majestic temple towns, and vibrant spiritual centers welcoming seekers worldwide.',
        icon: 'Sun',
        count: countMap['Religious'] || 0,
        sampleImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
      },
    ];

    res.status(200).json({
      success: true,
      data: categoryDetails,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/stats
// @access  Public
const getStats = async (req, res, next) => {
  try {
    const [totalStates, totalUTs, totalCities, totalPlaces, categoryCounts] = await Promise.all([
      State.countDocuments({ type: 'State' }),
      State.countDocuments({ type: 'Union Territory' }),
      City.countDocuments(),
      Place.countDocuments(),
      Place.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    const catObj = {};
    categoryCounts.forEach((c) => {
      catObj[c._id] = c.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalStates,
        totalUTs,
        totalRegions: totalStates + totalUTs,
        totalCities,
        totalPlaces,
        categories: catObj,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPlaces,
  getPlaceBySlug,
  createPlace,
  updatePlace,
  deletePlace,
  getCategories,
  getStats,
};
