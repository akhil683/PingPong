import Link from "next/link";

export default function Logo() {
  return (
    <Link href={"/"}>
      <h1 className="font-bold">
        <span className="text-red-500">p</span>
        <span className="text-orange-500">i</span>
        <span className="text-yellow-500">n</span>
        <span className="text-green-500">g</span>
        <span className="text-cyan-400">p</span>
        <span className="text-blue-500">o</span>
        <span className="text-yellow-500">n</span>
        <span className="text-orange-500">g</span>
        <span className="text-pink-500">.</span>
        <span className="text-indigo-500">i</span>
        <span className="text-orange-500">o</span>
        {/* <Pencil className="text-yellow-500 h-12 w-12 inline-block" /> */}
        {/* <span className="inline-block ml-2 transform rotate-12"> */}
        {/*   <div className="w-6 h-12 bg-orange-500 rounded-t-sm relative"> */}
        {/*     <div className="absolute top-0 w-6 h-2 bg-yellow-300"></div> */}
        {/*     <div className="absolute bottom-0 left-1/2 w-1 h-3 bg-black transform -translate-x-1/2"></div> */}
        {/*   </div> */}
        {/* </span> */}
      </h1>
    </Link>
  );
}
