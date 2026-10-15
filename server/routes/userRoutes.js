const express = require('express');
const router = express.Router();
const { getUsers, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', authorize('ADMIN'), getUsers);
router.put('/profile', updateProfile);

module.exports = router;
