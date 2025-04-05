import { Dispatch, SetStateAction } from "react";
import { Tool } from "../../constants/GameTools";

interface PropType {
  brushSizes: number[];
  brushSize: number;
  setBrushSize: Dispatch<SetStateAction<number>>;
  currentTool: Tool;
  currentColor: string;
}

export default function BrushSelection({
  brushSizes,
  brushSize,
  setBrushSize,
  currentTool,
  currentColor,
}: PropType) {
  return (
    <div className="flex gap-1 mr-2">
      {brushSizes.map((size) => (
        <button
          key={size}
          className={`md:w-8 w-6 md:h-8 h-6 rounded-full flex items-center justify-center bg-white ${brushSize === size ? "ring-2 ring-yellow-400 transform scale-110 transition-transform" : "hover:scale-105 transition-transform"}`}
          style={{ border: "1px solid #fef9c3" }}
          onClick={() => setBrushSize(size)}
        >
          <div
            className="rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor:
                currentTool === "eraser" ? "#888888" : currentColor,
            }}
          />
        </button>
      ))}
    </div>
  );
}
