import {
  Circle,
  Eraser,
  Pencil,
  RectangleVertical,
  Square,
  Triangle,
} from "lucide-react";

type MessageType = "system" | "message";

export type Tool =
  | "pen"
  | "eraser"
  | "rectangle"
  | "square"
  | "circle"
  | "triangle";

export interface Message {
  type: MessageType;
  currentPlayer?: string;
  content: string;
  correctWord?: string;
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

export const initialMessages: Message[] = [
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
  { type: "system", content: "Round 3 of 3" },
  { type: "system", content: "Aryaaa is drawing now!" },
];

export const players: Player[] = [
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
export const colors: string[] = [
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

export const tools = [
  {
    id: "pen" as Tool,
    icon: <Pencil size={20} />,
    label: "Pen",
  },
  {
    id: "eraser" as Tool,
    icon: <Eraser size={20} />,
    label: "Eraser",
  },
  {
    id: "rectangle" as Tool,
    icon: <RectangleVertical size={20} />,
    label: "Rectangle",
  },
  {
    id: "square" as Tool,
    icon: <Square size={20} />,
    label: "Square",
  },
  {
    id: "circle" as Tool,
    icon: <Circle size={20} />,
    label: "Circle",
  },
  {
    id: "triangle" as Tool,
    icon: <Triangle size={20} />,
    label: "Triangle",
  },
];
