const { Server } = require("socket.io");
const Redis = require("ioredis");
const config = require("../config/environment");

console.log(config.redis.HOST);

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
  }
  initListener() {
    const io = this.io;
    io.on("connect", (socket) => {
      console.log(`New Socket Connected`, socket.id);
      socket.on("event:message", async ({ message }) => {
        console.log("new messae received", message);
        io.emit("message", message);
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    sub.on("message", (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit("message", message);
      }
    });
  }

  get io() {
    return this._io;
  }
}
module.exports = SocketService;
