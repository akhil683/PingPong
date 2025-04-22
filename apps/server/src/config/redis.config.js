const config = require("./environment");

const RedisConfig = {
  host: config.redis.HOST,
  port: config.redis.PORT,
  username: config.redis.USERNAME,
  password: config.redis.PASSWORD,
};

module.exports = RedisConfig;
