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
    socket.on('joinWorkspace', (workspaceId) => {
      socket.join(workspaceId);
      console.log(`User joined workspace: ${workspaceId}`);
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