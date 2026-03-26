require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const communityRoutes = require('./routes/community');
const merchantRoutes = require('./routes/merchant');
const activityRoutes = require('./routes/activity');
const cooperationRoutes = require('./routes/cooperation');
const messageRoutes = require('./routes/message');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const sponsorRoutes = require('./routes/sponsor');
const tagRoutes = require('./routes/tag');
const sponsorCommentRoutes = require('./routes/sponsorComment');
const salesmanRoutes = require('./routes/salesman');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/cooperation', cooperationRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/sponsor', sponsorRoutes);
app.use('/api/tag', tagRoutes);
app.use('/api/sponsor-comment', sponsorCommentRoutes);
app.use('/api/salesman', salesmanRoutes);

app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });
  
  socket.on('send_message', (data) => {
    io.to(`user_${data.receiverId}`).emit('new_message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: false }).then(() => {
  console.log('数据库连接成功');
  httpServer.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}).catch(err => {
  console.error('数据库连接失败:', err);
});

module.exports = { app, io };
