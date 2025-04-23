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
      return "bg-gray-200 text-gray-700";
    } else if (message.playerId === currentPlayerId) {
      return "bg-blue-100 text-blue-800";
    } else if (message.isCorrectGuess) {
      return "bg-green-100 text-green-800";
    } else {
      return "bg-gray-100";
    }
  };

  return (
    <div className={`flex-1 p-2 rounded font-ghibli ${getMessageClass()}`}>
      <div className="flex items-center space-x-1">
        <span className="font-bold mr-1">{message.playerName}:</span>
        {message.isSystem && (
          <span className="text-xs bg-gray-400 text-white px-1 rounded">
            SYSTEM
          </span>
        )}
      </div>
      <p className="text-gray-800">{message.message}</p>
    </div>
  );
};
export default MessageItem;
