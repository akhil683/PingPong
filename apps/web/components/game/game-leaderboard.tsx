import PlayersList from "../players/player-list";
import { useGameContext } from "../../lib/context/game-context";

export default function GameLeaderboard() {
  const { room, player, startGame } = useGameContext();
  const isHost = room?.hostId === player?.id;

  return (
    <div className="max-md:hidden w-64 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-green-100 text-black p-3">
      {room?.gameState === "waiting" && !isHost && (
        <p className="text-center">Waiting for host to start...</p>
      )}{" "}
      {room?.gameState === "roundEnd" && (
        <p className="text-center">Round ended! Preparing next round...</p>
      )}
      {room?.gameState === "gameEnd" && (
        <p className="text-center">Game over! Check the final scores.</p>
      )}
      {isHost && room?.gameState === "waiting" && (
        <button
          onClick={startGame}
          className="bg-blue-600 text-white py-2 rounded-full w-full cursor-pointer"
        >
          Start
        </button>
      )}
      {room?.gameState === "playing" && (
        <div className="flex items-center bg-green-100">
          <div className="bg-green-200 rounded-full w-12 h-12 flex items-center justify-center font-bold text-green-700 animate-pulse-slow font-ghibli">
            {room.timeRemaining}
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
