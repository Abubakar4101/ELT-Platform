const { Server } = require('socket.io');
const redisClient = require('./redis');

/**
 * Initialize Socket.io
 * @param {Server} server - HTTP server instance
 * @returns {Server} - Initialized Socket.io server
 */
const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins
      methods: ['GET', 'POST'], // Allow GET and POST methods
    },
  });

  // Variable to keep track of the workspace the user has joined
  let joinedWorkspace = '';

  // Event listener for a new client connection
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Event listener for joining a workspace room
    socket.on('joinWorkspace', async (workspaceId) => {
      // Join the specified workspace room
      socket.join(workspaceId);
      joinedWorkspace = workspaceId;

      // Fetch and emit missed events for the user from Redis
      const missedEvents = await redisClient.lRange(`missedEvents:${workspaceId}:${userId}`, 0, -1);
      if (missedEvents) {
        missedEvents.forEach(notification => {
          // Emit each missed notification to the client with a timeout for acknowledgment
          socket.timeout(5000).emit('notification', JSON.parse(notification));
        });
      }
      console.log(`User joined workspace: ${workspaceId}`);
    });

    // Event listener for acknowledgment of notifications
    socket.on('acknowledged', (acknowledged, userId, notification) => {
      console.log(`User acknowledge: ${acknowledged}, ${userId}, ${notification}, ${joinedWorkspace}`);
      if (acknowledged) {
        // Remove the acknowledged notification from Redis
        redisClient.lRem(`missedEvents:${joinedWorkspace}:${userId}`, 0, JSON.stringify(notification));
      }
    });

    // Event listener for leaving a workspace room
    socket.on('leaveWorkspace', (workspaceId) => {
      socket.leave(workspaceId);
      console.log(`User left workspace: ${workspaceId}`);
    });

    // Event listener for client disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = initSocket;
