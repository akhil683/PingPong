require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  environment: process.env.NODE_ENV || 'development',

  // Game configuration
  gameConfig: {
    maxPlayers: 8,
    minPlayers: 2,
    defaultRounds: 3,
    defaultTimeLimit: 60 // seconds
  }
};

module.exports = config;
