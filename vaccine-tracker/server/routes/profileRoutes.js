const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getProfiles,
  createProfile,
  getProfileById,
  deleteProfile,
} = require('../controllers/profileController');

router.use(auth);
router.get('/', getProfiles);
router.post('/', createProfile);
router.get('/:id', getProfileById);
router.delete('/:id', deleteProfile);

module.exports = router;
