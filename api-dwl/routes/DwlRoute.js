const express = require('express');
const router = express.Router();
const { DwlProduct } = require('../controllers/DwlController');

router.get('/product', DwlProduct);

module.exports = router;