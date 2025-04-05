import { Dispatch, SetStateAction } from "react";
import { Tool } from "../../constants/GameTools";

interface PropType {
  colors: string[];
  currentTool: Tool;
  setCurrentColor: Dispatch<SetStateAction<string>>;
  setCurrentTool: Dispatch<SetStateAction<Tool>>;
  currentColor: string;
}

export default function ColorSelection({
  colors,
  currentTool,
  setCurrentTool,
  setCurrentColor,
  currentColor,
}: PropType) {
  return (
    <div className="flex flex-wrap gap-1 mr-2">
      {colors.map((color) => (
        <button
          key={color}
          className={`md:w-8 w-6 md:h-8 h-6 rounded-full flex items-center justify-center ${currentColor === color ? "ring-2 ring-yellow-400 transform scale-110 transition-transform" : "hover:scale-105 transition-transform"}`}
          style={{
            backgroundColor: color,
            border: "1px solid #fef9c3",
            opacity: currentTool === "eraser" ? 0.5 : 1,
          }}
          onClick={() => {
            setCurrentColor(color);
            if (currentTool === "eraser") {
              setCurrentTool("pen");
            }
          }}
          disabled={currentTool === "eraser"}
        />
      ))}
    </div>
  );
}
