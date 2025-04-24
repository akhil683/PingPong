import GamePage from "../../../components/game/game-page";
import { GameProvider } from "../../../lib/context/game-context";

export default async function Game({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  console.log(gameId);
  return (
    <GameProvider roomId={gameId as string}>
      <GamePage />
    </GameProvider>
  );
}
