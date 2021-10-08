const { Router } = require('express');
const authController = require('../controllers/authControllers');
const router = Router();

// A list of routes is defined which maps a given request to a controller and an action
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;