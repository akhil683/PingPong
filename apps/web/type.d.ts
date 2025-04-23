// types/index.ts
export interface Player {
  id: string;
  username: string;
  avatar: string;
}

export interface Message {
  id: number;
  playerId: string;
  playerName: string;
  message: string;
  isSystem?: boolean;
  isCorrectGuess?: boolean;
}

export interface RoomState {
  id: string;
  players: Player[];
  hostId: string;
  gameState: GameState;
  currentRound: number;
  totalRounds: number;
  timePerRound: number;
  currentDrawer: string | null;
  scores: Record<string, number>;
  timeRemaining: number;
  drawingData?: DrawAction[];
}

export type GameState = "waiting" | "playing" | "roundEnd" | "gameEnd";

export interface DrawAction {
  type: "start" | "move" | "end" | "clear";
  x?: number;
  y?: number;
  color?: string;
  width?: number;
}

export interface GameSettings {
  totalRounds: number;
  timePerRound: number;
}
