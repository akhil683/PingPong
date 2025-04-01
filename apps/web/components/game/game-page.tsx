"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Settings,
  ThumbsUp,
  ThumbsDown,
  Send,
  Square,
  Circle,
  Triangle,
  RectangleVertical,
  Pencil,
  Eraser,
  Trash2,
} from "lucide-react";
import Logo from "../logo";
import GameLeaderboard from "./game-leaderboard";

// Define types for better type safety
type Tool = "pen" | "eraser" | "rectangle" | "square" | "circle" | "triangle";
type MessageType = "system" | "message";

export interface Message {
  type: MessageType;
  content: string;
  player?: string;
  color?: string;
}

export interface Player {
  id: number;
  name: string;
  points: number;
  color: string;
  avatar: string;
  isDrawing?: boolean;
}

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

  // Messages and chat
  const [messages, setMessages] = useState<Message[]>([
    { type: "system", content: "Game started! Round 1 of 3" },
    { type: "system", content: "Aryaaa is drawing now!" },
    {
      type: "message",
      player: "Ishish",
      content: "is it a car?",
      color: "#ffff00",
    },
    {
      type: "message",
      player: "Nrivy",
      content: "looks like a house",
      color: "#ffff00",
    },
    { type: "system", content: "hi is close to the answer!" },
    { type: "message", player: "hi", content: "building?", color: "#66ffff" },
    {
      type: "message",
      player: "Rmmmmmmmmmm",
      content: "maybe a castle?",
      color: "#66ffff",
    },
    {
      type: "message",
      player: "inschool",
      content: "tower!",
      color: "#333333",
    },
    { type: "system", content: "inschool guessed the word!" },
    {
      type: "message",
      player: "X-Ray",
      content: "nice one!",
      color: "#ff8800",
    },
    {
      type: "message",
      player: "poing (You)",
      content: "good job",
      color: "#ff4040",
    },
    { type: "system", content: "Round 2 of 3" },
    { type: "system", content: "inschool is drawing now!" },
    {
      type: "message",
      player: "Ishish",
      content: "is that a dog?",
      color: "#ffff00",
    },
    { type: "message", player: "hi", content: "cat maybe?", color: "#66ffff" },
    { type: "system", content: "Ishish guessed the word!" },
    { type: "system", content: "Round 3 of 3" },
    { type: "system", content: "Aryaaa is drawing now!" },
  ]);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Players
  const players: Player[] = [
    { id: 4, name: "Ishish", points: 2870, color: "#ffff00", avatar: "yellow" },
    { id: 7, name: "Nrivy", points: 225, color: "#ffff00", avatar: "yellow" },
    { id: 3, name: "hi", points: 2980, color: "#66ffff", avatar: "cyan" },
    {
      id: 15,
      name: "Rmmmmmmmmmm",
      points: 3680,
      color: "#66ffff",
      avatar: "cyan",
    },
    { id: 2, name: "inschool", points: 3390, color: "#333333", avatar: "gray" },
    {
      id: 5,
      name: "Aryaaa",
      points: 1360,
      color: "#cc44cc",
      avatar: "purple",
      isDrawing: true,
    },
    { id: 6, name: "X-Ray", points: 455, color: "#ff8800", avatar: "orange" },
    { id: 8, name: "poing (You)", points: 0, color: "#ff4040", avatar: "red" },
  ];

  // Available colors and tools
  const colors = [
    "#000000",
    "#444444",
    "#888888",
    "#cccccc",
    "#ffffff",
    "#ff4040",
    "#ff8800",
    "#ffff00",
    "#44cc44",
    "#66ffff",
    "#4444ff",
    "#cc44cc",
    "#ff88cc",
    "#884400",
    "#44aaaa",
  ];

  const brushSizes = [2, 5, 10, 15, 25, 35];

  const tools = [
    { id: "pen" as Tool, icon: <Pencil size={20} />, label: "Pen" },
    { id: "eraser" as Tool, icon: <Eraser size={20} />, label: "Eraser" },
    {
      id: "rectangle" as Tool,
      icon: <RectangleVertical size={20} />,
      label: "Rectangle",
    },
    { id: "square" as Tool, icon: <Square size={20} />, label: "Square" },
    { id: "circle" as Tool, icon: <Circle size={20} />, label: "Circle" },
    { id: "triangle" as Tool, icon: <Triangle size={20} />, label: "Triangle" },
  ];

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
    function startDraw(e) {
      isDrawing = true;

      // Get coordinates
      const coords = getCoordinates(e);
      startX = coords.x;
      startY = coords.y;
      lastX = coords.x;
      lastY = coords.y;

      // For shapes, save the current canvas state to the temp canvas
      if (currentTool !== "pen" && currentTool !== "eraser") {
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
    function draw(e) {
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
      if (tempCtx) {
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);
      }
    }

    // Helper function to get coordinates from mouse or touch event
    function getCoordinates(e) {
      if (!e || !canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;

      if (e.touches && e.touches.length > 0) {
        // Touch event
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.clientX !== undefined && e.clientY !== undefined) {
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
    function setDrawingProperties(context) {
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
    function drawShape(context, x1, y1, x2, y2) {
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
    <div className="min-h-screen flex flex-col bg-blue-800">
      {/* Logo */}
      <div className="text-4xl flex justify-center py-2 relative z-10">
        <Logo />
      </div>

      {/* Main Game Area */}
      <div className="flex flex-1 px-4 pb-4 gap-4 relative z-10">
        {/* Left Sidebar - Player List */}
        <GameLeaderboard
          timeLeft={timeLeft}
          currentRound={currentRound}
          totalRounds={totalRounds}
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
          <div className="flex-1 flex gap-2">
            {/* Drawing Canvas */}
            <div className="flex-1 bg-white rounded-lg overflow-hidden relative shadow-xl border border-white/20">
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
                  className="absolute top-0 left-0 touch-none"
                  style={{ cursor: "crosshair" }}
                />
              </div>

              {/* Drawing Tools */}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-100/90 backdrop-blur-sm p-2 flex flex-wrap items-center gap-2 border-t border-gray-200">
                {/* Tool Selection */}
                <div className="flex gap-1 mr-3">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      className={`w-8 h-8 rounded-sm flex items-center justify-center ${currentTool === tool.id ? "bg-blue-100 ring-2 ring-blue-500" : "bg-white"} hover:bg-blue-50 transition-colors`}
                      style={{ border: "1px solid #ccc" }}
                      onClick={() => setCurrentTool(tool.id)}
                      title={tool.label}
                    >
                      {tool.icon}
                    </button>
                  ))}
                </div>

                {/* Color Selection */}
                <div className="flex flex-wrap gap-1 mr-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-sm flex items-center justify-center ${currentColor === color ? "ring-2 ring-blue-500 transform scale-110 transition-transform" : "hover:scale-105 transition-transform"}`}
                      style={{
                        backgroundColor: color,
                        border: "1px solid #ccc",
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

                {/* Brush Size Selection */}
                <div className="flex gap-1 mr-2">
                  {brushSizes.map((size) => (
                    <button
                      key={size}
                      className={`w-8 h-8 rounded-sm flex items-center justify-center bg-white ${brushSize === size ? "ring-2 ring-blue-500 transform scale-110 transition-transform" : "hover:scale-105 transition-transform"}`}
                      style={{ border: "1px solid #ccc" }}
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

                {/* Clear Button */}
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors transform hover:scale-105 active:scale-95 flex items-center gap-1"
                  onClick={clearCanvas}
                >
                  <Trash2 size={16} />
                  Clear
                </button>
              </div>
            </div>

            {/* Chat Container */}
          </div>
        </div>

        {/* Settings Button */}
        <button className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors z-20">
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

// Add clearCanvas to Window interface
declare global {
  interface Window {
    clearCanvas?: () => void;
  }
}

function Avatar({ color }: { color: string }) {
  return (
    <div className="relative w-full h-full">
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
      ></div>
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-3/5 h-1/5 bg-white rounded-full flex justify-center items-center">
        <div className="w-1/2 h-3/4 bg-black rounded-full"></div>
      </div>
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-2/5 h-1/6 bg-black rounded-full"></div>
    </div>
  );
}
