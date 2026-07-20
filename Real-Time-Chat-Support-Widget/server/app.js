import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import requestLogger from './middlewares/requestLogger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import healthRoutes from './routes/healthRoutes.js';
import roomRoutes from './routes/roomRoutes.js';

const app = express();

// Restrict cross-origin access to the known frontend origin(s) and cap the
// JSON body size to defend against oversized-payload memory abuse.
const allowedOrigins = env.CLIENT_ORIGINS;
const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser tools (curl, health checks) when no origin is sent.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(requestLogger);

app.use('/api/health', healthRoutes);
app.use('/api', roomRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
