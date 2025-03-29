const express = require('express');
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected Routes
router.post('/create', authMiddleware, gameController.createGame);
router.post('/join/:gameCode', authMiddleware, gameController.joinGame);
router.get('/:gameCode', authMiddleware, gameController.getGameDetails);
router.post('/:gameCode/start', authMiddleware, gameController.startGame);
router.post('/:gameCode/guess', authMiddleware, gameController.submitGuess);

module.exports = router;
