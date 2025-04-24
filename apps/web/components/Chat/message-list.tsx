import React, { useRef, useEffect } from "react";
import { Message } from "../../type";
import MessageItem from "./message-item";

interface MessageListProps {
  messages: Message[];
  currentPlayerId: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentPlayerId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          currentPlayerId={currentPlayerId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
export default MessageList;
