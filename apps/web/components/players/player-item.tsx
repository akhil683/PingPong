import React from "react";
import { Player } from "../../type";
import GhibliAvatar from "../ghibli-avatar";

interface PlayerItemProps {
  player: Player;
  hostId: string;
  currentPlayerId: string;
  currentDrawer: string | null;
  score: number;
}

const PlayerItem: React.FC<PlayerItemProps> = ({
  player,
  hostId,
  currentPlayerId,
  currentDrawer,
  score,
}) => {
  const isHost = player.id === hostId;
  const isCurrentPlayer = player.id === currentPlayerId;
  const isDrawing = player.id === currentDrawer;

  return (
    <div
      className={`flex items-center p-3 ${isDrawing ? "bg-green-50 animate-pulse-slow" : ""}`}
    >
      <div className="w-8 text-right font-bold text-gray-800 mr-2 font-ghibli">
        #1
      </div>
      <div className="relative w-10 h-10 flex-shrink-0">
        <GhibliAvatar color={"#333"} />
      </div>
      <div className="ml-2 flex-1">
        <div className="flex items-center">
          <span className="font-bold text-green-800">{player.username}</span>
          {isHost && (
            <span className="ml-1 text-xs bg-blue-600 text-white px-1 rounded">
              HOST
            </span>
          )}
          {isCurrentPlayer && (
            <span className="ml-1 text-xs bg-green-600 text-white px-1 rounded">
              YOU
            </span>
          )}
        </div>

        <div className="text-sm text-green-600 font-ghibli">{score} points</div>
      </div>
      {isDrawing && (
        <div className="ml-2 text-xs bg-yellow-500 text-white px-1 py-0.5 rounded">
          Drawing
        </div>
      )}
    </div>
  );
};
export default PlayerItem;
