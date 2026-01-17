const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const propertyRoutes = require('./routes/v1/propertyRoutes');
const billingRoutes = require('./routes/v1/billingRoutes');
const zaloRoutes = require('./routes/v1/zaloRoutes');
const revenueRoutes = require('./routes/v1/revenueRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');
const { initCronJobs } = require('./services/cronService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('joinConversation', (conversationId) => {
    console.log(`Socket ${socket.id} joining conversation ${conversationId}`);
    socket.join(conversationId);
  });

  socket.on('sendMessage', (message) => {
    // Gửi tin nhắn đến tất cả client trong cùng conversation room, trừ người gửi
    socket.to(message.conversationId).emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Pass io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/billings', billingRoutes);
app.use('/api/v1/zalo', zaloRoutes);
app.use('/api/v1/revenue', revenueRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Khởi tạo cron jobs sau khi server đã khởi động
  initCronJobs();
}); 