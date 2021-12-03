const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/', authController.login);
router.get('/authorize', authController.success);
router.post('/authorize', authController.successCallback);

module.exports = router;