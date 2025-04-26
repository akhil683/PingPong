import { useEffect, useState } from "react";
import PlayersList from "../players/player-list";
import { useGameContext } from "../../lib/context/game-context";

export default function GameLeaderboard() {
  const [timeLeft, setTimeLeft] = useState(50);
  const { room } = useGameContext();

  // Timer effect
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, []);

  return (
    <div className="max-md:hidden w-64 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-green-100 text-black p-3">
      {room?.gameState === "waiting" && (
        <p className="text-center">Waiting for players to join...</p>
      )}

      {room?.gameState === "roundEnd" && (
        <p className="text-center">Round ended! Preparing next round...</p>
      )}

      {room?.gameState === "gameEnd" && (
        <p className="text-center">Game over! Check the final scores.</p>
      )}

      {room?.gameState === "playing" && (
        <div className="flex items-center bg-green-100">
          <div className="bg-green-200 rounded-full w-12 h-12 flex items-center justify-center font-bold text-green-700 animate-pulse-slow font-ghibli">
            {timeLeft}
          </div>
          <div className="ml-3 font-bold font-ghibli text-green-800">
            Round {room?.currentRound} of {room?.totalRounds}
          </div>
        </div>
      )}
      {/* Leaderboard */}
      <PlayersList />
    </div>
  );
}
