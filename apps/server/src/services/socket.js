const { Server } = require("socket.io");
const Redis = require("ioredis");
const config = require("../config/environment");

const RedisConfig = {
  host: config.redis.HOST,
  port: config.redis.PORT,
  username: config.redis.USERNAME,
  password: config.redis.PASSWORD,
};
const pub = new Redis(RedisConfig);
const sub = new Redis(RedisConfig);

class SocketService {
  constructor() {
    console.log("Init socket service...");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  initListener() {
    const io = this._io;

    io.on("connect", (socket) => {
      console.log(`New Socket Connected`, socket.id);

      // Join a room
      socket.on("room:join", ({ roomId, player }) => {
        //Get or create room
        if (!rooms.has(roomId)) {
          rooms.set(roomId, this.initializeRoom(roomId, player.id));
        }
        //Add socket to the room (socket.io room)
        socket.join(roomId);

        // Store room and player info in socket data for easy access
        socket.data.roomId = roomId;
        socket.data.playerId = player.id;

        // Add player to the game room data
        this.addPlayerToRoom(roomId, player);

        //Get updated room data
        const room = this.getRoom(roomId);

        // Broadcast to all players in room that a new player joined
        io.to(roomId).emit("room:playerJoined", {
          player,
          players: room.players,
          hostId: room.hostId,
        });

        //Send current room state to the newly joined player
        //This allows them to see all current game info
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
          //Remove player from game data
          this.removePlayerFromRoom(roomId, playerId);

          //Remove socket from the room
          socket.leave(roomId);
          const room = this.getRoom(roomId);

          if (room) {
            //Notify remaining players that someone left
            io.to(roomId).emit("room:playerLeft", {
              playerId,
              players: room.players,
              hostId: room.hostId,
            });
          }

          //Clear room data from socket
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

        //Verify sender is the host
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

        //Only the current drawer can draw
        if (room && room.currentDrawer === playerId) {
          //Store drawing data fot late-joining players
          room.drawingData.push({
            type: "start",
            x: data.x, // X coordinate
            y: data.y, // Y coordinate
            color: data.color, //Line color
            width: data.width, //Line width
          });

          //Broadcast to others in room (except sender)
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
          //Store drawing data
          room.drawingData.push({
            type: "move",
            x: data.x,
            y: data.y,
          });

          //Broadcast to others in room (except sender)
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
    });

    // Listen for Redis messages and emit only to specific rooms
    sub.on("message", (channel, message) => {
      if (channel === "GAME_EVENTS") {
        const data = JSON.parse(message);

        // Handle different event types from Redis
        if (data.event === "chat:message") {
          io.to(data.roomId).emit("chat:message", data.payload);
        }
      }
    });
  }

  get io() {
    return this._io;
  }
}
module.exports = SocketService;
