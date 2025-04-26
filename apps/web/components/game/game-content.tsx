"use client";
import { useGameContext } from "../../lib/context/game-context";
import GamePage from "./game-page";

export default function RoomContent() {
  const { connected, room } = useGameContext();

  if (!connected || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Connecting to room...</h2>
          <p className="text-gray-600 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return <GamePage />;
}
