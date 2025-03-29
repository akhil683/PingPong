const Game = require('../models/Game');
const User = require('../models/User');
const Drawing = require('../models/Drawing');
const crypto = require('crypto');

class GameController {
  // Generate unique game code
  static generateGameCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  }

  // Create a new game
  static async createGame(req, res) {
    try {
      const { rounds, timeLimit } = req.body;
      const user = req.user;

      // Generate unique game code
      const gameCode = this.generateGameCode();

      // Create new game
      const game = new Game({
        code: gameCode,
        host: user.id,
        players: [{
          user: user.id,
          score: 0,
          isDrawing: false
        }],
        rounds: rounds || 3,
        timeLimit: timeLimit || 60
      });

      await game.save();

      res.status(201).json({
        gameCode: game.code,
        rounds: game.rounds,
        timeLimit: game.timeLimit
      });
    } catch (error) {
      res.status(500).json({
        message: 'Game creation failed',
        error: error.message
      });
    }
  }

  // Join an existing game
  static async joinGame(req, res) {
    try {
      const { gameCode } = req.params;
      const user = req.user;

      // Find the game
      const game = await Game.findOne({ code: gameCode })
        .populate('players.user', 'username');

      if (!game) {
        return res.status(404).json({
          message: 'Game not found'
        });
      }

      // Check if game is full or already started
      if (game.players.length >= 8) {
        return res.status(400).json({
          message: 'Game is full'
        });
      }

      if (game.status !== 'WAITING') {
        return res.status(400).json({
          message: 'Game has already started'
        });
      }

      // Check if user is already in the game
      const existingPlayer = game.players.find(
        p => p.user._id.toString() === user.id
      );

      if (existingPlayer) {
        return res.status(200).json({
          message: 'Already in game',
          game: {
            code: game.code,
            players: game.players,
            rounds: game.rounds,
            timeLimit: game.timeLimit
          }
        });
      }

      // Add user to the game
      game.players.push({
        user: user.id,
        score: 0,
        isDrawing: false
      });

      await game.save();

      res.json({
        gameCode: game.code,
        players: game.players,
        rounds: game.rounds,
        timeLimit: game.timeLimit
      });
    } catch (error) {
      res.status(500).json({
        message: 'Join game failed',
        error: error.message
      });
    }
  }

  // Get game details
  static async getGameDetails(req, res) {
    try {
      const { gameCode } = req.params;

      const game = await Game.findOne({ code: gameCode })
        .populate('players.user', 'username')
        .populate('host', 'username');

      if (!game) {
        return res.status(404).json({
          message: 'Game not found'
        });
      }

      res.json({
        gameCode: game.code,
        status: game.status,
        players: game.players,
        currentRound: game.currentRound,
        totalRounds: game.rounds,
        timeLimit: game.timeLimit,
        host: game.host
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to retrieve game details',
        error: error.message
      });
    }
  }

  // Start the game
  static async startGame(req, res) {
    try {
      const { gameCode } = req.params;
      const user = req.user;

      const game = await Game.findOne({ code: gameCode });

      if (!game) {
        return res.status(404).json({
          message: 'Game not found'
        });
      }

      // Verify the user is the host
      if (game.host.toString() !== user.id) {
        return res.status(403).json({
          message: 'Only the host can start the game'
        });
      }

      // Check minimum players
      if (game.players.length < 2) {
        return res.status(400).json({
          message: 'At least 2 players required to start'
        });
      }

      // Update game status
      game.status = 'IN_PROGRESS';
      game.currentRound = 1;

      // Select first drawer
      game.players[0].isDrawing = true;

      await game.save();

      res.json({
        message: 'Game started',
        status: game.status,
        currentRound: game.currentRound
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to start game',
        error: error.message
      });
    }
  }

  // Submit a guess
  static async submitGuess(req, res) {
    try {
      const { gameCode } = req.params;
      const { guess } = req.body;
      const user = req.user;

      const game = await Game.findOne({ code: gameCode });

      if (!game) {
        return res.status(404).json({
          message: 'Game not found'
        });
      }

      // Validate game state
      if (game.status !== 'IN_PROGRESS') {
        return res.status(400).json({
          message: 'Game is not in progress'
        });
      }

      // Check if the guess is correct
      const isCorrect = guess.toLowerCase() === game.currentWord.toLowerCase();

      if (isCorrect) {
        // Find the player and update their score
        const playerIndex = game.players.findIndex(
          p => p.user.toString() === user.id
        );

        if (playerIndex !== -1) {
          // Calculate points based on time remaining, etc.
          game.players[playerIndex].score += 10;
        }

        // You might want to trigger next round logic here
      }

      await game.save();

      res.json({
        isCorrect,
        message: isCorrect ? 'Correct guess!' : 'Incorrect guess'
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to submit guess',
        error: error.message
      });
    }
  }
}

module.exports = GameController;
