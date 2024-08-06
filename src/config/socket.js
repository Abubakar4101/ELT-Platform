// socket.js
const { Server } = require('socket.io');
const redisClient = require('./redis');

/**
 * Initialize Socket.io
 * @param {Server} server - HTTP server instance
 */
const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  let joinedWorkspace = '';
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    global.socketId = socket.id;
    // Handle joining a workspace room
    socket.on('joinWorkspace', async (workspaceId) => {
      socket.join(workspaceId);
      joinedWorkspace = workspaceId;
      // Emit missed events from Redis
      const missedEvents = await redisClient.lRange(`missedEvents:${workspaceId.toString()}:${userId}`, 0, -1);
      if (missedEvents) missedEvents.forEach(notification => {
        socket.timeout(5000).emit('notification', JSON.parse(notification));
      });
      console.log(`User joined workspace: ${workspaceId}`);
    });

    socket.on('acknowledged', (acknowledged, userId, notification) => {
      console.log(`User acknowledge: ${acknowledged} , ${userId} , ${notification}, ${joinedWorkspace}`);
      if (acknowledged) {
        redisClient.lRem(`missedEvents:${joinedWorkspace}:${userId}`, 0, JSON.stringify(notification));
      }
    });



    // Handle leaving a workspace room
    socket.on('leaveWorkspace', (workspaceId) => {
      socket.leave(workspaceId);
      console.log(`User left workspace: ${workspaceId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = initSocket;