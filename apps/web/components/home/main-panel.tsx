"use client";

import { useState } from "react";
import Image from "next/image";
import { CreateRoomModal } from "./create-room-modal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GhibliAvatar from "../ghibli-avatar";
import { useRouter } from "next/navigation";
import { AvatarColors as colors } from "../../constants/GameTools";

export default function MainPanel() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  const nextAvatar = () => {
    setSelectedAvatar((prev) => (prev + 1) % colors.length);
  };

  const prevAvatar = () => {
    setSelectedAvatar((prev) => (prev - 1 + colors.length) % colors.length);
  };

  const handleJoinRoom = (e: any) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    if (!roomId.trim()) {
      setError("Room ID is required");
      return;
    }

    // Store username in localStorage
    localStorage.setItem("username", username);

    // Navigate to game room
    router.push(`/game/${roomId}`);
  };

  return (
    <>
      <div className="max-md:px-4">
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
              placeholder="Enter Your Username"
              className="flex-1 placeholder:text-gray-500 text-gray-800 px-4 py-3 rounded-full border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/80 font-ghibli text-lg"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mb-6">
            <input
              type="number"
              placeholder="Enter Game Code"
              className="flex-1 placeholder:text-gray-500 text-gray-800 px-4 py-3 rounded-full border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/80 font-ghibli text-lg"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}

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
            onClick={handleJoinRoom}
          >
            Play!
          </button>
          <button
            className="w-full bg-blue-400 hover:bg-blue-500 text-white font-ghibli py-4 px-6 rounded-full text-xl transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 duration-200"
            onClick={() => setIsCreateRoomModalOpen(true)}
          >
            Create Private Room
          </button>
        </div>
      </div>
      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={() => setIsCreateRoomModalOpen(false)}
      />
    </>
  );
}
