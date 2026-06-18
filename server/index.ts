import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // We'll restrict this to the web app URL in production
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'SkillSphere Realtime Engine' });
});

// REST API for Next.js to trigger notifications
app.post('/api/notify', (req, res) => {
  const { targetClerkId, notification } = req.body;
  if (!targetClerkId || !notification) {
    return res.status(400).json({ error: 'Missing targetClerkId or notification' });
  }
  
  // Emit to the specific user's private room
  io.to(targetClerkId).emit('new_notification', notification);
  res.json({ success: true, delivered: true });
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join private user room for notifications if clerkId is provided
  const clerkId = socket.handshake.query.clerkId as string;
  if (clerkId) {
    socket.join(clerkId);
    console.log(`User joined private room: ${clerkId}`);
  }

  socket.on('join_room', (data) => {
    socket.join(data.gigId);
    console.log(`User joined room: ${data.gigId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.gigId).emit('receive_message', data);
  });

  socket.on('typing_start', (data) => {
    socket.to(data.gigId).emit('typing_start', data);
  });

  socket.on('typing_stop', (data) => {
    socket.to(data.gigId).emit('typing_stop', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 SkillSphere Socket Server running on port ${PORT}`);
});
