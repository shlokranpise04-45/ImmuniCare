const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { sendNow } = require('../controllers/notifyController');

router.use(auth);
router.post('/:profileId', sendNow);

module.exports = router;
