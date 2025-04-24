import type { Metadata } from "next";
import { Patrick_Hand } from "next/font/google";
import { SocketProvider } from "../lib/context/socket-context";

import "./globals.css";
import { ReactScan } from "../lib/utils/react-scan";

const geistSans = Patrick_Hand({
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Ping Pong",
  description: "Scribble with better features, developed by PingPong",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ReactScan />
      <SocketProvider>
        <body className={`${geistSans.className} antialiased`}>{children}</body>
      </SocketProvider>
    </html>
  );
}
