/**
 * Socket Service for Scribbl Clone Game
 *
 * This service handles all real-time communications for the drawing and guessing game.
 * It manages rooms, players, game state, drawing data, and chat messages using Socket.IO
 * with Redis for pub/sub messaging.
 */

const { Server } = require("socket.io");
const Redis = require("ioredis");
const config = require("../config/environment");
const { generateWord } = require("../utils/wordGenerator");

// Redis configuration from environment variables
const RedisConfig = {
  host: config.redis.HOST,
  port: config.redis.PORT,
  username: config.redis.USERNAME,
  password: config.redis.PASSWORD,
};

// Create Redis clients for publishing and subscribing
const pub = new Redis(RedisConfig); // Publisher client
const sub = new Redis(RedisConfig); // Subscriber client

// In-memory storage for active game rooms
// Using Map instead of a plain object for better performance with large datasets
const rooms = new Map(); // Key: roomId, Value: room object

/**
 * SocketService class handles all WebSocket functionality for the application
 */
class SocketService {
  /**
   * Initialize the Socket.IO server with CORS settings
   */
  constructor() {
    console.log("Init socket service...");

    // Create new Socket.IO server with CORS configuration
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*", // Allow connections from any origin (modify for production)
      },
    });

    // Subscribe to the GAME_EVENTS channel in Redis
    // This allows messages to be broadcast across multiple server instances
    sub.subscribe("GAME_EVENTS");
  }

  /**
   * Initialize a new room with default game settings
   *
   * @param {string} roomId - Unique identifier for the room
   * @param {string} hostId - ID of the player who created the room
   * @returns {Object} Room object with default settings
   */
  initializeRoom(roomId, hostId) {
    return {
      id: roomId, // Unique room identifier
      hostId, // ID of room creator/host
      players: [], // Array of player objects in the room
      currentRound: 0, // Current round number (0 means game not started)
      totalRounds: 3, // Default number of rounds per game
      timePerRound: 60, // Default seconds per round
      currentDrawer: null, // ID of player currently drawing
      currentWord: null, // Word being drawn/guessed
      drawingData: [], // Array of drawing actions for canvas sync
      gameState: "waiting", // Game state: waiting, starting, playing, roundEnd, gameEnd
      correctGuessers: [], // Players who guessed correctly in current round
      scores: {}, // Player scores: {playerId: score}
      messages: [], // Chat messages
      timer: null, // Timer reference for round timing
      timerValue: 0, // Current timer value in seconds
    };
  }

  /**
   * Get room data from the in-memory store
   *
   * @param {string} roomId - Room identifier
   * @returns {Object|undefined} Room object or undefined if not found
   */
  getRoom(roomId) {
    return rooms.get(roomId);
  }

  /**
   * Add a player to a room
   *
   * @param {string} roomId - Room identifier
   * @param {Object} player - Player object {id, username, avatar}
   * @returns {boolean} Success status
   */
  addPlayerToRoom(roomId, player) {
    const room = this.getRoom(roomId);

    // If room doesn't exist, return false
    if (!room) return false;

    // Initialize player score if they don't have one
    if (!room.scores[player.id]) {
      room.scores[player.id] = 0;
    }

    // Check if player already exists in room to avoid duplicates
    if (!room.players.find((p) => p.id === player.id)) {
      room.players.push(player);
    }

    return true;
  }

  /**
   * Remove a player from a room
   *
   * @param {string} roomId - Room identifier
   * @param {string} playerId - Player identifier
   * @returns {boolean} Success status
   */
  removePlayerFromRoom(roomId, playerId) {
    const room = this.getRoom(roomId);

    // If room doesn't exist, return false
    if (!room) return false;

    // Remove player from the players array
    room.players = room.players.filter((p) => p.id !== playerId);

    // If room is empty, delete it to free up memory
    if (room.players.length === 0) {
      rooms.delete(roomId);
      return true;
    }

    // If the host left, assign a new host (first remaining player)
    if (room.hostId === playerId && room.players.length > 0) {
      room.hostId = room.players[0].id;
    }

    // If current drawer left during an active round, end the round
    if (room.currentDrawer === playerId && room.gameState === "playing") {
      this.endRound(roomId);
    }

    return true;
  }

  /**
   * Start a new game in a room
   *
   * @param {string} roomId - Room identifier
   * @returns {boolean} Success status
   */
  startGame(roomId) {
    const room = this.getRoom(roomId);

    // Require at least 2 players to start a game
    if (!room || room.players.length < 2) return false;

    // Update game state
    room.gameState = "starting";
    room.currentRound = 1;

    // Reset all player scores to 0
    room.scores = {};
    room.players.forEach((player) => {
      room.scores[player.id] = 0;
    });

    // Start the first round
    this.startRound(roomId);

    return true;
  }

  /**
   * Start a new round in the game
   *
   * @param {string} roomId - Room identifier
   * @returns {boolean} Success status
   */
  startRound(roomId) {
    const room = this.getRoom(roomId);

    if (!room) return false;

    // Reset round-specific data
    room.drawingData = []; // Clear previous drawing
    room.correctGuessers = []; // Reset correct guessers

    // Select a random word for this round
    room.currentWord = generateWord(); // Random word from our utility function

    // Select the next player to be the drawer (cycle through all players)
    const currentDrawerIndex = room.players.findIndex(
      (p) => p.id === room.currentDrawer,
    );
    // If no drawer yet (-1) or last player was drawing, start from the first player (0)
    // Otherwise, move to the next player
    const nextDrawerIndex = (currentDrawerIndex + 1) % room.players.length;
    room.currentDrawer = room.players[nextDrawerIndex].id;

    // Update game state to playing
    room.gameState = "playing";

    // Start the countdown timer for this round
    this.startTimer(roomId);

    // Notify all players in the room about the new round
    this._io.to(roomId).emit("game:roundStart", {
      round: room.currentRound,
      totalRounds: room.totalRounds,
      drawer: room.currentDrawer,
      timePerRound: room.timePerRound,
      // Word is intentionally omitted here - only drawer should know it
      word: undefined,
    });

    // Send the word only to the drawer
    // This is a private message that other players won't receive
    this._io.to(room.currentDrawer).emit("game:word", {
      word: room.currentWord,
    });

    return true;
  }

  /**
   * End the current round
   *
   * @param {string} roomId - Room identifier
   * @returns {boolean} Success status
   */
  endRound(roomId) {
    const room = this.getRoom(roomId);

    if (!room) return false;

    // Clear any active timer
    if (room.timer) {
      clearInterval(room.timer);
      room.timer = null;
    }

    // Update game state
    room.gameState = "roundEnd";

    // Notify all players about round end, revealing the word
    this._io.to(roomId).emit("game:roundEnd", {
      word: room.currentWord, // Reveal the word to all players
      correctGuessers: room.correctGuessers,
      scores: room.scores, // Current scores
    });

    // Check if this was the last round
    if (room.currentRound >= room.totalRounds) {
      this.endGame(roomId);
    } else {
      // If not the last round, start next round after a delay
      setTimeout(() => {
        room.currentRound++;
        this.startRound(roomId);
      }, 5000); // 5 second delay between rounds
    }

    return true;
  }

  /**
   * End the game and show final results
   *
   * @param {string} roomId - Room identifier
   * @returns {boolean} Success status
   */
  endGame(roomId) {
    const room = this.getRoom(roomId);

    if (!room) return false;

    // Update game state
    room.gameState = "gameEnd";

    // Calculate final rankings based on scores
    const rankings = Object.entries(room.scores)
      .map(([playerId, score]) => {
        // Find player details to include with the score
        const player = room.players.find((p) => p.id === playerId);
        return {
          id: playerId,
          username: player?.username,
          score,
        };
      })
      // Sort by score in descending order
      .sort((a, b) => b.score - a.score);

    // Notify all players about game end with final results
    this._io.to(roomId).emit("game:end", {
      rankings,
      scores: room.scores,
    });

    // Reset room to waiting state for a new game
    room.gameState = "waiting";
    room.currentRound = 0;
    room.currentDrawer = null;
    room.currentWord = null;
    room.drawingData = [];

    return true;
  }

  /**
   * Start a countdown timer for the current round
   *
   * @param {string} roomId - Room identifier
   * @returns {boolean} Success status
   */
  startTimer(roomId) {
    const room = this.getRoom(roomId);

    if (!room) return false;

    // Clear existing timer if any
    if (room.timer) {
      clearInterval(room.timer);
    }

    // Set initial timer value from room settings
    room.timerValue = room.timePerRound;

    // Create an interval that updates every second
    room.timer = setInterval(() => {
      // Decrease timer by 1 second
      room.timerValue--;

      // Broadcast current timer value to all players in the room
      this._io.to(roomId).emit("game:timerUpdate", {
        time: room.timerValue,
      });

      // When timer reaches 0, end the round
      if (room.timerValue <= 0) {
        clearInterval(room.timer);
        room.timer = null;
        this.endRound(roomId);
      }
    }, 1000); // Update every 1000ms (1 second)

    return true;
  }

  /**
   * Process a word guess from a player
   *
   * @param {string} roomId - Room identifier
   * @param {string} playerId - Player making the guess
   * @param {string} guess - The guessed word
   * @returns {boolean} Whether the guess was correct
   */
  processGuess(roomId, playerId, guess) {
    const room = this.getRoom(roomId);

    // Only process guesses during active gameplay and not from the drawer themselves
    if (
      !room ||
      room.gameState !== "playing" ||
      room.currentDrawer === playerId
    ) {
      return false;
    }

    // Player already guessed correctly this round
    if (room.correctGuessers.includes(playerId)) {
      return false;
    }

    // Compare the guess with the current word (case-insensitive)
    const isCorrectGuess =
      guess.toLowerCase().trim() === room.currentWord.toLowerCase().trim();

    if (isCorrectGuess) {
      // Add player to correct guessers list
      room.correctGuessers.push(playerId);

      // Calculate points based on:
      // - Base points (100)
      // - Time bonus (more time left = more points)
      // - Guess rank (first to guess gets more points)
      const basePoints = 100;
      const timeBonus = room.timerValue;
      const guessRank = room.correctGuessers.length;
      const points = Math.max(
        basePoints - (guessRank - 1) * 10 + timeBonus,
        50,
      );

      // Add points to guesser's score
      room.scores[playerId] = (room.scores[playerId] || 0) + points;

      // Also give points to the drawer for successful communication
      if (room.currentDrawer) {
        room.scores[room.currentDrawer] =
          (room.scores[room.currentDrawer] || 0) + 25;
      }

      // Notify all players about the correct guess and updated scores
      this._io.to(roomId).emit("game:correctGuess", {
        playerId,
        points,
        scores: room.scores,
      });

      // If all non-drawing players have guessed correctly, end the round early
      const nonDrawingPlayers = room.players.filter(
        (p) => p.id !== room.currentDrawer,
      );
      if (room.correctGuessers.length >= nonDrawingPlayers.length) {
        this.endRound(roomId);
      }

      return true;
    }

    // Guess was incorrect
    return false;
  }

  /**
   * Initialize socket event listeners
   * This is the main function that sets up all socket event handlers
   */
  initListener() {
    const io = this._io;

    // Handle new client connections
    io.on("connect", (socket) => {
      console.log(`New Socket Connected`, socket.id);

      /**
       * Room Join Event
       * When a player wants to join a game room
       */
      socket.on("room:join", ({ roomId, player }) => {
        // Create room if it doesn't exist yet
        if (!rooms.has(roomId)) {
          rooms.set(roomId, this.initializeRoom(roomId, player.id));
        }

        // Add socket to the room (Socket.IO room)
        socket.join(roomId);

        // Store room and player info in socket data for easy access
        socket.data.roomId = roomId;
        socket.data.playerId = player.id;

        // Add player to the game room data
        this.addPlayerToRoom(roomId, player);

        // Get updated room data
        const room = this.getRoom(roomId);

        // Broadcast to all players in room that a new player joined
        io.to(roomId).emit("room:playerJoined", {
          player,
          players: room.players,
          hostId: room.hostId,
        });

        // Send current room state to the newly joined player
        // This allows them to see all current game info
        socket.emit("room:state", {
          id: room.id,
          players: room.players,
          hostId: room.hostId,
          gameState: room.gameState,
          currentRound: room.currentRound,
          totalRounds: room.totalRounds,
          currentDrawer: room.currentDrawer,
          scores: room.scores,
          drawingData: room.drawingData, // Send current drawing to sync canvas
          timeRemaining: room.timerValue,
        });
      });

      /**
       * Room Leave Event
       * When a player manually leaves a game room
       */
      socket.on("room:leave", () => {
        const roomId = socket.data.roomId;
        const playerId = socket.data.playerId;

        if (roomId && playerId) {
          // Remove player from game data
          this.removePlayerFromRoom(roomId, playerId);

          // Remove socket from the room
          socket.leave(roomId);

          const room = this.getRoom(roomId);

          if (room) {
            // Notify remaining players that someone left
            io.to(roomId).emit("room:playerLeft", {
              playerId,
              players: room.players,
              hostId: room.hostId,
            });
          }

          // Clear room data from socket
          delete socket.data.roomId;
          delete socket.data.playerId;
        }
      });

      /**
       * Game Start Event
       * Host player starts the game
       */
      socket.on("game:start", () => {
        const roomId = socket.data.roomId;
        const playerId = socket.data.playerId;
        const room = this.getRoom(roomId);

        // Verify sender is the host
        if (room && room.hostId === playerId) {
          this.startGame(roomId);
        }
      });

      /**
       * Drawing Events
       * These events sync the drawing canvas between players
       */

      // Start drawing a new line
      socket.on("draw:start", (data) => {
        const roomId = socket.data.roomId;
        const playerId = socket.data.playerId;
        const room = this.getRoom(roomId);

        // Only the current drawer can draw
        if (room && room.currentDrawer === playerId) {
          // Store drawing data for late-joining players
          room.drawingData.push({
            type: "start",
            x: data.x, // X coordinate
            y: data.y, // Y coordinate
            color: data.color, // Line color
            width: data.width, // Line width
          });

          // Broadcast to others in room (except sender)
          socket.to(roomId).emit("draw:start", data);
        }
      });

      // Continue a drawing line
      socket.on("draw:move", (data) => {
        const roomId = socket.data.roomId;
        const playerId = socket.data.playerId;
        const room = this.getRoom(roomId);

        // Only the current drawer can draw
        if (room && room.currentDrawer === playerId) {
          // Store drawing data
          room.drawingData.push({
            type: "move",
            x: data.x,
            y: data.y,
          });

          // Broadcast to others in room (except sender)
          socket.to(roomId).emit("draw:move", data);
        }
      });

      // End a drawing line
      socket.on("draw:end", () => {
        const roomId = socket.data.roomId;
        const playerId = socket.data.playerId;
        const room = this.getRoom(roomId);

        // Only the current drawer can draw
        if (room && room.currentDrawer === playerId) {
          // Store drawing data
          room.drawingData.push({
            type: "end",
          });

          // Broadcast to others in room (except sender)
          socket.to(roomId).emit("draw:end");
        }
      });

      // Clear the entire canvas
      socket.on("draw:clear", () => {
        const roomId = socket.data.roomId;
        const playerId = socket.data.playerId;
        const room = this.getRoom(roomId);

        // Only the current drawer can clear
        if (room && room.currentDrawer === playerId) {
          // Clear drawing data
          room.drawingData = [];

          // Broadcast to others in room (except sender)
          socket.to(roomId).emit("draw:clear");
        }
      });

      /**
       * Chat Message Event
       * Process chat messages and check for correct word guesses
       */
      socket.on("chat:message", ({ message }) => {
        const roomId = socket.data.roomId;
        const playerId = socket.data.playerId;
        const room = this.getRoom(roomId);

        if (!room) return;

        const player = room.players.find((p) => p.id === playerId);

        if (!player) return;

        // Check if the message is a guess during active gameplay
        if (room.gameState === "playing" && playerId !== room.currentDrawer) {
          const isCorrectGuess = this.processGuess(roomId, playerId, message);

          if (isCorrectGuess) {
            // Don't reveal the actual word in chat, replace with a success message
            io.to(roomId).emit("chat:message", {
              id: Date.now(),
              playerId,
              playerName: player.username,
              message: "🎯 Guessed the word!",
              isSystem: false,
              isCorrectGuess: true,
            });
            return;
          }
        }

        // Process regular chat message
        io.to(roomId).emit("chat:message", {
          id: Date.now(),
          playerId,
          playerName: player.username,
          message,
          isSystem: false,
        });
      });

      /**
       * Game Settings Update Event
       * Host player updates game settings
       */
      socket.on("game:updateSettings", (settings) => {
        const roomId = socket.data.roomId;
        const playerId = socket.data.playerId;
        const room = this.getRoom(roomId);

        // Only host can update settings and only while in waiting state
        if (room && room.hostId === playerId && room.gameState === "waiting") {
          // Update settings if provided
          if (settings.totalRounds) room.totalRounds = settings.totalRounds;
          if (settings.timePerRound) room.timePerRound = settings.timePerRound;

          // Notify all players about settings update
          io.to(roomId).emit("game:settingsUpdated", {
            totalRounds: room.totalRounds,
            timePerRound: room.timePerRound,
          });
        }
      });

      /**
       * Disconnect Event
       * Handle player disconnection
       */
      socket.on("disconnect", () => {
        const roomId = socket.data.roomId;
        const playerId = socket.data.playerId;

        if (roomId && playerId) {
          // Remove player from room
          this.removePlayerFromRoom(roomId, playerId);

          const room = this.getRoom(roomId);

          if (room) {
            // Notify remaining players about disconnect
            io.to(roomId).emit("room:playerLeft", {
              playerId,
              players: room.players,
              hostId: room.hostId,
            });
          }
        }
      });
    });

    /**
     * Redis message handler
     * Process messages from other server instances via Redis pub/sub
     */
    sub.on("message", (channel, message) => {
      if (channel === "GAME_EVENTS") {
        const data = JSON.parse(message);

        // Handle different event types from Redis
        if (data.event === "chat:message") {
          // Broadcast chat message to all clients in the room
          io.to(data.roomId).emit("chat:message", data.payload);
        }
        // Add more Redis event handlers as needed
      }
    });
  }

  /**
   * Get the Socket.IO server instance
   * @returns {Server} Socket.IO server
   */
  get io() {
    return this._io;
  }
}

module.exports = SocketService;
