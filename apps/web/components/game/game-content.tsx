"use client";
import { useGameContext } from "../../lib/context/game-context";
import GamePage from "./game-page";

export default function RoomContent() {
  const { connected, room } = useGameContext();

  if (!connected || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-black">
        <div className="text-center">
          <h2 className="text-4xl font-semibold">Connecting to room...</h2>
          <p className="text-gray-600 text-xl mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return <GamePage />;
}
