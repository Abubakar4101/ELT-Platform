// socket.js
const { Server } = require('socket.io');

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

    // Handle joining a workspace room
    socket.on('joinWorkspace', (workplaceId) => {
      socket.join(workplaceId);
      console.log(`User joined workspace: ${workplaceId}`);
    });

    // Handle leaving a workspace room
    socket.on('leaveWorkspace', (workplaceId) => {
      socket.leave(workplaceId);
      console.log(`User left workspace: ${workplaceId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = initSocket;