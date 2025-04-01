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
    <div className="md:w-64 w-full h-full bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl border border-white/20 flex flex-col">
      {/* Chat Messages */}
      <div className="w-full relative h-[calc(100%-50px)]">
        <div
          ref={chatContainerRef}
          className="overflow-y-scroll p-2 w-full space-y-2 absolute bottom-0 h-full"
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
                    {(message?.player?.length as number) > 8
                      ? `${message.player?.slice(0, 5)}...`
                      : message.player}
                  </span>
                  <span className="text-gray-800">{message.content}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 p-2 bg-white flex items-center"
      >
        <input
          type="text"
          placeholder="Type your guess here..."
          className="flex-1 p-2 rounded-l-md border-2 text-black placeholder:text-gray-600 border-gray-300 focus:border-blue-500 focus:outline-none"
          value={guessInput}
          onChange={(e) => setGuessInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white h-full p-2 rounded-r-md hover:bg-blue-600 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
