require("dotenv").config({ path: ".env.local" });

const config = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  environment: process.env.NODE_ENV || "development",

  redis: {
    USERNAME: process.env.REDIS_USERNAME,
    PORT: process.env.REDIS_PORT,
    HOST: process.env.REDIS_HOST,
    PASSWORD: process.env.REDIS_PASSWORD,
  },

  // Game configuration
  gameConfig: {
    maxPlayers: 8,
    minPlayers: 2,
    defaultRounds: 3,
    defaultTimeLimit: 60, // seconds
  },
};
module.exports = config;
