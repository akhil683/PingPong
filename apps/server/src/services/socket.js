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
    });

    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit("message", JSON.parse(message));
      }
    });
  }

  get io() {
    return this._io;
  }
}
module.exports = SocketService;
