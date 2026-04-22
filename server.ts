// socket server

import express from "express";
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Message from "./models/Message"; 
import User from "./models/User";       

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;




const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const expressApp = express();
  const httpServer = createServer(expressApp);

  // 1. Database Connection
  if (process.env.MONGODB_URI) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🍃 MongoDB Connected via Server");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
    }
  }

  // 2. Request logger
  expressApp.use((req, res, next) => {
    console.log(`📨 Request: ${req.method} ${req.url}`);
    next();
  });

  // 3. API Routes (MUST BE BEFORE NEXT.JS HANDLER)
  expressApp.get("/api/messages/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      console.log(`🔍 Fetching messages for project: ${projectId}`);

      const messages = await Message.find({ project: projectId })
        .sort({ createdAt: 1 })
        .populate("sender", "name email image")
        .lean();

      console.log(`✅ Found ${messages.length} messages`);
      res.json(messages);
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 4. Socket.IO Setup
  const io = new Server(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    const { projectId, userEmail } = socket.handshake.auth;
    if (!projectId || !userEmail) {
        socket.disconnect(); 
        return;
    }

    console.log(`👤 User connected: ${userEmail} -> Project: ${projectId}`);
    socket.join(projectId);

    socket.on("message:send", async (content) => {
      try {
        const user = await User.findOne({ email: userEmail });
        if (!user) return;

        const message = await Message.create({
          project: projectId,
          sender: user._id,
          content,
        });

        io.to(projectId).emit("message:new", {
          _id: message._id,
          content,
          createdAt: message.createdAt,
          sender: { name: user.name },
        });
      } catch (err) {
        console.error("Socket Error:", err);
      }
    });

    socket.on("disconnect", () => {
      socket.leave(projectId);
    });
  });

  // 5. Next.js Handler (Catches everything else)
  // Using .use() handles all HTTP methods (GET, POST, etc.) safely
  expressApp.use((req, res) => {
    return handle(req, res);
  });

  // 6. Start Server
  httpServer.listen(port, (err?: any) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});