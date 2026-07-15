# 🎨 AI Image Generation Studio - Quick Start

A complete, production-ready AI image generation platform with stunning UI and professional controls.

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0.0+ installed
- OpenAI API Key (free at [platform.openai.com](https://platform.openai.com/))

### Step 1: Clone the Project

```bash
cd "AI Image Generation Studio"
```

### Step 2: Setup Backend

```bash
cd server
npm install
```

Create `.env` file:

```bash
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_actual_openai_api_key_here
```

Start backend:

```bash
npm run dev
```

Backend running at: `http://localhost:5000`

### Step 3: Setup Frontend

Open a new terminal:

```bash
cd client
npm install
```

Create `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

Start frontend:

```bash
npm run dev
```

Frontend running at: `http://localhost:3000`

### Step 4: Start Creating!

Open `http://localhost:3000` in your browser and start generating AI images!

## 📖 Features

✨ **Professional Image Generation**
- Over 10 art styles (Realistic, Anime, Cyberpunk, etc.)
- 8 lighting options
- Various textures and backgrounds
- Professional camera angles
- Aspect ratios from 1:1 to 16:9
- Adjustable quality and creativity

🎨 **Modern UI**
- Dark/Light mode
- Smooth animations
- Responsive design
- Glassmorphism cards

🖼️ **Gallery Management**
- Masonry grid layout
- Image filters
- Favorites system
- Download images
- Share creations

## 📂 Project Structure

```
AI Image Generation Studio/
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React contexts
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # Backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Express middleware
│   ├── config/            # Configuration
│   └── package.json
└── README.md              # Main documentation
```

## 🔑 Environment Variables

### Backend (.env)

```bash
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_ORGANIZATION=org-your-org-id
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=900000
```

### Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:5000
```

## 🎯 How It Works

1. User enters a detailed prompt in the Generate page
2. Frontend sends all parameters to backend API
3. Backend constructs optimized AI prompt
4. Backend sends request to OpenAI DALL-E 3
5. OpenAI generates the image
6. Backend saves image to gallery
7. Frontend displays generated image
8. User can download, copy prompt, share, or favorite

## 🛠️ API Endpoints

- `POST /api/generate` - Generate new AI image
- `GET /api/gallery` - Get all images with filters
- `GET /api/gallery/:id` - Get specific image
- `DELETE /api/gallery/:id` - Delete image
- `PATCH /api/gallery/:id/favorite` - Toggle favorite
- `GET /api/gallery/recent` - Get recent images
- `GET /api/gallery/favorites` - Get favorite images
- `GET /api/health` - Server health check

## 🎨 Image Generation Controls

### Styles
Realistic, Photorealistic, Anime, Cyberpunk, Oil Painting, Watercolor, Fantasy, 3D Render, Pixar, Comic, Pixel Art

### Lighting
Natural, Studio, Golden Hour, Sunset, Neon, Soft, Cinematic, Volumetric

### Textures
Smooth, Rough, Metallic, Wood, Glass, Stone, Fabric, Leather, Paper

### Camera Angles
Close-up, Portrait, Wide, Top View, Low Angle, Bird Eye, Macro

### Backgrounds
Forest, Mountains, Ocean, Space, City, Minimal, Abstract, White Studio

## 🔒 Security

- ✅ API keys never exposed to frontend
- ✅ Input validation on all endpoints
- ✅ Rate limiting to prevent abuse
- ✅ CORS protection
- ✅ Secure environment variables

## 🚀 Production Deployment

### Backend Deployment

```bash
# Build for production
NODE_ENV=production npm start
```

### Frontend Deployment

```bash
# Build
npm run build

# Deploy dist folder to:
# - Vercel
# - Netlify
# - AWS S3
# - Any static hosting
```

## 📚 Documentation

- [Backend README](server/README.md) - Complete backend documentation
- [Frontend README](README.md) - Complete frontend documentation

## 🐛 Troubleshooting

**Backend won't start?**
- Check if port 5000 is available
- Verify OpenAI API key in `.env`

**Frontend won't connect?**
- Ensure backend is running
- Check API URL in frontend `.env`

**Images not generating?**
- Verify OpenAI API key has credits
- Check network connectivity
- Review error messages

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

## 📄 License

MIT License - Use freely for personal and commercial projects.

## 🎉 Get Started Now!

```bash
cd server && npm install && npm run dev
# New terminal
cd client && npm install && npm run dev
```

Open `http://localhost:3000` and create your first masterpiece! 🚀

---

Built with ❤️ using React.js, Node.js, and OpenAI DALL-E 3
Support AI-generated art with responsible usage! ✨