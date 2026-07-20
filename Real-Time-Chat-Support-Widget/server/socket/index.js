import { Server } from 'socket.io';
import socketOptions from '../config/socketConfig.js';
import { registerChatHandlers } from './chatHandlers.js';

/**
 * Attaches a Socket.io server to the given HTTP server and wires up
 * connection-level logging plus the chat event handlers.
 */
export function initSocket(httpServer) {
  const io = new Server(httpServer, socketOptions);

  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    registerChatHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`[socket] disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

export default initSocket;
