import { Player } from "../../constants/GameTools";
import GhibliAvatar from "../ghibli-avatar";

interface PropType {
  timeLeft: number;
  currentRound: number;
  totalRounds: number;
  players: Player[];
}

export default function GameLeaderboard({
  timeLeft,
  currentRound,
  totalRounds,
  players,
}: PropType) {
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

      <div className="divide-y divide-green-50">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center p-3 ${player.isDrawing ? "bg-green-50" : ""} ${player.isDrawing ? "animate-pulse-slow" : ""}`}
          >
            <div className="w-8 text-right font-bold text-green-700 mr-2 font-ghibli">
              #{player.id}
            </div>
            <div className="relative w-10 h-10 flex-shrink-0">
              <GhibliAvatar color={player.color} />
            </div>
            <div className="ml-2 flex-1 overflow-hidden">
              <div className="font-bold truncate font-ghibli text-green-800">
                {player.name}
              </div>
              <div className="text-sm text-green-600 font-ghibli">
                {player.points} points
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
