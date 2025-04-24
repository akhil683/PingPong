"use client";

import type React from "react";

import { useState } from "react";
import { Modal } from "../ui/Modal";
import {
  Users,
  Clock,
  Repeat,
  Gamepad2,
  BookText,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  // Form state
  const [players, setPlayers] = useState("8");
  const [language, setLanguage] = useState("English");
  const [drawTime, setDrawTime] = useState("80");
  const [rounds, setRounds] = useState("3");
  const [gameMode, setGameMode] = useState("Normal");
  const [wordCount, setWordCount] = useState("3");
  const [hints, setHints] = useState("2");
  const [customWords, setCustomWords] = useState("");
  const [useCustomWordsOnly, setUseCustomWordsOnly] = useState(false);

  // Dropdown options
  const playerOptions = ["2", "3", "4", "5", "6", "7", "8", "10", "12", "15"];
  const languageOptions = [
    "English",
    "Español",
    "Français",
    "Deutsch",
    "Português",
    "Italiano",
  ];
  const drawTimeOptions = [
    "30",
    "40",
    "50",
    "60",
    "70",
    "80",
    "90",
    "100",
    "120",
    "150",
    "180",
  ];
  const roundOptions = ["2", "3", "4", "5", "6", "7", "8", "10"];
  const gameModeOptions = ["Normal", "Custom Words", "Speed", "Relay"];
  const wordCountOptions = ["1", "2", "3", "4", "5"];
  const hintOptions = ["0", "1", "2", "3"];

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle room creation logic here
    console.log({
      players,
      language,
      drawTime,
      rounds,
      gameMode,
      wordCount,
      hints,
      customWords,
      useCustomWordsOnly,
    });
    onClose();
  };

  // Custom dropdown component
  const Dropdown = ({
    value,
    onChange,
    options,
    icon,
  }: {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    icon: React.ReactNode;
  }) => {
    return (
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-green-800">
          {icon}
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-full border border-green-200 bg-white/80 py-3 pl-10 pr-10 font-ghibli focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-300 text-green-800"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-green-600">
          <ChevronDown size={18} />
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Private Room"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Players */}
          <div className="space-y-2">
            <label className="block text-sm font-ghibli text-green-700">
              Players
            </label>
            <Dropdown
              value={players}
              onChange={setPlayers}
              options={playerOptions}
              icon={<Users size={18} />}
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="block text-sm font-ghibli text-green-700">
              Language
            </label>
            <Dropdown
              value={language}
              onChange={setLanguage}
              options={languageOptions}
              icon={<BookText size={18} />}
            />
          </div>

          {/* Draw Time */}
          <div className="space-y-2">
            <label className="block text-sm font-ghibli text-green-700">
              Draw Time (seconds)
            </label>
            <Dropdown
              value={drawTime}
              onChange={setDrawTime}
              options={drawTimeOptions}
              icon={<Clock size={18} />}
            />
          </div>

          {/* Rounds */}
          <div className="space-y-2">
            <label className="block text-sm font-ghibli text-green-700">
              Rounds
            </label>
            <Dropdown
              value={rounds}
              onChange={setRounds}
              options={roundOptions}
              icon={<Repeat size={18} />}
            />
          </div>

          {/* Game Mode */}
          <div className="space-y-2">
            <label className="block text-sm font-ghibli text-green-700">
              Game Mode
            </label>
            <Dropdown
              value={gameMode}
              onChange={setGameMode}
              options={gameModeOptions}
              icon={<Gamepad2 size={18} />}
            />
          </div>

          {/* Word Count */}
          <div className="space-y-2">
            <label className="block text-sm font-ghibli text-green-700">
              Word Count
            </label>
            <Dropdown
              value={wordCount}
              onChange={setWordCount}
              options={wordCountOptions}
              icon={<BookText size={18} />}
            />
          </div>

          {/* Hints */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-ghibli text-green-700">
              Hints
            </label>
            <Dropdown
              value={hints}
              onChange={setHints}
              options={hintOptions}
              icon={<HelpCircle size={18} />}
            />
          </div>
        </div>

        {/* Custom Words */}
        {/* <div className="space-y-2"> */}
        {/* <div className="flex items-center justify-between"> */}
        {/* <label className="block text-sm font-ghibli text-green-700"> */}
        {/*   Custom Words */}
        {/* </label> */}
        {/* <div className="flex items-center"> */}
        {/*   <input */}
        {/*     type="checkbox" */}
        {/*     id="useCustomWordsOnly" */}
        {/*     checked={useCustomWordsOnly} */}
        {/*     onChange={(e) => setUseCustomWordsOnly(e.target.checked)} */}
        {/*     className="h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500" */}
        {/*   /> */}
        {/*   <label */}
        {/*     htmlFor="useCustomWordsOnly" */}
        {/*     className="ml-2 text-sm font-ghibli text-green-700" */}
        {/*   > */}
        {/*     Use custom words only */}
        {/*   </label> */}
        {/* </div> */}
        {/* </div> */}
        {/* <textarea */}
        {/*   value={customWords} */}
        {/*   onChange={(e) => setCustomWords(e.target.value)} */}
        {/*   placeholder="Minimum of 10 words. 1-32 characters per word! 20000 characters maximum. Separated by a , (comma)" */}
        {/*   className="w-full rounded-xl border border-green-200 bg-white/80 p-3 font-ghibli text-sm focus:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-300 placeholder:text-green-600 text-green-800" */}
        {/*   rows={6} */}
        {/* /> */}
        {/* </div> */}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-ghibli py-3 px-6 rounded-full text-lg transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 duration-200 flex items-center justify-center"
          >
            Create
          </button>
          {/* <button */}
          {/*   type="button" */}
          {/*   className="flex-1 bg-blue-400 hover:bg-blue-500 text-white font-ghibli py-3 px-6 rounded-full text-lg transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 duration-200 flex items-center justify-center gap-2" */}
          {/* > */}
          {/*   <Link size={20} /> */}
          {/*   Invite */}
          {/* </button> */}
        </div>
      </form>
    </Modal>
  );
}
