import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

/**
 * A single shared socket instance for the whole widget. We connect lazily
 * (autoConnect: false) so the app controls exactly when the handshake starts.
 */
export const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export default socket;
