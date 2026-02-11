import { create } from "zustand"
import { io, Socket } from "socket.io-client"

type Message = {
  _id: string
  content: string
  createdAt: string
  sender: {
    name: string
  }
}

type ChatStore = {
  socket: Socket | null
  messages: Message[]
  isLoading: boolean
  fetchMessages: (projectId: string) => Promise<void>
  connect: (projectId: string, userEmail: string) => void
  disconnect: () => void
  sendMessage: (content: string) => void
  addMessage: (msg: Message) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  socket: null,
  messages: [],
  isLoading: false,

  connect: (projectId, userEmail) => {
    // already connected do not create a new socket
    if (get().socket) return

    // create a new socket connection with auth
    const socket = io({
      path: "/api/socket",
      auth: { projectId, userEmail },
      transports: ["websocket", "polling"], // force WebSocket and fallback to polling
    })

    socket.on("connect", () => {
      console.log("Socket Connected!", socket.id)
    })

    socket.on("connect_error", (err) => {
      console.error("Socket Connection Error:", err)
    })

    socket.on("message:new", (msg) => {
      set((state) => ({
        messages: [...state.messages, msg],
      }))
    })

    set({ socket })
  },

  disconnect: () => {
    get().socket?.disconnect()
    set({ socket: null, messages: [] })
  },

  sendMessage: (content) => {
    get().socket?.emit("message:send", content)
  },

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  fetchMessages: async (projectId) => {
    set({ isLoading: true })
    try {
      const res = await fetch(`/api/messages/${projectId}`)
      if (!res.ok) throw new Error("Failed to fetch messages")
      const data: Message[] = await res.json()
      set({ messages: data })
    }
    catch (err) {
      console.error("Fetch Messages Error:", err)
    }
    finally {
      set({ isLoading: false })
    }
  }
}))
