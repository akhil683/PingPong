interface Score {
  [key: string]: number;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  isConnected?: boolean;
}
export interface Message {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  isSystem: boolean;
  isCorrectGuess?: boolean;
}

export interface DrawingData {
  type: string;
  x: number;
  y: number;
  color: string;
  width: number;
}

export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  timePerRound: number;
  currentDrawer: string;
  currentWord: string;
  drawingData: DrawingData[];
  gameState: "waiting" | "starting" | "playing" | "roundEnd" | "gameEnd";
  correctGuessers: Player[];
  scores: Score;
  messages: Message[];
  timer: {};
  timerValue: number;
}
