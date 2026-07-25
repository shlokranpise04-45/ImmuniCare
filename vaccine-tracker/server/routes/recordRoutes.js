const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getRecordsForProfile,
  addRecord,
  deleteRecord,
} = require('../controllers/recordController');

router.use(auth);
router.get('/:profileId', getRecordsForProfile);
router.post('/:profileId', addRecord);
router.delete('/:profileId/:recordId', deleteRecord);

module.exports = router;
