# 🎨 AI Image Generation Studio

A modern, full-stack web application for generating AI-powered images using cutting-edge machine learning models. Built with React, Express, and integrated with OpenAI's DALL-E 3.

## ✨ Features

- **AI Image Generation**: Create stunning images from text prompts using DALL-E 3
- **Image Gallery**: Browse, filter, and manage your generated images
- **Fullscreen Preview**: View images in immersive fullscreen mode
- **Favorite System**: Save and organize your favorite images
- **Dark/Light Theme**: Beautiful UI with theme toggle
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Progress**: See generation progress with animated loaders
- **Rate Limiting**: Prevent abuse with configurable rate limits
- **Modern UI**: Built with React, Framer Motion, and Tailwind CSS

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Beautiful animations
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js + Express** - Web server
- **OpenAI API** - Image generation
- **Helmet** - Security headers
- **Morgan** - Request logging
- **Rate Limiting** - API protection

## 📋 Prerequisites

- Node.js 18+ and npm
- OpenAI API key with DALL-E 3 access
- Modern web browser

## 🚀 Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Rate Limiting (Optional)
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=900000
```

**Frontend (`client/.env`):**
```env
VITE_API_BASE_URL=/api
```

### 3. Start the Servers

**Terminal 1 - Start Backend:**
```bash
cd server
npm start
```
Server will run at `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```
App will run at `http://localhost:3000`

## 📁 Project Structure

```
ai-image-generation-studio/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React contexts (Theme)
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Utility functions
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                 # Backend application
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   └── index.js        # Entry point
│   ├── .env
│   └── package.json
├── .gitignore
└── README.md
```

## 🎯 API Endpoints

### Image Generation
- **POST** `/api/generate` - Generate a new image from a prompt
  - Body: `{ "prompt": "A futuristic city at sunset" }`
  - Returns: `{ "success": true, "data": { "image": "url", "id": "unique-id" } }`

### Gallery Management
- **GET** `/api/gallery` - Get all images with filters
  - Query params: `?limit=10&offset=0&favorite=true`
- **GET** `/api/gallery/recent` - Get recent images
- **GET** `/api/gallery/favorites` - Get favorited images
- **GET** `/api/gallery/:id` - Get single image by ID
- **DELETE** `/api/gallery/:id` - Delete an image
- **PATCH** `/api/gallery/:id/favorite` - Toggle favorite status

### History & Health
- **GET** `/api/history` - Get prompt history
- **GET** `/api/health` - Check server health

## 🛠️ Development

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

### Available Scripts

**Client:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Server:**
- `npm start` - Start production server
- `npm run dev` - Start with nodemon (if installed)

## 🔒 Security

- Rate limiting to prevent abuse
- Helmet security headers
- Environment variable configuration
- Input validation
- CORS protection

## 🎨 Features Breakdown

### Frontend Features
- **Home Page**: Landing page with quick actions
- **Generate Page**: Advanced image generation form with prompt options
- **Gallery Page**: Browse all generated images with filters
- **Fullscreen Mode**: Click any image to view full size
- **Toast Notifications**: Real-time feedback for actions
- **Animated Loaders**: Visual feedback during generation

### Backend Features
- **OpenAI Integration**: DALL-E 3 image generation
- **Image Storage**: Local storage of generated images
- **Gallery Management**: CRUD operations for images
- **Rate Limiting**: Prevents API abuse
- **Error Handling**: Comprehensive error messages
- **Logging**: Morgan for request logging

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👤 Author

AI Image Generation Studio - Built with ❤️ for creative minds.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) - DALL-E 3 API
- [React](https://react.dev) - UI Framework
- [Vite](https://vitejs.dev) - Build Tool
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Framer Motion](https://www.framer.com/motion) - Animations

---

**Note**: Make sure to keep your OpenAI API key secure and never commit it to version control. The `.env` file is already configured to be ignored by Git.