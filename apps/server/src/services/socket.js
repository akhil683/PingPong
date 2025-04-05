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
      socket.on("event:message", async (message) => {
        console.log("new message received", message);
        await pub.publish("MESSAGES", JSON.stringify(message));
      });

      // Join a room
      socket.on("room:join", (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      });

      // Leave a room
      socket.on("room:leave", (room) => {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room ${room}`);
      });

      // Send a message to a specific room
      socket.on("event:message", async ({ room, message }) => {
        console.log(`New message in room ${room}:`, message);
        await pub.publish("MESSAGES", JSON.stringify({ room, message }));
      });
    });

    // Listen for Redis messages and emit only to specific rooms
    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        const { room, message: msg } = JSON.parse(message);
        io.to(room).emit("message", msg); // Send message only to users in the room
      }
    });
  }

  get io() {
    return this._io;
  }
}
module.exports = SocketService;
