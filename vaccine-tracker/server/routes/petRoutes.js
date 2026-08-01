const express = require('express');
const auth = require('../middleware/authMiddleware');
const { getProfiles, createPet, getProfileById, updateProfile, deleteProfile } = require('../controllers/profileController');

const router = express.Router();
router.use(auth);

router.get('/', (req, res, next) => {
  req.query.category = 'Pet';
  return getProfiles(req, res, next);
});
router.post('/', createPet);
router.get('/:id', getProfileById);
router.patch('/:id', updateProfile);
router.delete('/:id', deleteProfile);

module.exports = router;
