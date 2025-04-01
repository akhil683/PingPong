import { Send } from "lucide-react";
import { Ref } from "react";
import { Message } from "./game-page";

interface PropType {
  chatContainerRef: Ref<HTMLDivElement>;
  messages: Message[];
  handleSendMessage: () => void;
  guessInput: string;
  setGuessInput: (guessInput: string) => void;
}

export default function GameChat({
  chatContainerRef,
  messages,
  handleSendMessage,
  guessInput,
  setGuessInput,
}: PropType) {
  return (
    <div className="w-64 bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl border border-white/20 flex flex-col">
      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-2 space-y-2"
        style={{ maxHeight: "calc(100% - 50px)" }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${message.type === "system" ? "text-center italic text-gray-500" : ""}`}
          >
            {message.type === "system" ? (
              <div className="bg-gray-100 rounded py-1 px-2 text-sm">
                {message.content}
              </div>
            ) : (
              <div className="flex items-start">
                <span
                  className="font-bold mr-1"
                  style={{ color: message.color }}
                >
                  {message.player}:
                </span>
                <span className="text-gray-800">{message.content}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 p-2 flex items-center"
      >
        <input
          type="text"
          placeholder="Type your guess here..."
          className="flex-1 p-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={guessInput}
          onChange={(e) => setGuessInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
