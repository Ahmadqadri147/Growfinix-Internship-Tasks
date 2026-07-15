# AI Image Generation Studio - Backend

A production-ready Node.js backend API for AI image generation using OpenAI DALL-E 3.

## 🚀 Features

- **REST API** with Express.js
- **OpenAI DALL-E 3 Integration** for high-quality image generation
- **Rate Limiting** to prevent abuse
- **Input Validation** with express-validator
- **Secure API Key Handling** using environment variables
- **Gallery Management** with JSON storage
- **Professional Controls** for style, lighting, texture, and more
- **Comprehensive Error Handling**
- **Health Checks** and status monitoring

## 📋 Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn
- OpenAI API Key

## 🛠️ Installation

1. Navigate to the backend directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `server` directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# OpenAI DALL-E API Configuration
OPENAI_API_KEY=your_actual_openai_api_key_here
OPENAI_ORGANIZATION=your_organization_id_optional

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=900000

# Image Storage
IMAGE_STORAGE_PATH=./generated_images
MAX_IMAGE_SIZE=10485760
```

4. Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## 📡 API Endpoints

### Generate Image
Create a new AI-generated image with professional controls.

**POST** `/api/generate`

**Request Body:**
```json
{
  "prompt": "A futuristic city with neon lights and flying cars",
  "subject": "cityscape",
  "style": "Cyberpunk",
  "lighting": "Neon",
  "texture": "Metallic",
  "colorPalette": "Neon",
  "background": "City",
  "cameraAngle": "Wide",
  "negativePrompt": "blurry, distorted",
  "imageSize": "1024x1792",
  "aspectRatio": "16:9",
  "quality": "hd",
  "seed": null,
  "creativity": 7,
  "n": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "unique-id",
        "prompt": "optimized prompt with all parameters",
        "imageUrl": "https://cdn.openai.com/...",
        "style": "Cyberpunk",
        "lighting": "Neon",
        "resolution": "1024x1792",
        "generationTime": 4523,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "usage": {
      "prompt_tokens": 45,
      "completion_tokens": 0,
      "total_tokens": 45
    },
    "model": "dall-e-3"
  },
  "message": "Image generated successfully"
}
```

### Get Gallery
Retrieve all generated images with filters.

**GET** `/api/gallery`

**Query Parameters:**
- `search` (optional): Search by prompt, style, or subject
- `style` (optional): Filter by art style
- `lighting` (optional): Filter by lighting
- `texture` (optional): Filter by texture
- `aspectRatio` (optional): Filter by aspect ratio
- `resolution` (optional): Filter by resolution
- `sortBy` (optional): Sort by newest, oldest, or favorites

**Example:**
```
GET /api/gallery?style=Cyberpunk&sortBy=newest
```

### Get Single Image
Retrieve a specific image by ID.

**GET** `/api/gallery/:id`

### Delete Image
Delete an image from the gallery.

**DELETE** `/api/gallery/:id`

### Toggle Favorite
Add or remove an image from favorites.

**PATCH** `/api/gallery/:id/favorite`

### Get Recent Images
Retrieve recent generated images.

**GET** `/api/gallery/recent?limit=10`

### Get Favorite Images
Retrieve all favorite images.

**GET** `/api/gallery/favorites`

### Get History
Retrieve prompt history with generation details.

**GET** `/api/history?limit=20`

### Health Check
Check if the server is running.

**GET** `/api/health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "status": "healthy"
}
```

## 🎨 Image Generation Parameters

### Art Styles
- Realistic, Photorealistic, Anime, Cyberpunk, Oil Painting
- Watercolor, Fantasy, 3D Render, Pixar, Comic, Pixel Art

### Lighting Options
- Natural, Studio, Golden Hour, Sunset, Neon
- Soft, Cinematic, Volumetric

### Texture Types
- Smooth, Rough, Metallic, Wood, Glass
- Stone, Fabric, Leather, Paper

### Camera Angles
- Close-up, Portrait, Wide, Top View
- Low Angle, Bird Eye, Macro

### Backgrounds
- Forest, Mountains, Ocean, Space, City
- Minimal, Abstract, White Studio

### Aspect Ratios
- 1:1 (Square), 16:9 (Landscape), 9:16 (Portrait)
- 4:3 (Standard), 3:2 (Classic)

### Image Sizes
- 256x256 (Fast)
- 512x512 (Standard)
- 1024x1024 (HD)
- 1024x1792 (Landscape 16:9)
- 1792x1024 (Portrait 9:16)

## 🔒 Security Features

- **API Key Protection**: Never exposed to frontend
- **Input Validation**: All inputs validated before processing
- **Rate Limiting**: Prevents API abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Environment Variables**: Sensitive data managed securely

## 📊 Response Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Validation error or invalid input
- `401 Unauthorized`: Invalid or missing API key
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

## 🛠️ Development

### Project Structure

```
server/
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
├── .env                  # Environment variables (not in git)
├── config/               # Configuration files
│   └── index.js          # App configuration
├── controllers/          # Request handlers
│   └── imageController.js
├── middleware/           # Middleware functions
│   ├── errorHandler.js   # Error handling
│   ├── rateLimiter.js    # Rate limiting
│   └── validators.js     # Input validation
├── routes/               # API routes
│   └── imageRoutes.js
└── services/             # Business logic
    ├── openaiService.js   # OpenAI integration
    └── galleryService.js  # Gallery management
```

### Testing

Run tests (when Jest setup is complete):
```bash
npm test
```

## 🚀 Deployment

### Production Build

1. Set environment variables:
```bash
NODE_ENV=production
OPENAI_API_KEY=your_production_key
PORT=5000
```

2. Build and start:
```bash
npm run start
```

### Docker Support (Coming Soon)

## 🔧 Configuration

Edit `.env` file to configure:

- **Server Port**: Default `5000`
- **Node Environment**: Development or Production
- **OpenAI API Key**: Your API key
- **Rate Limits**: Maximum requests and window
- **Image Storage Path**: Where to store generated images
- **Max Image Size**: File size limit in bytes

## 🐛 Troubleshooting

### "Invalid or missing API key"
Ensure you've added your OpenAI API key to the `.env` file correctly.

### "Rate limit exceeded"
Wait for the rate limit window to expire, or increase the limit in `.env`.

### Images not generating
- Check your OpenAI API key has DALL-E 3 access
- Verify API key has sufficient credits
- Check network connectivity

## 📝 License

MIT License - Feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📧 Contact

For questions or issues, please create an issue on GitHub.

---

Built with ❤️ using Node.js and Express
OpenAI DALL-E 3 for AI image generation