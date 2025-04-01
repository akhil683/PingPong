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
          className={`md:w-8 md:h-8 w-6 h-6 rounded-sm flex items-center justify-center ${currentTool === tool.id ? "bg-blue-500" : "bg-gray-400"} hover:bg-gray-500 transition-colors`}
          style={{ border: "1px solid #ccc" }}
          onClick={() => setCurrentTool(tool.id)}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
