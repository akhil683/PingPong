"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Settings, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";

import Logo from "../logo";
import GameLeaderboard from "./game-leaderboard";
import GameChat from "./game-chat";

import {
  tools,
  Tool,
  initialMessages,
  Message,
  players,
  colors,
} from "../../constants/GameTools";
import ToolSelection from "../tools/tool-selection";
import ColorSelection from "../tools/color-selection";
import BrushSelection from "../tools/brush-selection";
import GhibliAvatar from "../ghibli-avatar";
import AnimatedBackground from "../animated-background";

export default function GamePage() {
  // Game state
  const [currentRound, setCurrentRound] = useState(3);
  const [totalRounds, setTotalRounds] = useState(3);
  const [timeLeft, setTimeLeft] = useState(50);
  const [currentWord, setCurrentWord] = useState("__________");
  const [guessInput, setGuessInput] = useState("");

  // Drawing state
  const [currentTool, setCurrentTool] = useState<Tool>("pen");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const brushSizes = [2, 5, 10, 15, 25, 35];

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Canvas drawing functionality
  useEffect(() => {
    // Get canvas element and context
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Drawing state variables
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let startX = 0;
    let startY = 0;

    // Create a temporary canvas for shape drawing
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Function to resize canvas
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      // Get the available space
      const width = parent.clientWidth;
      const height = parent.clientHeight - 40; // Leave space for tools

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      tempCanvas.width = width;
      tempCanvas.height = height;

      // Fill with white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Save the canvas state to localStorage for persistence
      saveCanvasState();
    };

    // Initialize canvas
    resizeCanvas();

    // Try to restore previous canvas state
    restoreCanvasState();

    // Save canvas state to localStorage
    function saveCanvasState() {
      try {
        if (!canvas) return;
        localStorage.setItem("skribblCanvasState", canvas.toDataURL());
      } catch (e) {
        console.error("Error saving canvas state:", e);
      }
    }

    // Restore canvas state from localStorage
    function restoreCanvasState() {
      try {
        const savedState = localStorage.getItem("skribblCanvasState");
        if (savedState && ctx) {
          const img = document.createElement("img");

          img.onload = function () {
            ctx.drawImage(img, 0, 0);

            // Also update the temp canvas when restoring
            if (tempCtx) {
              tempCtx.drawImage(img, 0, 0);
            }
          };

          img.src = savedState;
        }
      } catch (error) {
        console.error("Error restoring canvas state:", error);
      }
    }

    // Start drawing
    function startDraw(e: MouseEvent | TouchEvent) {
      isDrawing = true;

      // Get coordinates
      const coords = getCoordinates(e);
      startX = coords.x;
      startY = coords.y;
      lastX = coords.x;
      lastY = coords.y;

      // For shapes, save the current canvas state to the temp canvas
      if (
        currentTool !== "pen" &&
        currentTool !== "eraser" &&
        tempCtx &&
        canvas
      ) {
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);
      }

      // For pen and eraser, start the path
      if (currentTool === "pen" || currentTool === "eraser") {
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);

        // Set drawing properties
        setDrawingProperties(ctx);

        // Draw a dot for single clicks
        ctx.lineTo(coords.x + 0.1, coords.y + 0.1);
        ctx.stroke();
      }
    }

    // Draw
    function draw(e: MouseEvent | TouchEvent) {
      if (!isDrawing) return;

      // Get coordinates
      const coords = getCoordinates(e);

      if (currentTool === "pen" || currentTool === "eraser") {
        // Draw line for pen/eraser
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(coords.x, coords.y);

        // Set drawing properties
        setDrawingProperties(ctx);

        ctx.stroke();
      } else {
        // For shapes, restore original state and draw preview
        if (!ctx || !canvas || !tempCtx) return;

        // First restore the original image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);

        // Then draw the shape on top
        ctx.beginPath();
        setDrawingProperties(ctx);
        drawShape(ctx, startX, startY, coords.x, coords.y);
        ctx.stroke();
      }

      // Update last position
      lastX = coords.x;
      lastY = coords.y;
    }

    // End drawing
    function endDraw() {
      if (!isDrawing) return;
      isDrawing = false;

      // Save the canvas state
      saveCanvasState();

      // Update temp canvas with the current state
      if (tempCtx && canvas) {
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);
      }
    }

    // Helper function to get coordinates from mouse or touch event
    function getCoordinates(e: MouseEvent | TouchEvent) {
      if (!e || !canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;

      if (e instanceof TouchEvent && e.touches.length > 0) {
        const touch = e.touches[0];
        if (!touch) return { x: 0, y: 0 };
        // Touch event
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else if (e instanceof MouseEvent) {
        // Mouse event
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return { x: 0, y: 0 };
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    }

    // Helper function to set drawing properties
    function setDrawingProperties(context: CanvasRenderingContext2D) {
      if (currentTool === "eraser") {
        context.globalCompositeOperation = "destination-out";
        context.strokeStyle = "rgba(255,255,255,1)";
      } else {
        context.globalCompositeOperation = "source-over";
        context.strokeStyle = currentColor;
      }

      context.lineWidth = brushSize;
      context.lineCap = "round";
      context.lineJoin = "round";
    }

    // Helper function to draw shapes
    function drawShape(
      context: CanvasRenderingContext2D,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
    ) {
      switch (currentTool) {
        case "rectangle":
          context.rect(x1, y1, x2 - x1, y2 - y1);
          break;

        case "square":
          const size = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
          const newX = x2 > x1 ? x1 : x1 - size;
          const newY = y2 > y1 ? y1 : y1 - size;
          context.rect(newX, newY, size, size);
          break;

        case "circle":
          const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          context.arc(x1, y1, radius, 0, Math.PI * 2);
          break;

        case "triangle":
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.lineTo(x1 - (x2 - x1), y2);
          context.closePath();
          break;
      }
    }

    // Clear canvas function
    window.clearCanvas = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Also clear temp canvas
      if (tempCtx) {
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.fillStyle = "#ffffff";
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      }

      saveCanvasState();
    };

    // Important: When component mounts or tool/color/size changes, update tempCanvas
    // This ensures we don't lose previous drawings when switching tools
    if (canvas && tempCtx) {
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(canvas, 0, 0);
    }

    // Event listeners
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startDraw(e);
    });

    window.addEventListener("mousemove", draw);
    window.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        draw(e);
      },
      { passive: false },
    );

    window.addEventListener("mouseup", endDraw);
    window.addEventListener("touchend", endDraw);

    window.addEventListener("resize", resizeCanvas);

    // Cleanup
    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("touchstart", startDraw);

      window.removeEventListener("mousemove", draw);
      window.removeEventListener("touchmove", draw);

      window.removeEventListener("mouseup", endDraw);
      window.removeEventListener("touchend", endDraw);

      window.removeEventListener("resize", resizeCanvas);

      delete window.clearCanvas;
    };
  }, [currentTool, currentColor, brushSize]);
  // Clear canvas handler
  const clearCanvas = () => {
    if (window.clearCanvas) {
      window.clearCanvas();
    }
  };

  // Send message handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guessInput.trim()) return;

    setMessages([
      ...messages,
      {
        type: "message",
        player: "poing (You)",
        content: guessInput,
        color: "#ff4040",
      },
    ]);

    setGuessInput("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      {/* Logo */}
      <div className="text-4xl flex justify-center py-2 relative z-10">
        <Logo />
      </div>

      {/* Main Game Area */}
      <div className="flex flex-1 px-4 pb-4 gap-4 relative z-10">
        {/* Left Sidebar - Player List */}
        <GameLeaderboard
          timeLeft={timeLeft}
          totalRounds={totalRounds}
          currentRound={currentRound}
          players={players}
        />

        {/* Main Game Content */}
        <div className="flex-1 flex flex-col">
          {/* Word to Guess */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 mb-2 flex flex-col items-center shadow-xl border border-white/20">
            <div className="text-gray-700 font-bold mb-1">GUESS THIS</div>
            <div className="text-2xl tracking-widest font-bold text-black">
              {currentWord}
            </div>
          </div>

          {/* Game Area with Canvas and Chat */}
          <div className="flex-1 flex gap-2 max-md:flex-col">
            {/* Drawing Canvas */}
            <div className="flex-1 max-md:min-h-[40vh] bg-white rounded-lg overflow-hidden relative shadow-xl border border-white/20">
              {/* Thumbs up/down */}
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button className="p-1 bg-green-100 rounded-full hover:bg-green-200 transition-colors">
                  <ThumbsUp className="w-6 h-6 text-green-600" />
                </button>
                <button className="p-1 bg-red-100 rounded-full hover:bg-red-200 transition-colors">
                  <ThumbsDown className="w-6 h-6 text-red-600" />
                </button>
              </div>

              {/* Canvas */}
              <div className="w-full h-full relative">
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 h-full touch-none"
                  style={{ cursor: "crosshair" }}
                />
              </div>

              {/* Drawing Tools */}
              <div className="absolute bottom-0 left-0 right-0 bg-yellow-50/90 backdrop-blur-sm p-3 flex flex-wrap items-center gap-2 border-t border-yellow-100">
                {/* Tool Selection */}
                <ToolSelection
                  tools={tools}
                  currentTool={currentTool}
                  setCurrentTool={setCurrentTool}
                />

                {/* Color Selection */}
                <ColorSelection
                  colors={colors}
                  currentColor={currentColor}
                  currentTool={currentTool}
                  setCurrentTool={setCurrentTool}
                  setCurrentColor={setCurrentColor}
                />

                {/* Brush Size Selection */}
                <BrushSelection
                  brushSizes={brushSizes}
                  brushSize={brushSize}
                  setBrushSize={setBrushSize}
                  currentColor={currentColor}
                  currentTool={currentTool}
                />

                {/* Clear Button */}
                <button
                  className="px-4 py-2 bg-red-400 text-white rounded-full hover:bg-red-500 transition-colors transform hover:scale-105 active:scale-95 flex items-center gap-1 font-ghibli"
                  onClick={clearCanvas}
                >
                  <Trash2 size={16} />
                  Clear
                </button>
              </div>
            </div>

            {/* Chat Container */}
            <GameChat
              chatContainerRef={chatContainerRef}
              messages={messages}
              guessInput={guessInput}
              setGuessInput={setGuessInput}
              handleSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>

      {/* Settings Button */}
      <button className="absolute top-2 right-2 cursor-pointer bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors z-20">
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
}

// Add clearCanvas to Window interface
declare global {
  interface Window {
    clearCanvas?: () => void;
  }
}
