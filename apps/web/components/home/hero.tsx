"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedBackground from "../animated-background";
import GhibliAvatar from "../ghibli-avatar";
import Logo from "../logo";

export default function SkribblClone() {
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [playerName, setPlayerName] = useState("");

  const nextAvatar = () => {
    setSelectedAvatar((prev) => (prev + 1) % colors.length);
  };

  const prevAvatar = () => {
    setSelectedAvatar((prev) => (prev - 1 + colors.length) % colors.length);
  };

  const handlePlay = () => {
    // Navigate to the game page
    router.push("/game/1");
  };

  const colors = [
    "#ff9d8a",
    "#ffbe7d",
    "#ffe699",
    "#b3e6b3",
    "#a6d9f7",
    "#c7b3e6",
    "#f7c7e6",
    "#f7a6c7",
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Logo */}
      <div className="mb-8 relative">
        <div className="text-6xl flex items-center justify-center">
          <Logo />
        </div>

        {/* Avatar Row */}
        <div className="flex justify-center mt-4">
          {colors.map((color, index) => (
            <div
              key={index}
              className="mx-1 animate-bounce"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <GhibliAvatar color={color} />
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md shadow-xl border border-green-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-200 via-blue-200 to-pink-200"></div>
        <div className="absolute -top-4 -right-4 w-16 h-16">
          <Image
            src="/placeholder.svg?height=64&width=64"
            alt="Leaf decoration"
            width={64}
            height={64}
            className="opacity-30"
          />
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter your name"
            className="flex-1 placeholder:text-gray-500 text-gray-800 px-4 py-3 rounded-full border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/80 font-ghibli text-lg"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          {/* <select className="px-4 py-3 rounded-full border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/80 font-ghibli"> */}
          {/*   <option>English</option> */}
          {/*   <option>Español</option> */}
          {/*   <option>Français</option> */}
          {/*   <option>Deutsch</option> */}
          {/* </select> */}
        </div>

        {/* Avatar Selection */}
        <div className="flex items-center justify-center my-8">
          <button
            onClick={prevAvatar}
            className="bg-green-100 text-green-700 p-2 rounded-full mr-2 hover:bg-green-200 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="relative mx-4 animate-float">
            <GhibliAvatar color={colors[selectedAvatar]} size="large" />
          </div>

          <button
            onClick={nextAvatar}
            className="bg-green-100 text-green-700 p-2 rounded-full ml-2 hover:bg-green-200 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Action Buttons */}
        <button
          className="w-full bg-green-400 hover:bg-green-500 text-white font-ghibli py-4 px-6 rounded-full mb-4 text-2xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0"
          onClick={handlePlay}
        >
          Play!
        </button>

        <button className="w-full bg-blue-400 hover:bg-blue-500 text-white font-ghibli py-4 px-6 rounded-full text-xl transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 duration-200">
          Create Private Room
        </button>

        {/* Decorative grass */}
        <div className="absolute bottom-0 left-0 w-full h-8 overflow-hidden">
          <div className="relative w-full h-full">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 bg-green-400"
                style={{
                  left: `${i * 5}%`,
                  height: `${4 + Math.sin(i) * 2}px`,
                  width: "8px",
                  borderTopLeftRadius: "50%",
                  borderTopRightRadius: "50%",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 font-ghibli">
        "The world is filled with wonders, just waiting to be drawn."
      </div>
    </div>
  );
}
