import React from "react";
import { useGameContext } from "../../lib/context/game-context";
import PlayerItem from "./player-item";
import { Player } from "../../type";

const PlayersList: React.FC = () => {
  const { room, player } = useGameContext();

  if (!room || !player) return null;

  const { players, hostId, currentDrawer, scores } = room;
  const currentPlayerId = player.id;

  const sortedPlayers = [...players].sort((a: Player, b: Player) => {
    if (a.id === hostId) return -1;
    if (b.id === hostId) return 1;
    if (a.id === currentPlayerId) return -1;
    if (b.id === currentPlayerId) return 1;
    return 0;
  });

  return (
    <div className="space-y-2">
      {sortedPlayers.map((player) => (
        <PlayerItem
          key={player.id}
          player={player}
          hostId={hostId}
          currentPlayerId={currentPlayerId}
          currentDrawer={currentDrawer}
          score={scores[player.id] || 0}
        />
      ))}
    </div>
  );
};

export default PlayersList;
