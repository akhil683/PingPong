import { Dispatch, SetStateAction } from "react";
import { Tool } from "../../constants/GameTools";

interface PropType {
  tools: {
    id: Tool;
    icon: React.ReactNode;
    label: string;
  }[];
  setCurrentTool: Dispatch<SetStateAction<Tool>>;
  currentTool: Tool;
}

export default function ToolSelection({
  tools,
  setCurrentTool,
  currentTool,
}: PropType) {
  return (
    <div className="flex gap-1 mr-3">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`md:w-10 w-8 md:h-10 h-8 text-gray-700 rounded-full flex items-center justify-center ${currentTool === tool.id ? "bg-yellow-200 ring-2 ring-yellow-400" : "bg-white"} hover:bg-yellow-100 transition-colors`}
          style={{ border: "1px solid #fef9c3" }}
          onClick={() => setCurrentTool(tool.id)}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
