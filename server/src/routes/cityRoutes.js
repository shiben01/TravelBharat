const express = require('express');
const router = express.Router();
const {
  getCities,
  createCity,
  updateCity,
  deleteCity,
} = require('../controllers/cityController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getCities)
  .post(protect, createCity);

router.route('/:id')
  .put(protect, updateCity)
  .delete(protect, deleteCity);

module.exports = router;
