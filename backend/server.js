import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();
connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("registerUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", () => {
    for (let [userId, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    console.log("User disconnected:", socket.id);
  });

  socket.on("sendMessage", (data) => {
    const receiverSocketId = onlineUsers.get(data.receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", data);
    }
  });
});

const PORT = process.env.PORT || 4040;
server.listen(PORT, () => console.log(` Server running on port ${PORT}`));
