import { io, Socket } from "socket.io-client";
import { Player } from "../../type";

// Define a type for callbacks that receive optional data
type Callback = (data?: any) => void;

// Define a general interface for game settings
interface GameSettings {
  [key: string]: any;
}

class SocketService {
  // Property to store the socket connection
  private socket: Socket | null = null;

  // Store event callbacks by event name
  private callbacks: Record<string, Callback[]> = {};

  // Connect to the socket server using the given URL
  connect(url: string) {
    // Avoid reconnecting if socket is already connected
    if (this.socket) return;

    // Initialize the socket connection
    this.socket = io(url);

    // Handle socket connect event
    this.socket.on("connect", () => {
      console.log("Socket connected");
      this._triggerCallback("connect");
    });

    // Handle socket disconnect event
    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this._triggerCallback("disconnect");
    });

    // Set up predefined event listeners
    this._setupEventListeners();
  }

  // Disconnect from the socket server
  disconnect() {
    // If socket exists, disconnect it and reset to null
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a room with the roomId and player info
  joinRoom(roomId: string, player: Player): void {
    if (!this.socket) return;
    this.socket.emit("room:join", { roomId, player });
  }

  // Leave the current room
  leaveRoom(): void {
    if (!this.socket) return;
    this.socket.emit("room:leave");
  }

  // Chat message to the server
  sendChatMessage(message: string): void {
    if (!this.socket) return;
    this.socket.emit("chat:message", { message });
  }

  // Start drawing with coordinates, color, and line width
  startDrawing(x: number, y: number, color: string, width: number): void {
    if (!this.socket) return;
    this.socket.emit("draw:start", { x, y, color, width });
  }

  // Continue drawing with current coordinates
  moveDrawing(x: number, y: number): void {
    if (!this.socket) return;
    this.socket.emit("draw:move", { x, y });
  }

  // End drawing
  endDrawing(): void {
    if (!this.socket) return;
    this.socket.emit("draw:end");
  }

  // Clear the drawing canvas
  clearCanvas(): void {
    if (!this.socket) return;
    this.socket.emit("draw:clear");
  }

  // Start the game (host only)
  startGame(): void {
    if (!this.socket) return;
    this.socket.emit("game:start");
  }

  // Update game settings (host only)
  updateGameSettings(settings: GameSettings): void {
    if (!this.socket) return;
    this.socket.emit("game:updateSettings", settings);
  }

  // Register a callback function for a specific socket event
  on(event: string, callback: Callback): void {
    // Initialize array if this is the first callback for this event
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }

    // Add the callback to the list
    this.callbacks[event].push(callback);

    // Attach a socket listener if socket is connected and it's not a system event
    if (this.socket && !["connect", "disconnect"].includes(event)) {
      this.socket.on(event, (data: any) => {
        this._triggerCallback(event, data);
      });
    }
  }

  // Remove a specific callback from an event
  off(event: string, callback: Callback): void {
    // Filter out the given callback from the list
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(
        (cb) => cb !== callback,
      );
    }

    // Remove socket listener from socket.io if it exists
    if (this.socket && !["connect", "disconnect"].includes(event)) {
      this.socket.off(event);
    }
  }

  // Private method to trigger all registered callbacks for a given event
  private _triggerCallback(event: string, data?: any): void {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((callback) => callback(data));
    }
  }

  // Private method to set up common socket event listeners
  private _setupEventListeners() {
    // List of standard events that the client might listen for
    const standardEvents = [
      "room:state",
      "room:playerJoined",
      "room:playerLeft",
      "game:roundStart",
      "game:word",
      "game:timerUpdate",
      "game:correctGuess",
      "game:roundEnd",
      "game:end",
      "game:settingsUpdated",
      "chat:message",
      "draw:start",
      "draw:move",
      "draw:end",
      "draw:clear",
    ];

    // Register each standard event to call the appropriate callback
    standardEvents.forEach((event) => {
      this.socket?.on(event, (data: any) => {
        this._triggerCallback(event, data);
      });
    });
  }
}

const socketService = new SocketService();
export default socketService;
