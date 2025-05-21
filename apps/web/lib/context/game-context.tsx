"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import io, { Socket } from "socket.io-client";
import { Player, RoomState, Message, GameSettings } from "../../type";

interface GameContextProps {
  socket: Socket | null;
  connected: boolean;
  player: Player | null;
  room: RoomState | null;
  messages: Message[];
  currentWord: string;
  isDrawer: boolean;
  startGame: () => void;
  updateSettings: (settings: GameSettings) => void;
  sendMessage: (message: string) => void;
  sendDrawingData: (drawingData: DrawingData) => void;
  leaveRoom: () => void;
  clearCanvas: () => void;
}

interface DrawingData {
  x0: number;
  y0: number;
  x1: number;
  x2: number;
  color: string;
  lineWidth: number;
  tool?: string; // For eraser or other tool
}

const GameContext = createContext<GameContextProps | null>(null);

interface GameProviderProps {
  children: ReactNode;
  roomId: string;
}

export const GameProvider: React.FC<GameProviderProps> = ({
  children,
  roomId,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentWord, setCurrentWord] = useState<string>("");
  const [isDrawer, setIsDrawer] = useState<boolean>(false);

  // Initialize socket connection when component mounts
  useEffect(() => {
    if (!roomId) return;

    const username = localStorage.getItem("username") || "Guest";
    const avatar = localStorage.getItem("avatar");

    const playerId =
      localStorage.getItem("playerId") ||
      `player_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("playerId", playerId);

    const playerObj: Player = {
      id: playerId,
      username: username,
      avatar: avatar as string,
    };

    setPlayer(playerObj);

    // Initialize socket
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    const socketInstance = io(socketUrl);
    setSocket(socketInstance);

    // Socket connection event handlers
    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setConnected(true);

      // Join room
      socketInstance.emit("room:join", { roomId, player: playerObj });
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    // Room state event handler
    socketInstance.on("room:state", (roomState: RoomState) => {
      console.log("Room state received:", roomState);
      setRoom(roomState);

      // Check if this player is the drawer
      if (roomState.currentDrawer === playerObj.id) {
        setIsDrawer(true);
      } else {
        setIsDrawer(false);
      }
    });

    // Player join/leave events
    socketInstance.on(
      "room:playerJoined",
      ({
        player,
        players,
        hostId,
      }: {
        player: Player;
        players: Player[];
        hostId: string;
      }) => {
        setRoom((prev) => (prev ? { ...prev, players, hostId } : null));

        // Add system message for player joining
        const joinMessage: Message = {
          id: Date.now(),
          playerId: "system",
          playerName: "System",
          message: `${player.username} joined the room`,
          isSystem: true,
        };
        setMessages((prev) => [...prev, joinMessage]);
      },
    );

    socketInstance.on(
      "room:playerLeft",
      ({
        playerId,
        players,
        hostId,
      }: {
        playerId: string;
        players: Player[];
        hostId: string;
      }) => {
        setRoom((prev) => (prev ? { ...prev, players, hostId } : null));

        // Find player who left
        const playerName =
          room?.players.find((p) => p.id === playerId)?.username || "Someone";

        // Add system message for player leaving
        const leaveMessage: Message = {
          id: Date.now(),
          playerId: "system",
          playerName: "System",
          message: `${playerName} left the room`,
          isSystem: true,
        };
        setMessages((prev) => [...prev, leaveMessage]);
      },
    );

    // Game events
    socketInstance.on(
      "game:roundStart",
      ({
        round,
        totalRounds,
        drawer,
        timePerRound,
      }: {
        round: number;
        totalRounds: number;
        drawer: string;
        timePerRound: number;
      }) => {
        setRoom((prev) =>
          prev
            ? {
                ...prev,
                gameState: "playing",
                currentRound: round,
                totalRounds,
                currentDrawer: drawer,
              }
            : null,
        );

        setIsDrawer(drawer === playerObj.id);
        setCurrentWord(""); // Reset current word

        // Add system message for round start
        const roundStartMessage: Message = {
          id: Date.now(),
          playerId: "system",
          playerName: "System",
          message: `Round ${round} of ${totalRounds} started!`,
          isSystem: true,
        };
        setMessages((prev) => [...prev, roundStartMessage]);
      },
    );

    socketInstance.on("game:word", ({ word }: { word: string }) => {
      setCurrentWord(word);
    });

    socketInstance.on("game:timerUpdate", ({ time }: { time: number }) => {
      setRoom((prev) => (prev ? { ...prev, timeRemaining: time } : null));
    });

    socketInstance.on(
      "game:correctGuess",
      ({ playerId, points }: { playerId: string; points: number }) => {
        const playerName =
          room?.players.find((p) => p.id === playerId)?.username || "Someone";

        // Update room scores
        setRoom((prev) => {
          if (!prev) return null;

          const newScores = { ...prev.scores };
          // Add points to guesser
          newScores[playerId] = (newScores[playerId] || 0) + points;
          // Add points to drawer
          if (prev.currentDrawer) {
            newScores[prev.currentDrawer] =
              (newScores[prev.currentDrawer] || 0) + 25;
          }

          return {
            ...prev,
            scores: newScores,
          };
        });
      },
    );

    socketInstance.on(
      "game:roundEnd",
      ({
        word,
        correctGuessers,
        scores,
      }: {
        word: string;
        correctGuessers: string[];
        scores: Record<string, number>;
      }) => {
        setRoom((prev) =>
          prev
            ? {
                ...prev,
                gameState: "roundEnd",
                scores,
              }
            : null,
        );

        // Add system message for round end
        const roundEndMessage: Message = {
          id: Date.now(),
          playerId: "system",
          playerName: "System",
          message: `Round ended! The word was: ${word}`,
          isSystem: true,
        };
        setMessages((prev) => [...prev, roundEndMessage]);
      },
    );

    socketInstance.on(
      "game:end",
      ({
        rankings,
        scores,
      }: {
        rankings: Array<{ username: string; score: number }>;
        scores: Record<string, number>;
      }) => {
        setRoom((prev) =>
          prev
            ? {
                ...prev,
                gameState: "gameEnd",
                scores,
              }
            : null,
        );

        // Add system message for game end
        const gameEndMessage: Message = {
          id: Date.now(),
          playerId: "system",
          playerName: "System",
          message: `Game ended! ${rankings[0]?.username || "Someone"} won with ${rankings[0]?.score || 0} points!`,
          isSystem: true,
        };
        setMessages((prev) => [...prev, gameEndMessage]);
      },
    );

    socketInstance.on(
      "game:settingsUpdated",
      ({ totalRounds, timePerRound }: GameSettings) => {
        setRoom((prev) =>
          prev
            ? {
                ...prev,
                totalRounds,
                timePerRound,
              }
            : null,
        );

        // Add system message for settings update
        const settingsMessage: Message = {
          id: Date.now(),
          playerId: "system",
          playerName: "System",
          message: `Game settings updated: ${totalRounds} rounds, ${timePerRound} seconds per round`,
          isSystem: true,
        };
        setMessages((prev) => [...prev, settingsMessage]);
      },
    );

    // Chat messages
    socketInstance.on("chat:message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Drawing event handlers
    socketInstance.on(
      "drawing:update",
      (data: { drawingData: DrawingData }) => {
        // This event will be handled by your Canvas component
        // We're just making sure to receive and forward it
        const drawEvent = new CustomEvent("canvas:draw", {
          detail: data.drawingData,
        });
        window.dispatchEvent(drawEvent);
      },
    );

    socketInstance.on("drawing:clear", () => {
      // This event will be handled by your Canvas component
      const clearEvent = new CustomEvent("canvas:clear");
      window.dispatchEvent(clearEvent);
    });
    // Cleanup function
    return () => {
      if (socketInstance) {
        socketInstance.emit("room:leave");
        socketInstance.disconnect();
      }
    };
  }, [roomId]);

  // Handle user leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket) {
        socket.emit("room:leave");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket]);

  // Start game function (for host)
  const startGame = () => {
    console.log("Start game");
    if (socket && room && player && room.hostId === player.id) {
      console.log("Start game 1");
      socket.emit("game:start");
    }
  };

  // Send drawing data
  const sendDrawingData = (drawingData: DrawingData) => {
    if (socket && isDrawer) {
      socket.emit("drawing:update", {
        roomId: roomId,
        drawingData: drawingData,
      });
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    if (socket && isDrawer) {
      socket.emit("drawing:clear", { roomId });
    }
  };

  // Update game settings (for host)
  const updateSettings = (settings: GameSettings) => {
    if (socket && room && player && room.hostId === player.id) {
      socket.emit("game:updateSettings", settings);
    }
  };

  // Send chat message
  const sendMessage = (message: string) => {
    if (socket && message.trim()) {
      console.log("message", message);
      socket.emit("chat:message", { message });
    }
  };

  // Leave room
  const leaveRoom = () => {
    if (socket) {
      socket.emit("room:leave");
      window.location.href = "/";
    }
  };

  return (
    <GameContext.Provider
      value={{
        socket,
        connected,
        player,
        room,
        messages,
        currentWord,
        isDrawer,
        startGame,
        updateSettings,
        sendMessage,
        leaveRoom,
        sendDrawingData,
        clearCanvas,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};
