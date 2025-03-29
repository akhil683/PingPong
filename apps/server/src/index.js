const http = require("http")
const SocketService = require("./services/socket")

async function init() {

  const socketService = new SocketService()

  const httpServer = http.createServer()
  const PORT = process.env.PORT || 8000

  socketService.io.attach(httpServer)

  httpServer.listen(PORT, () => {
    console.log(`HTTP server started at PORT: ${PORT}`)
  })
}
init()

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const http = require('http');
//
// const config = require('./config/environment');
// const SocketManager = require('./utils/socketManager');
//
// const userRoutes = require('./routes/userRoutes');
// const gameRoutes = require('./routes/gameRoutes');
//
// class Server {
//   constructor() {
//     this.app = express();
//     this.server = http.createServer(this.app);
//     this.socketManager = new SocketManager(this.server);
//
//     this.initializeMiddlewares();
//     this.connectDatabase();
//     this.initializeRoutes();
//   }
//
//   initializeMiddlewares() {
//     this.app.use(helmet());
//     this.app.use(cors({
//       origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//       credentials: true
//     }));
//     this.app.use(express.json({ limit: '50mb' }));
//     this.app.use(morgan('combined'));
//   }
//
//   async connectDatabase() {
//     try {
//       await mongoose.connect(config.mongoURI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       });
//       console.log('MongoDB connected successfully');
//     } catch (error) {
//       console.error('MongoDB connection error:', error);
//       process.exit(1);
//     }
//   }
//
//   initializeRoutes() {
//     this.app.use('/api/users', userRoutes);
//     this.app.use('/api/games', gameRoutes);
//
//     // Global error handler
//     this.app.use((err, req, res, next) => {
//       console.error(err.stack);
//       res.status(500).json({
//         message: 'Something went wrong!',
//         error: config.environment === 'development' ? err.message : {}
//       });
//     });
//   }
//
//   start() {
//     const PORT = config.port;
//     this.server.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   }
// }
//
// const server = new Server();
// server.start();
//
// module.exports = server;
