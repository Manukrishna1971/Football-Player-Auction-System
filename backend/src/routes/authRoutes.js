const express = require('express');
const router = express.Router();
const { login, register, getMe, getDemoAccounts } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);
router.get('/demo-accounts', getDemoAccounts);

module.exports = router;
