const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/activate', controller.activate);
router.post('/mfa/verify', controller.verifyMFA);
router.post('/logout', controller.logout);

router.get('/user', controller.getUserFromSession);

module.exports = router;