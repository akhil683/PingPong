import React from "react";
import { useGameContext } from "../../lib/context/game-context";

const GameStatus: React.FC = () => {
  const { room, isDrawer, currentWord } = useGameContext();

  if (!room) return null;

  const { gameState, currentRound, totalRounds } = room;

  // Helper function to mask the word for guessers
  const maskedWord = () => {
    if (!currentWord) return "";
    return currentWord.replace(/./g, "_ ");
  };

  return (
    <div className="bg-gray-200 p-2 text-center">
      {gameState === "waiting" && <p>Waiting for players to join...</p>}

      {gameState === "playing" && (
        <div className="flex justify-center items-center space-x-2">
          <p>
            Round {currentRound} of {totalRounds}
          </p>
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
};

export default GameStatus;
