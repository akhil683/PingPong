const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateUser } = require('../middleware/validationMiddleware');

const router = express.Router();

// Public Routes
router.post('/register', validateUser, userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected Routes
router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.get('/stats', authMiddleware, userController.getUserStats);

module.exports = router;
