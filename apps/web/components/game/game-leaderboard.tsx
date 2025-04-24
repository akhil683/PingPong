import { useEffect, useState } from "react";
import { Player } from "../../constants/GameTools";
import GhibliAvatar from "../ghibli-avatar";
import PlayersList from "../players/player-list";

interface PropType {
  currentRound: number;
  totalRounds: number;
  players: Player[];
}

export default function GameLeaderboard({
  currentRound,
  totalRounds,
  players,
}: PropType) {
  const [timeLeft, setTimeLeft] = useState(50);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-md:hidden w-64 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-green-100">
      <div className="flex items-center bg-green-100 p-3">
        <div className="bg-green-200 rounded-full w-12 h-12 flex items-center justify-center font-bold text-green-700 animate-pulse-slow font-ghibli">
          {timeLeft}
        </div>
        <div className="ml-3 font-bold font-ghibli text-green-800">
          Round {currentRound} of {totalRounds}
        </div>
      </div>

      {/* Leaderboard */}
      <PlayersList />
    </div>
  );
}
