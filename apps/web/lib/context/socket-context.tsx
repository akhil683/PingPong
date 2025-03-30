"use client"
import { Message } from "postcss"
import React, { useCallback, useEffect, useContext, useState } from "react"
import { io, Socket } from "socket.io-client"

interface SocketProviderProps {
  children?: React.ReactNode
}
interface MessageType {
  type: string,
  player: string,
  content: string,
  color: string,
  isDrawing?: string
}

interface ISocketContext {
  sendMessage: (msg: MessageType) => any;
}

const SocketContext = React.createContext<ISocketContext | null>(null)

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>()

  const sendMessage: ISocketContext["sendMessage"] = useCallback((message) => {
    console.log("Send Message", message.content)
    if (socket) {
      socket.emit("event:message", message)
    }
  }, [socket])

  const onMessageReceived = useCallback((message: string) => {
    console.log("From the server:", message)
  }, [])

  useEffect(() => {
    const _socket = io("http://localhost:8000")
    _socket.on("message", onMessageReceived)
    setSocket(_socket)

    return () => {
      _socket.disconnect()
      _socket.off()
      setSocket(undefined)
    }
  }, [])

  return (
    <SocketContext.Provider value={{ sendMessage }}>
      {children}
    </SocketContext.Provider>

  )
}

export const useSocket = () => {
  const state = useContext(SocketContext)
  if (!state) throw new Error(`State is undefined`)

  return state
}
