const express = require('express');
const router = express.Router();
const { login, register, getMe, changePassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
