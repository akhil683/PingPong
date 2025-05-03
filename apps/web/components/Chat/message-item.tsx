import React from "react";
import { Message } from "../../type";

interface MessageItemProps {
  message: Message;
  currentPlayerId: string;
}
const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentPlayerId,
}) => {
  const getMessageClass = () => {
    if (message.isSystem) {
      return "bg-blue-500 text-white";
    } else if (message.playerId === currentPlayerId) {
      return "bg-blue-100 text-blue-800";
    } else if (message.isCorrectGuess) {
      return "bg-green-100 text-green-800";
    } else {
      return "bg-gray-100";
    }
  };

  return (
    <div className={`flex-1 p-2 rounded-full font-ghibli ${getMessageClass()}`}>
      <div className="flex items-center space-x-1">
        {message.isSystem ? (
          <p className="text-sm w-full px-1 text-center">{message.message}</p>
        ) : (
          <span className="font-bold mr-1">{message.playerName}:</span>
        )}
      </div>
      {!message.isSystem && (
        <span className="text-gray-800">{message.message}</span>
      )}
    </div>
  );
};
export default MessageItem;
