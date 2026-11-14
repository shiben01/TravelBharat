const express = require('express');
const router = express.Router();
const {
  getStates,
  getStateBySlug,
  createState,
  updateState,
  deleteState,
} = require('../controllers/stateController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getStates)
  .post(protect, createState);

router.route('/:slug')
  .get(getStateBySlug);

router.route('/:id')
  .put(protect, updateState)
  .delete(protect, deleteState);

module.exports = router;
