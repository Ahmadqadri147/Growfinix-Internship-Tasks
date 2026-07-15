# 🎯 Setup Guide

Complete setup instructions for AI Image Generation Studio.

## System Requirements

- Node.js 18+ and npm
- At least 2GB RAM
- Modern web browser (Chrome, Firefox, Edge, Safari)

## Step 1: Install Node.js

Download and install [Node.js 18+](https://nodejs.org/)

Verify installation:
```bash
node -v
npm -v
```

## Step 2: Clone or Extract the Project

Extract the project files to your desired location.

## Step 3: Install Backend Dependencies

Navigate to the server directory:
```bash
cd server
npm install
```

## Step 4: Install Frontend Dependencies

Navigate to the client directory:
```bash
cd client
npm install
```

## Step 5: Configure Environment Variables

### Backend Configuration (`server/.env`)

Create or edit `server/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# OpenAI API Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Rate Limiting (Optional - defaults shown)
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=900000
```

### Frontend Configuration (`client/.env`)

Create or edit `client/.env`:
```env
VITE_API_BASE_URL=/api
```

## Step 6: Start the Application

### Terminal 1 - Start Backend:
```bash
cd server
npm start
```

Backend will start at `http://localhost:5000`

### Terminal 2 - Start Frontend:
```bash
cd client
npm run dev
```

Frontend will start at `http://localhost:3000`

## Step 7: Test the Application

1. Open `http://localhost:3000` in your browser
2. Click on "Generate" button
3. Enter a prompt (e.g., "A futuristic city at sunset")
4. Click "Generate Image"
5. Wait for the image to be generated
6. View your generated image in the gallery

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use, change the PORT in `server/.env`:
```env
PORT=5001  # or any available port
```

### Environment Variable Errors

1. Ensure `.env` files exist in both `server/` and `client/` directories
2. Check for typos in variable names
3. Restart the servers after changing `.env` files

### API Key Issues

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Ensure you have access to DALL-E 3
3. Add the key to `server/.env` as `OPENAI_API_KEY`

### Dependencies Issues

Clean install:
```bash
cd server
rm -rf node_modules package-lock.json
npm install

cd client
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues

CORS is configured for development on ports 3000 and 5173. If you change ports, update `server/index.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

## Production Deployment

### Build for Production

**Frontend:**
```bash
cd client
npm run build
```

**Backend:**
```bash
cd server
npm start
```

### Deployment Options

1. **Vercel/Netlify** - For the frontend
2. **Heroku/AWS/Google Cloud** - For the backend
3. **Docker** - Containerized deployment

For Docker deployment, see [Docker Documentation](#)

## Security Checklist

- [ ] Change default `PORT` to a random high port
- [ ] Use a strong `OPENAI_API_KEY`
- [ ] Set `NODE_ENV=production`
- [ ] Configure production CORS origins
- [ ] Set up rate limiting for production
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS in production
- [ ] Implement authentication/authorization if needed

## Support

For issues or questions, refer to the main [README.md](./README.md) or create an issue in the project repository.