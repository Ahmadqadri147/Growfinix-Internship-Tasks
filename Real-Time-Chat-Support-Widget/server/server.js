import { createServer } from 'http';
import app from './app.js';
import env from './config/env.js';
import initSocket from './socket/index.js';

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`🚀 Chat Support Widget server running on port ${env.PORT} [${env.NODE_ENV}]`);
  console.log(`   Allowing client origin: ${env.CLIENT_URL}`);
});
