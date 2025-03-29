const socketIo = require('socket.io');
const Game = require('../models/Game');
const User = require('../models/User');
const Drawing = require('../models/Drawing');

class SocketManager {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.games = new Map();
    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.io.on('connection', (socket) => {
      // Game creation
      socket.on('create-game', async (data) => {
        try {
          const game = await this.createGame(data.userId, data.settings);
          socket.join(game.code);
          socket.emit('game-created', { gameCode: game.code });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Join game
      socket.on('join-game', async (data) => {
        try {
          const game = await this.joinGame(data.userId, data.gameCode);
          socket.join(game.code);
          this.io.to(game.code).emit('player-joined', {
            players: game.players
          });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // Drawing events
      socket.on('draw', (data) => {
        socket.to(data.gameCode).emit('draw', data.drawingData);
      });

      // Game logic events
      socket.on('guess-word', async (data) => {
        const isCorrect = await this.checkGuess(data);
        if (isCorrect) {
          this.io.to(data.gameCode).emit('correct-guess', {
            userId: data.userId,
            points: 10
          });
        }
      });

      socket.on('disconnect', () => {
        // Handle player disconnection
      });
    });
  }

  async createGame(userId, settings) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const gameCode = this.generateGameCode();
    const game = new Game({
      code: gameCode,
      host: userId,
      players: [{ user: userId }],
      ...settings
    });

    await game.save();
    this.games.set(gameCode, game);
    return game;
  }

  async joinGame(userId, gameCode) {
    const game = await Game.findOne({ code: gameCode });
    if (!game) throw new Error('Game not found');

    if (game.players.length >= 8) {
      throw new Error('Game is full');
    }

    const userAlreadyInGame = game.players.some(
      player => player.user.toString() === userId
    );

    if (!userAlreadyInGame) {
      game.players.push({ user: userId });
      await game.save();
    }

    return game;
  }

  async checkGuess(data) {
    const game = await Game.findOne({ code: data.gameCode });
    return data.guess.toLowerCase() === game.currentWord.toLowerCase();
  }

  generateGameCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

module.exports = SocketManager;
