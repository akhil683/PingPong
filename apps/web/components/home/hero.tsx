import { AvatarColors } from "../../constants/GameTools";
import AnimatedBackground from "../animated-background";
import GhibliAvatar from "../ghibli-avatar";
import Logo from "../logo";
import MainPanel from "./main-panel";

export default function SkribblClone() {
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
          {AvatarColors.map((color, index) => (
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
      <MainPanel />
    </div>
  );
}
