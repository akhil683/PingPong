import { Send } from "lucide-react";
import { Ref } from "react";
import { Message } from "../../constants/GameTools";

interface PropType {
  chatContainerRef: Ref<HTMLDivElement>;
  messages: Message[];
  handleSendMessage: (e: React.FormEvent) => void;
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
