const { Server } = require("socket.io")

class SocketService {

  constructor() {
    console.log("Init socket service...")
    this._io = new Server()
  }

  initListener() {
    const io = this.io
    io.on("connect", socket => {
      console.log(`New Socket Connected`, socket.id)
      socket.on("event:message", async ({ message }) => {
        console.log("new messae received", message)
      })
    })
  }

  get io() {
    return this._io
  }
}
module.exports = SocketService
