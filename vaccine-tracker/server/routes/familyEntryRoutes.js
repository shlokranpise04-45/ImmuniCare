const express = require('express');
const auth = require('../middleware/authMiddleware');
const { listEntries, createEntry, updateEntry, deleteEntry } = require('../controllers/familyEntryController');

const router = express.Router();
router.use(auth);
router.get('/:profileId/entries', listEntries);
router.post('/:profileId/entries', createEntry);
router.patch('/:profileId/entries/:entryId', updateEntry);
router.delete('/:profileId/entries/:entryId', deleteEntry);

module.exports = router;
