const express = require('express');
const auth = require('../middleware/authMiddleware');
const { listEntries, createEntry, deleteEntry } = require('../controllers/petEntryController');

const router = express.Router();
router.use(auth);
router.get('/:petId/entries', listEntries);
router.post('/:petId/entries', createEntry);
router.delete('/:petId/entries/:entryId', deleteEntry);

module.exports = router;
