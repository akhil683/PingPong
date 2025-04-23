import React, { useContext, useState, useEffect } from "react";
import socketService from "../utils/socket-service";
import { Message, Player, Room } from "../../type";
import env from "../../config/env";

interface GameProviderProps {
  children?: React.ReactNode;
  roomId: string;
}

interface IGameContext {
  connected: boolean;
  player: Player | null;
  room: Room | null;
  messages: Message[];
  currentWord: string;
  timerValue: number;
  isDrawer: boolean;
  gameActions: {
    startGame: () => void;
    updateSettings: (settings: any) => void;
    sendMessage: (message: string) => void;
    leaveRoom: () => void;
  };
}

const GameContext = React.createContext<IGameContext | null>(null);

export function GameProvider({ children, roomId }: GameProviderProps) {
  const [connected, setConnected] = useState<boolean>(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [timerValue, setTimerValue] = useState(0);
  const [isDrawer, setIsDrawer] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const username = localStorage.getItem("username") || "Guest";
    const playerId =
      localStorage.getItem("playerId") ||
      `player_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("playerId", playerId);

    const playerObj = {
      id: playerId,
      username,
      avatar: `https://api.dicebear.com/6.x/adventurer/svg?seed=${username}`,
    };

    setPlayer(playerObj);
  }, [roomId]);

  useEffect(() => {
    if (!player || !roomId) return;

    const socketUrl = env.NEXT_PUBLIC_SOCKET_URL;
    socketService.connect(socketUrl);

    socketService.on("connect", () => {
      setConnected(true);
      socketService.joinRoom(roomId, player);
    });

    socketService.on("disconnect", () => {
      setConnected(false);
    });

    socketService.on("room:state", (roomState) => {
      setRoom(roomState);
      setTimerValue(roomState.timeRemaining);
      setIsDrawer(roomState.currentDrawer === player.id);
    });

    socketService.on("room:playerJoined", ({ player, players, hostId }) => {
      setRoom((prev) => (prev ? { ...prev, players, hostId } : null));
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          playerId: "system",
          playerName: "System",
          message: `${player.username} joined the room`,
          isSystem: true,
        },
      ]);
    });

    socketService.on("room:playerLeft", ({ playerId, players, hostId }) => {
      setRoom((prev) => {
        if (!prev) return null;
        const playerName =
          prev.players.find((p) => p.id === playerId)?.username || "Someone";
        setMessages((prevMsgs) => [
          ...prevMsgs,
          {
            id: String(Date.now()),
            playerId: "system",
            playerName: "System",
            message: `${playerName} left the room`,
            isSystem: true,
          },
        ]);
        return { ...prev, players, hostId };
      });
    });

    socketService.on(
      "game:roundStart",
      ({ round, totalRounds, drawer, timePerRound }) => {
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
        setTimerValue(timePerRound);
        setIsDrawer(drawer === player.id);
        setCurrentWord("");
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            playerId: "system",
            playerName: "System",
            message: `Round ${round} of ${totalRounds} started!`,
            isSystem: true,
          },
        ]);
      },
    );

    socketService.on("game:word", ({ word }) => {
      setCurrentWord(word);
    });

    socketService.on("game:timerUpdate", ({ time }) => {
      setTimerValue(time);
    });

    socketService.on("game:correctGuess", ({ playerId, points }) => {
      setRoom((prev) => {
        if (!prev) return null;
        const newScores = { ...prev.scores };
        newScores[playerId] = (newScores[playerId] || 0) + points;
        if (prev.currentDrawer) {
          newScores[prev.currentDrawer] =
            (newScores[prev.currentDrawer] || 0) + 25;
        }
        return {
          ...prev,
          scores: newScores,
        };
      });
    });

    socketService.on("game:roundEnd", ({ word, scores }) => {
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              gameState: "roundEnd",
              scores,
            }
          : null,
      );
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          playerId: "system",
          playerName: "System",
          message: `Round ended! The word was: ${word}`,
          isSystem: true,
        },
      ]);
    });

    socketService.on("game:end", ({ rankings, scores }) => {
      setRoom((prev) =>
        prev
          ? {
              ...prev,
              gameState: "gameEnd",
              scores,
            }
          : null,
      );
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          playerId: "system",
          playerName: "System",
          message: `Game ended! ${
            rankings[0]?.username || "Someone"
          } won with ${rankings[0]?.score || 0} points!`,
          isSystem: true,
        },
      ]);
    });

    socketService.on(
      "game:settingsUpdated",
      ({ totalRounds, timePerRound }) => {
        setRoom((prev) =>
          prev
            ? {
                ...prev,
                totalRounds,
                timePerRound,
              }
            : null,
        );
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            playerId: "system",
            playerName: "System",
            message: `Game settings updated: ${totalRounds} rounds, ${timePerRound} seconds per round`,
            isSystem: true,
          },
        ]);
      },
    );

    socketService.on("chat:message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketService.leaveRoom();
      socketService.disconnect();
    };
  }, [player, roomId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socketService.leaveRoom();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const gameActions = {
    startGame: () => {
      if (room && player && room.hostId === player.id) {
        socketService.startGame();
      }
    },
    updateSettings: (settings: any) => {
      if (room && player && room.hostId === player.id) {
        socketService.updateGameSettings(settings);
      }
    },
    sendMessage: (message: string) => {
      if (message.trim()) {
        socketService.sendChatMessage(message);
      }
    },
    leaveRoom: () => {
      socketService.leaveRoom();
    },
  };

  const value: IGameContext = {
    connected,
    player,
    room,
    messages,
    currentWord,
    timerValue,
    isDrawer,
    gameActions,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
