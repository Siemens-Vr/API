const express = require('express');
const { register, login } = require('../controllers/authController');
const {refresh} = require('../controllers/refreshTokenControllers')
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

module.exports = router;