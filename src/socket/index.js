import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';

let io;
const onlineUsers = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }
    try {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const decoded = verifyAccessToken(cleanToken);
      socket.user = decoded; 
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on('connection', (socket) => {
    console.log(` User connected: ${socket.user.userId} (Socket ID: ${socket.id})`);

    onlineUsers.set(socket.user.userId, socket.id);
    
    socket.join(`user_${socket.user.userId}`);
    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`);
      console.log(`User ${socket.user.userId} joined project room: ${projectId}`);
    });

    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(` User disconnected: ${socket.user.userId}`);
      onlineUsers.delete(socket.user.userId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};