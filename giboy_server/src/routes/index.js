const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const userController = require('../controllers/userController');
const { upload, addItem, getAllItems } = require("../controllers/itemController");
const cartItemsController = require('../controllers/cartItemsController');


// Home route

router.get('/', homeController.home);
router.post('/api/register', userController.registerUser)
router.post('/api/login', userController.loginUser);
router.post("/api/items", upload.single("image"), addItem);
router.get("/api/items", getAllItems);
router.post('/api/cart-items', cartItemsController.addOrUpdateCartItem);
router.get('/api/get-cart-items/:userId', cartItemsController.getUserCartItems);
router.delete('/:id', cartItemsController.deleteCartItem);

// Home route
router.get('/', homeController.home);

module.exports = router;
