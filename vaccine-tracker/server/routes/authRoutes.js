const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { register, login, forgotPassword, resetPassword, updateEmail } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.patch('/email', authMiddleware, updateEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
