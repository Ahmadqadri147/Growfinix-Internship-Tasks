const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const imageRoutes = require('./routes/imageRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { rateLimiter, imageGenerationLimiter } = require('./middleware/rateLimiter');

// Import gallery service and initialize it
const galleryService = require('./services/galleryService');

// Initialize express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(morgan('combined'));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/generated_images', express.static(path.join(__dirname, 'generated_images')));
app.use('/api', imageRoutes);

// API Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    status: 'healthy',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    status: 'healthy',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Image Generation Studio API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      generate: 'POST /api/generate',
      gallery: 'GET /api/gallery',
      image: 'GET /api/gallery/:id',
      delete: 'DELETE /api/gallery/:id',
      favorite: 'PATCH /api/gallery/:id/favorite',
      history: 'GET /api/history'
    }
  });
});

// Error handling
app.use(errorHandler);
app.use(notFoundHandler);

// Start server
const PORT = process.env.PORT || 5000;
let server;

async function startServer() {
  try {
    // Initialize gallery service
    await galleryService.initialize();
    console.log('✅ Gallery service initialized');
    const token = process.env.HUGGINGFACE_API_TOKEN;
    console.log(`✅ Hugging Face API ready with token: ${token ? token.substring(0, 10) + '...' : 'not set'}`);

    // Start listening
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 API available at http://localhost:${PORT}`);
      console.log(`📄 API Documentation at http://localhost:${PORT}/api`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

startServer();

module.exports = app;