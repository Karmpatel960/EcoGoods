// routes/hello.js
const express = require('express');
const { addHello } = require('../controllers/helloController');
const router = express.Router();

router.post('/', addHello);

module.exports = router;