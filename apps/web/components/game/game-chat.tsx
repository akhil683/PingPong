import { Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../lib/context/socket-context";
import { colors } from "../../constants/GameTools";

export default function GameChat() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [guessInput, setGuessInput] = useState("");
  const { sendMessage, messages } = useSocket();

  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(Math.floor(Math.random() * 8));

    if (!guessInput) return;
    sendMessage({
      type: "message",
      currentPlayer: "you",
      player: "poing (You)",
      correctWord: "hi",
      content: guessInput,
      color: colors[Math.floor(Math.random() * 8)],
    });
    setGuessInput("");
  };

  return (
    <div className="h-64 md:h-full md:w-64 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-pink-100 flex flex-col">
      {/* Chat Messages */}
      <div className="w-full relative h-[calc(100%-50px)]">
        <div
          ref={chatContainerRef}
          className="overflow-y-scroll p-2 w-full space-y-2 absolute bottom-0 h-full"
          style={{ maxHeight: "calc(100%)" }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${message.type === "system" ? "text-center italic text-gray-500" : ""}`}
            >
              {message.type === "system" ? (
                <div className="bg-pink-50 rounded-full py-1 px-3 text-sm font-ghibli text-pink-700">
                  {message.content}
                </div>
              ) : (
                <div className="flex items-start">
                  <span
                    className="font-bold mr-1 font-ghibli"
                    style={{ color: message.color }}
                  >
                    {message.player}:
                  </span>
                  <span className="text-gray-800 font-ghibli">
                    {message.content}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-pink-100 p-3 flex items-center"
      >
        <input
          type="text"
          placeholder="Type your guess here..."
          className="flex-1 placeholder:text-gray-400 text-gray-700 p-2 rounded-full border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 font-ghibli text-sm"
          value={guessInput}
          onChange={(e) => setGuessInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-pink-400 text-white p-2 rounded-full hover:bg-pink-500 transition-colors ml-2"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
