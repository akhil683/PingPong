import { useGameContext } from "../../lib/context/game-context";

export default function GuessBox() {
  const { room, isDrawer, currentWord } = useGameContext();

  if (!room) return null;

  const { gameState, currentRound, totalRounds } = room;

  const maskedWord = () => {
    if (!currentWord) return "";
    return currentWord.replace(/./g, "_ ");
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 mb-2 flex flex-col items-center shadow-xl border border-white/20">
      {gameState === "waiting" && (
        <div className="text-gray-700 font-bold mb-1 max-md:hidden">
          Waiting for players to join..
        </div>
      )}
      {gameState === "playing" && (
        <div className="flex justify-center items-center space-x-2 text-gray-800">
          <p className="font-bold">
            {isDrawer
              ? `Your word: ${currentWord}`
              : currentWord
                ? `Word: ${maskedWord()}`
                : "Guess the word!"}
          </p>
        </div>
      )}

      {gameState === "roundEnd" && <p>Round ended! Preparing next round...</p>}

      {gameState === "gameEnd" && <p>Game over! Check the final scores.</p>}
    </div>
  );
}
