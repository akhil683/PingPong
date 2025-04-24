"use client";
import React, { useCallback, useEffect, useContext, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "../../constants/GameTools";

interface SocketProviderProps {
  children?: React.ReactNode;
}

interface ISocketContext {
  sendMessage: (msg: Message) => any;
  messages: Message[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (message) => {
      console.log("Send Message", message);
      if (socket) {
        socket.emit("event:message", message);
      }
    },
    [socket],
  );

  const onMessageReceived = useCallback((msg: string) => {
    console.log("From the server:", msg);
    let newMessage;
    try {
      newMessage = typeof msg === "string" ? JSON.parse(msg) : msg;
    } catch (error) {
      console.error("Failed to parse message:", msg, error);
      return;
    }
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  useEffect(() => {
    const _socket = io("http://localhost:5000");
    _socket.on("message", onMessageReceived);
    setSocket(_socket);

    return () => {
      _socket.disconnect();
      _socket.off();
      setSocket(undefined);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error(`State is undefined`);

  return state;
};
