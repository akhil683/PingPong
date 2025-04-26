import RoomContent from "../../../components/game/game-content";
import { GameProvider } from "../../../lib/context/game-context";

export default async function Game({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  return (
    <GameProvider roomId={gameId as string}>
      <RoomContent />
    </GameProvider>
  );
}
