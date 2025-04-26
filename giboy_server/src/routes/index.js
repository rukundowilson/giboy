const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const userController = require('../controllers/userController');

// Home route

router.get('/', homeController.home);
router.post('/api/register', userController.registerUser)
router.post('/api/login', userController.loginUser);



// Home route
router.get('/', homeController.home);

module.exports = router;
