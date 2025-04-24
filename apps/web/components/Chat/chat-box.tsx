import React from "react";
import MessageList from "./message-list";
import MessageInput from "./message-input";
import { useGameContext } from "../../lib/context/game-context";

const ChatBox: React.FC = () => {
  const { messages, sendMessage, player, isDrawer, room } = useGameContext();

  const gameState = room?.gameState;
  const currentPlayerId = player?.id || "";
  const isInputDisabled = isDrawer && gameState === "playing";
  const placeholderText = isInputDisabled
    ? "You can't guess while drawing"
    : "Type a message...";
  console.log("messages", messages);
  return (
    <div className="h-64 md:h-full md:w-64 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-pink-100 flex flex-col">
      {/* <div className="bg-blue-600 text-white p-2"> */}
      {/*   <h3 className="font-bold">Chat</h3> */}
      {/* </div> */}

      <MessageList messages={messages} currentPlayerId={currentPlayerId} />

      <MessageInput
        onSendMessage={sendMessage}
        disabled={isInputDisabled}
        placeholderText={placeholderText}
      />
    </div>
  );
};

export default ChatBox;
