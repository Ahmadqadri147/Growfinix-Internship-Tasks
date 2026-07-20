import env from './env.js';

/**
 * Options passed to the Socket.io server constructor.
 */
export const socketOptions = {
  cors: {
    origin: env.CLIENT_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 30000,
  pingInterval: 25000,
};

export default socketOptions;
