export default function GhibliAvatar({
  color,
  size = "small",
}: {
  color: string | undefined;
  size?: string;
}) {
  const sizeClass = size === "large" ? "w-20 h-20" : "w-10 h-10";

  return (
    <div className={`relative ${sizeClass}`}>
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color as string }}
      ></div>

      {/* Eyes */}
      <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-white rounded-full">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-black rounded-full"></div>
      </div>
      <div className="absolute top-1/4 right-1/4 w-1/4 h-1/4 bg-white rounded-full">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-black rounded-full"></div>
      </div>

      {/* Mouth */}
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-1/3 h-1/6 bg-black rounded-full"></div>

      {/* Whiskers */}
      <div className="absolute top-1/2 left-0 w-1/4 h-0.5 bg-black transform -translate-y-1/2 -translate-x-1/5"></div>
      <div className="absolute top-1/2 right-0 w-1/4 h-0.5 bg-black transform -translate-y-1/2 translate-x-1/5"></div>
    </div>
  );
}
