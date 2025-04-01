export default function Avatar({ color }: { color: string }) {
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
