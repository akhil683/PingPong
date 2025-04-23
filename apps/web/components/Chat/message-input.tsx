import { Send } from "lucide-react";
import React, { useState } from "react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  placeholderText: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled,
  placeholderText,
}) => {
  const [message, setMessage] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-pink-100 p-3 flex items-center"
    >
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          placeholder={placeholderText}
          className="flex-1 placeholder:text-gray-400 text-gray-700 p-2 rounded-full border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 font-ghibli text-sm"
        />
        <button
          type="submit"
          disabled={disabled}
          className="bg-pink-400 text-white p-2 rounded-full hover:bg-pink-500 transition-colors ml-2"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
};
export default MessageInput;
