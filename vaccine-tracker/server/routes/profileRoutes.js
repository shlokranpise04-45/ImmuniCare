const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getProfiles,
  createProfile,
  getProfileById,
  deleteProfile,
  updateProfile,
} = require('../controllers/profileController');

router.use(auth);
router.get('/', getProfiles);
router.post('/', createProfile);
router.get('/:id', getProfileById);
router.patch('/:id', updateProfile);
router.delete('/:id', deleteProfile);

module.exports = router;
