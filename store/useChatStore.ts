import { create } from "zustand"
import { io, Socket } from "socket.io-client"
import { toast } from "sonner"

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
  connectedProjectId: string | null
  messages: Message[]
  isLoading: boolean
  fetchMessages: (projectId: string) => Promise<void>
  connect: (projectId: string, userEmail: string) => void
  disconnect: () => void
  sendMessage: (content: string) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  socket: null,
  connectedProjectId: null,
  messages: [],
  isLoading: false,

  connect: (projectId, userEmail) => {
    const { socket, connectedProjectId } = get()

    // Already connected to this exact project — skip
    if (socket && connectedProjectId === projectId) return

    // Different project (or re-mount) — disconnect old socket first
    if (socket) {
      socket.disconnect()
      set({ socket: null, connectedProjectId: null })
    }

    const newSocket = io({
      path: "/api/socket",
      auth: { projectId, userEmail },
      transports: ["websocket", "polling"],
    })

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id)
    })

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message)
    })

    newSocket.on("message:new", (msg: Message) => {
      set((state) => ({ messages: [...state.messages, msg] }))
    })

    set({ socket: newSocket, connectedProjectId: projectId })
  },

  disconnect: () => {
    get().socket?.disconnect()
    set({ socket: null, connectedProjectId: null, messages: [] })
  },

  sendMessage: (content) => {
    const { socket } = get()
    if (!socket?.connected) {
      console.warn("⚠️ Socket not connected — cannot send message")
      toast.error("Not connected to chat. Try refreshing.")
      return
    }
    socket.emit("message:send", content)
  },

  fetchMessages: async (projectId) => {
    set({ isLoading: true })
    try {
      // Hits the Express route in server.ts: GET /api/messages/:projectId
      const res = await fetch(`/api/messages/${projectId}`)
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: ${text}`)
      }
      const data: Message[] = await res.json()
      set({ messages: data })
    } catch (err) {
      console.error("❌ Fetch messages error:", err)
      toast.error("Failed to load messages.")
    } finally {
      set({ isLoading: false })
    }
  },
}))

