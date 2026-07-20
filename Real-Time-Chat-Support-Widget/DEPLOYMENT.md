# Deployment Guide

Deploy your Real-Time Chat Support Widget to production with these step-by-step guides.

---

## Table of Contents

- [Vercel (Frontend)](#vercel-frontend)
- [Railway (Full Stack)](#railway-full-stack)
- [Heroku (Legacy)](#heroku-legacy)
- [AWS (Scalable)](#aws-scalable)
- [Docker](#docker)
- [Reverse Proxy Setup](#reverse-proxy-setup)

---

## Vercel (Frontend)

**Best for:** Frontend-only deployment with serverless backend

### Setup

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/repo.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import GitHub repository
   - Select `client/` as root directory

3. **Configure Environment**
   ```
   Project Settings → Environment Variables
   
   VITE_SERVER_URL = https://your-backend.com
   ```

4. **Deploy**
   ```bash
   git push origin main
   # Vercel auto-deploys!
   ```

---

## Railway (Full Stack)

**Best for:** Simple, integrated full-stack deployment

### Setup

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login & Initialize**
   ```bash
   railway login
   cd Real-Time-Chat-Support-Widget
   railway init
   ```

3. **Create Services**
   
   **Backend Service:**
   ```bash
   railway service add postgres  # Optional: for persistence
   railway service add redis     # Optional: for scaling
   ```

4. **Configure Environment**
   
   Create `server/railway.toml`:
   ```toml
   [build]
   builder = "dockerfile"
   dockerfile = "Dockerfile"
   
   [deploy]
   startCommand = "npm run start"
   healthcheckPath = "/api/health"
   port = 5000
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Get Your URLs**
   ```bash
   railway env
   # You'll see: RAILWAY_PUBLIC_DOMAIN=xxxx.railway.app
   ```

7. **Update Frontend**
   ```
   client/.env:
   VITE_SERVER_URL=https://xxxx.railway.app
   ```

---

## Heroku (Legacy)

**Best for:** Classic Node.js deployment (Heroku free tier deprecated)

### Setup (for paid Heroku plans)

1. **Install Heroku CLI**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create your-app-name
   ```

4. **Add Buildpacks**
   ```bash
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add heroku/staticfiles
   ```

5. **Set Environment**
   ```bash
   heroku config:set CLIENT_URL=https://your-frontend.vercel.app
   heroku config:set NODE_ENV=production
   ```

6. **Deploy**
   ```bash
   cd server
   git push heroku main
   ```

---

## AWS (Scalable)

**Best for:** Production applications with high traffic

### Architecture

```
AWS Route 53 (DNS)
     ↓
CloudFront (CDN)
     ↓
┌─────────────────────┐
│  ALB (Load Balancer)│
└─────────────────────┘
   ↙              ↖
EC2 Instance   EC2 Instance  (Backend)
(Socket.io)      (Socket.io)

ElastiCache (Redis) - for session/cache
RDS (PostgreSQL) - for persistence
```

### Frontend (S3 + CloudFront)

1. **Build**
   ```bash
   cd client
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-app-frontend
   aws s3 sync dist/ s3://your-app-frontend/
   ```

3. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Default Root Object: `index.html`
   - Viewer Protocol: HTTPS

4. **Update DNS**
   - Route 53 → Create ALIAS record → Point to CloudFront

### Backend (ECS + Fargate)

1. **Build Docker Image**
   ```bash
   cd server
   docker build -t your-app-backend .
   ```

2. **Push to ECR**
   ```bash
   aws ecr get-login-password --region us-east-1 | \
   docker login --username AWS --password-stdin \
   YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
   
   docker tag your-app-backend:latest \
   YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/your-app-backend:latest
   
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/your-app-backend:latest
   ```

3. **Create ECS Cluster**
   - Use Fargate (serverless)
   - Add task definition (ECS task)
   - Set environment variables

4. **Create Application Load Balancer**
   - Listen: port 443 (HTTPS)
   - Target: ECS service
   - Set up SSL certificate (ACM)

5. **Update Frontend .env**
   ```env
   VITE_SERVER_URL=https://api.yourdomain.com
   ```

### Optional: RDS + Redis

```bash
# RDS (PostgreSQL)
aws rds create-db-instance \
  --db-instance-identifier your-db \
  --db-instance-class db.t3.micro \
  --engine postgres

# ElastiCache (Redis)
aws elasticache create-cache-cluster \
  --cache-cluster-id your-redis \
  --engine redis \
  --cache-node-type cache.t3.micro
```

---

## Docker

**Best for:** Container-based deployment anywhere

### Build Locally

```bash
docker build -t my-app-backend server/
docker build -t my-app-frontend client/
```

### Docker Compose (Local)

```bash
docker-compose up
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

### Docker Compose (Production)

Update `docker-compose.yml`:

```yaml
version: '3.8'

services:
  server:
    image: your-registry/chat-widget-backend:latest
    ports:
      - '5000:5000'
    environment:
      - PORT=5000
      - CLIENT_URL=https://yourdomain.com
      - NODE_ENV=production
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  client:
    image: your-registry/chat-widget-frontend:latest
    ports:
      - '80:80'
    environment:
      - VITE_SERVER_URL=https://api.yourdomain.com
    restart: always

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    restart: always
```

### Push to Docker Hub

```bash
docker tag my-app-backend:latest yourusername/chat-widget-backend:latest
docker push yourusername/chat-widget-backend:latest
```

### Deploy to Any Container Host

```bash
docker run -d \
  -p 5000:5000 \
  -e PORT=5000 \
  -e CLIENT_URL=https://yourdomain.com \
  -e NODE_ENV=production \
  yourusername/chat-widget-backend:latest
```

---

## Reverse Proxy Setup

### Nginx Configuration

Create `nginx.conf`:

```nginx
upstream backend {
  server backend:5000;
}

upstream frontend {
  server frontend:5173;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  # Frontend
  location / {
    proxy_pass http://frontend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Backend API
  location /api/ {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Socket.io WebSocket
  location /socket.io/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Important for Socket.io
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
  }

  # Health check
  location /health {
    access_log off;
    proxy_pass http://backend/api/health;
  }
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name yourdomain.com;
  return 301 https://$server_name$request_uri;
}
```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Environment Variables Checklist

| Variable | Frontend | Backend | Example |
|----------|----------|---------|---------|
| VITE_SERVER_URL | ✅ | — | https://api.example.com |
| PORT | — | ✅ | 5000 |
| CLIENT_URL | — | ✅ | https://example.com |
| NODE_ENV | — | ✅ | production |

---

## Performance Optimization

### Frontend

```bash
# Analyze bundle
npm install --save-dev webpack-bundle-analyzer

# Build optimizations
npm run build

# Result: ~50KB gzipped
```

### Backend

```javascript
// Enable compression
const compression = require('compression')
app.use(compression())

// Add caching headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600')
  next()
})
```

---

## Monitoring & Logging

### Application Performance

```javascript
// Backend logging
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`)
  })
  next()
})
```

### Health Checks

```bash
curl https://yourdomain.com/api/health
# { "success": true, "status": "ok", "uptime": 12345 }
```

### Error Tracking

```javascript
// Sentry example (optional)
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.errorHandler());
```

---

## Troubleshooting

### WebSocket Connection Fails

```nginx
# Fix in Nginx: increase timeout
proxy_read_timeout 3600s;
proxy_send_timeout 3600s;
```

### CORS Errors

```javascript
// Backend: verify CLIENT_URL
console.log('CORS origin:', env.CLIENT_URL)

// Frontend: verify VITE_SERVER_URL
console.log('Server:', import.meta.env.VITE_SERVER_URL)
```

### Out of Memory

```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=512" npm start
```

### High CPU Usage

```javascript
// Check for infinite loops or blocking operations
// Enable Node.js profiler
node --prof server.js
```

---

## Production Checklist

- [ ] Environment variables set correctly
- [ ] SSL/TLS certificate installed
- [ ] CORS origin updated to production domain
- [ ] Health checks passing
- [ ] Logs configured and monitored
- [ ] Auto-restart enabled
- [ ] Backups configured (if using database)
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Performance tested (Lighthouse, WebPageTest)
- [ ] Load testing completed
- [ ] Disaster recovery plan documented

---

## Getting Help

- Check logs: `docker logs container-name`
- Verify connectivity: `curl http://localhost:5000/api/health`
- Monitor performance: Use your platform's dashboard
- Read docs: Check service-specific documentation

---

**Ready to deploy! 🚀**
