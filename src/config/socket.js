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

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    global.userSockets = {userId: socket.id};

    // Handle joining a workspace room
    socket.on('joinWorkspace', async (workspaceId) => {
      socket.join(workspaceId);
      // Emit missed events from Redis
      const missedEvents = await redisClient.lRange(`missedEvents:${workspaceId.toString()}:${userId}`, 0, -1);
      if (missedEvents) missedEvents.forEach(notification => {
        io.to(workspaceId.toString()).timeout(5000).emit('notification', JSON.parse(notification));

        socket.on('acknowledged', (acknowledged) => {
          console.log(`User acknowledge: ${acknowledged}`);
          if (acknowledged) {
            redisClient.lRem(`missedEvents:${workspaceId}:${userId}`, 0, notification);
          }
        });

      });

      console.log(`User joined workspace: ${workspaceId}`);
    });


    // Handle leaving a workspace room
    socket.on('leaveWorkspace', (workspaceId) => {
      socket.leave(workspaceId);
      console.log(`User left workspace: ${workspaceId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      delete global.userSockets[userId];
    });
  });

  return io;
};

module.exports = initSocket;