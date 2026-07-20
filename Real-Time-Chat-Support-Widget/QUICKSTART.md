# Quick Start Guide

Get the Real-Time Chat Support Widget running in 2 minutes!

## Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)

## Setup (One-Time)

### Option 1: Automatic (Recommended)

```bash
bash setup.sh
```

This script will:
- ✅ Create server `.env` file
- ✅ Install backend dependencies
- ✅ Install frontend dependencies

### Option 2: Manual

```bash
# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

## Run the Project

**Open 2 terminals:**

### Terminal 1 - Backend Server

```bash
cd server
npm run dev
```

You should see:
```
🚀 Chat Support Widget server running on port 5000 [development]
```

### Terminal 2 - Frontend Dev Server

```bash
cd client
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Test It

1. Open `http://localhost:5173` in your browser
2. Click the floating chat button (bottom right)
3. Type a message and press Enter
4. See the message appear instantly! 🎉

---

## 🎓 What You'll See

- **Chat Window**: Modern glassmorphism design with animations
- **Real-Time Messages**: Messages appear instantly via WebSocket
- **Typing Indicator**: "Support Team is typing..." message
- **Online Count**: Number of connected users
- **Connection Status**: Green dot = connected, red = offline
- **Dark Mode Toggle**: Switch between light/dark theme
- **Export Chat**: Download conversation as text file
- **Mobile Responsive**: Try resizing your browser

---

## 🐳 Docker Setup (Optional)

If you have Docker installed:

```bash
docker-compose up
```

Services will start automatically:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🚨 Troubleshooting

### Port Already in Use

**If 5000 or 5173 is already in use:**

```bash
# Change server port
cd server
PORT=5001 npm run dev

# Change client port
cd client
npm run dev -- --port 5174
```

Then update the client `.env`:
```env
VITE_SERVER_URL=http://localhost:5001
```

### Server won't start

```bash
# Clear node_modules and reinstall
cd server
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Client shows "Cannot reach server"

Make sure both servers are running and check:
- Terminal 1: `npm run dev` in `server/` folder
- Terminal 2: `npm run dev` in `client/` folder
- No port conflicts

---

## 📁 Project Structure

```
Real-Time-Chat-Support-Widget/
├── client/          ← React frontend (port 5173)
├── server/          ← Express backend (port 5000)
├── README.md        ← Full documentation
└── setup.sh         ← Automation script
```

---

## ✨ Key Features to Try

1. **Send Messages** – Type and press Enter
2. **Emoji Picker** – Click the smiley icon
3. **Copy Messages** – Hover over a message, click the copy icon
4. **Dark Mode** – Click the moon/sun icon in the header
5. **Export Chat** – Click the three-dot menu → "Export chat"
6. **Clear Chat** – Click the three-dot menu → "Clear chat"
7. **Multi-User** – Open in two browser tabs to simulate two users

---

## 🎯 Next Steps

Once it's running:

1. Read `README.md` for full documentation
2. Explore the code structure
3. Try customizing colors in `tailwind.config.js`
4. Modify the demo page in `DemoPage.jsx`
5. Deploy to production (see README.md)

---

## 💻 Commands Reference

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Linting (client only)
npm run lint         # Check for errors
```

---

## 📞 Support

If something doesn't work:

1. Make sure Node.js v18+ is installed: `node --version`
2. Check both terminals are showing "running on port X"
3. Try a hard refresh in browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check the README.md for more detailed info

---

**Happy coding! 🚀**
