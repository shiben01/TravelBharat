const express = require('express');
const router = express.Router();
const {
  getPlaces,
  getPlaceBySlug,
  createPlace,
  updatePlace,
  deletePlace,
  getCategories,
  getStats,
} = require('../controllers/placeController');
const { protect } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/stats', getStats);

router.route('/')
  .get(getPlaces)
  .post(protect, createPlace);

router.route('/:slug')
  .get(getPlaceBySlug);

router.route('/:id')
  .put(protect, updatePlace)
  .delete(protect, deletePlace);

module.exports = router;
