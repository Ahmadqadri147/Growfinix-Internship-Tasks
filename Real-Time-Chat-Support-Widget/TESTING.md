# Testing & Quality Checklist

Use this checklist to verify your project is production-ready before submitting for evaluation.

---

## ✅ Pre-Launch Verification

### Environment Setup

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm v9+ installed (`npm --version`)
- [ ] Git initialized and committed
- [ ] `.env` files created with correct values
- [ ] All dependencies installed without warnings
- [ ] No `npm audit` vulnerabilities

### Server Startup

```bash
cd server && npm run dev
```

- [ ] Server starts without errors
- [ ] Server listens on port 5000
- [ ] Console shows: `🚀 Chat Support Widget server running on port 5000`
- [ ] No red console errors
- [ ] Health check responds: `curl http://localhost:5000/api/health`

### Client Startup

```bash
cd client && npm run dev
```

- [ ] Client builds without errors
- [ ] Development server starts on port 5173
- [ ] Browser opens to `http://localhost:5173`
- [ ] No build warnings
- [ ] No console errors
- [ ] Page loads with demo website visible

---

## 🧪 Feature Testing

### 1. Chat Widget Basics

- [ ] Floating button appears in bottom-right corner
- [ ] Button has brand gradient background
- [ ] Button has smooth hover animation
- [ ] Clicking button opens chat window
- [ ] Chat window has smooth slide-up animation
- [ ] Clicking close button (X) closes window
- [ ] Clicking button again reopens window

### 2. Message Sending & Receiving

- [ ] Type message in input field
- [ ] Message appears in chat history immediately
- [ ] Message shows timestamp
- [ ] Message has correct styling (sender vs receiver)
- [ ] Press Enter to send
- [ ] Shift+Enter creates newline
- [ ] Long messages wrap correctly
- [ ] Emoji in messages display correctly
- [ ] Special characters (& < >) display safely

### 3. Typing Indicator

- [ ] Start typing, see "…is typing" indicator
- [ ] Indicator shows animated dots
- [ ] Indicator disappears after stopping typing
- [ ] Indicator persists while actively typing
- [ ] Multiple users' typing indicators stack

### 4. Connection Status

- [ ] Green dot appears when connected
- [ ] Status badge shows "Connected"
- [ ] Yellow dot appears when reconnecting
- [ ] Red dot appears when disconnected
- [ ] Status updates automatically
- [ ] Auto-reconnect happens after disconnect

### 5. Online Users Count

- [ ] Display shows correct number of online users
- [ ] Count updates when users join
- [ ] Count updates when users leave
- [ ] Count is visible in header

### 6. Message Persistence

- [ ] Close browser
- [ ] Reopen to same page
- [ ] All previous messages still visible
- [ ] Message order preserved
- [ ] Timestamps preserved

### 7. Emoji Picker

- [ ] Emoji icon in input area
- [ ] Click shows emoji picker
- [ ] 16 emojis visible in grid
- [ ] Click emoji inserts it
- [ ] Picker closes after selection
- [ ] Emojis render correctly in messages

### 8. Message Copy

- [ ] Hover over message, copy button appears
- [ ] Click copy button
- [ ] Notification shows (checkmark)
- [ ] Paste message in another app works
- [ ] Works in both light and dark mode

### 9. Export Chat

- [ ] Click menu (three dots)
- [ ] Click "Export chat"
- [ ] File downloads as `.txt`
- [ ] File contains all messages
- [ ] Timestamps included in export
- [ ] Works with empty chat

### 10. Clear Chat

- [ ] Click menu (three dots)
- [ ] Click "Clear chat"
- [ ] All messages disappear
- [ ] Empty state message appears
- [ ] Confirmation behavior appropriate

### 11. Theme Toggle

- [ ] Moon icon visible in header (light mode)
- [ ] Sun icon visible in header (dark mode)
- [ ] Click toggle switches theme
- [ ] All colors update correctly
- [ ] Text remains readable
- [ ] Theme persists after refresh
- [ ] localStorage updated

### 12. Unread Badge

- [ ] Close chat window
- [ ] Send message from another client
- [ ] Red badge appears on button
- [ ] Badge shows correct count
- [ ] Click button opens chat
- [ ] Badge disappears when window open
- [ ] Works with multiple messages

### 13. Auto-Scroll

- [ ] New message appears at bottom
- [ ] Window auto-scrolls to show it
- [ ] Scroll up to see old messages
- [ ] New messages don't auto-scroll if scrolled up
- [ ] "New messages" button appears
- [ ] Click button scrolls to bottom

### 14. Keyboard Shortcuts

- [ ] Enter sends message
- [ ] Shift+Enter doesn't send
- [ ] Textarea expands for longer messages
- [ ] Tab navigation works (focus visible)
- [ ] Escape (if implementing later) works

---

## 📱 Responsive Design Testing

### Mobile (375px)
- [ ] Widget fits on screen
- [ ] Input field accessible
- [ ] Messages readable
- [ ] No horizontal scroll
- [ ] Buttons easily tapable
- [ ] Emoji picker usable
- [ ] Menu dropdown fits

### Tablet (768px)
- [ ] Widget properly sized
- [ ] All features accessible
- [ ] Text readable at distance
- [ ] Touch targets large enough

### Desktop (1440px)
- [ ] Widget proportional
- [ ] Animations smooth
- [ ] No layout breaks
- [ ] Spacing correct

### Test Browsers
- [ ] Chrome/Chromium 90+
- [ ] Firefox 88+
- [ ] Safari 14+ (macOS)
- [ ] Safari on iOS 14+
- [ ] Chrome on Android

---

## 🌙 Dark Mode Testing

- [ ] Text readable in dark mode
- [ ] All colors updated
- [ ] Contrast ratios meet WCAG AA
- [ ] Icon colors visible
- [ ] Buttons clickable
- [ ] No white text on white background
- [ ] No black text on black background
- [ ] Toggle smooth transition

---

## ⚡ Performance Testing

### Lighthouse Audit

```bash
# Build for production
npm run build

# Install http-server
npm install -g http-server

# Serve and test
http-server dist
# Open http://localhost:8080
# Run Lighthouse audit (DevTools)
```

**Targets:**
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 90+
- [ ] SEO: 90+

### Bundle Size

```bash
cd client
npm run build
# Check dist/ folder size
```

**Target:** < 150KB total (50KB gzipped)

### First Paint
- [ ] < 1s on 3G
- [ ] < 2s Time to Interactive

---

## 🔒 Security Testing

### Input Validation
- [ ] XSS protection: Try `<script>alert('xss')</script>`
  - Expected: Text displays safely, no script runs
- [ ] HTML injection: Try `<b>bold</b>`
  - Expected: Text displays literally, no HTML rendered
- [ ] Length limit: Try pasting 10000 characters
  - Expected: Message truncated or rejected

### CORS
- [ ] Test from different origin
- [ ] Verify only whitelisted origin allowed
- [ ] Check error handling

### Sensitive Data
- [ ] No passwords in code
- [ ] No API keys visible
- [ ] No sensitive data in logs
- [ ] localStorage only stores safe data

---

## 🐛 Browser DevTools Check

### Console
```
Expected: 0 errors, 0 warnings
```

Open DevTools (F12):
- [ ] No red error messages
- [ ] No yellow warnings
- [ ] No 404 errors for assets
- [ ] No CORS errors
- [ ] Network requests successful

### Network Tab
- [ ] Initial page load < 2s
- [ ] WebSocket connection established
- [ ] No failed requests
- [ ] Gzip compression enabled
- [ ] Images optimized

### Application Tab
- [ ] localStorage contains chat data
- [ ] No suspicious cookies
- [ ] Service Worker (if applicable) works

### Performance Tab
- [ ] No jank (60fps smooth)
- [ ] Animations smooth
- [ ] No long tasks
- [ ] Memory stable (no leaks)

---

## 🔄 Connection Handling

### Slow Network (3G)
- [ ] Use DevTools throttle to 3G
- [ ] Messages still send/receive
- [ ] UI remains responsive
- [ ] No timeout errors

### Offline Simulation
- [ ] DevTools → Network → Offline
- [ ] Chat window shows "Disconnected"
- [ ] Input disabled
- [ ] Messages don't send
- [ ] Online indicator red

### Reconnection
- [ ] Go offline
- [ ] Go back online (DevTools → Online)
- [ ] Auto-reconnects within 5s
- [ ] Status updates to "Connected"
- [ ] Old messages reappear
- [ ] Can send new messages

---

## 🎨 Visual Quality Check

### Typography
- [ ] Font family correct (Sora, Inter)
- [ ] Font sizes hierarchical
- [ ] Line heights readable
- [ ] Letter spacing appropriate
- [ ] No text truncation

### Colors
- [ ] Brand gradient correct
- [ ] Status colors clear (green/red)
- [ ] Contrast sufficient for accessibility
- [ ] Consistent across light/dark modes

### Spacing
- [ ] Padding consistent (4px grid)
- [ ] Margins balanced
- [ ] No overlapping elements
- [ ] Whitespace intentional

### Animations
- [ ] Smooth (60fps)
- [ ] Appropriate duration (~300ms)
- [ ] No jank or stuttering
- [ ] Easing feels natural
- [ ] Respects `prefers-reduced-motion`

---

## 📝 Code Quality

### Linting

```bash
cd client
npm run lint
```

- [ ] No errors
- [ ] No warnings
- [ ] No unused variables
- [ ] Proper formatting

### Code Review Checklist

- [ ] No console.log statements (except errors)
- [ ] No commented-out code
- [ ] Meaningful variable names
- [ ] Functions documented
- [ ] No magic numbers
- [ ] DRY principle followed
- [ ] Error handling present
- [ ] Edge cases handled

### Component Quality

- [ ] Single responsibility principle
- [ ] Props validated
- [ ] Default props provided
- [ ] Proper key usage in lists
- [ ] No unnecessary re-renders
- [ ] Hooks properly ordered
- [ ] Dependencies correct

---

## 📄 Documentation Check

### README
- [ ] Overview present
- [ ] Features listed
- [ ] Tech stack clear
- [ ] Installation instructions clear
- [ ] Running instructions clear
- [ ] Project structure documented
- [ ] Deployment info included
- [ ] Contributing guidelines present

### Code Comments
- [ ] Complex logic explained
- [ ] Functions documented
- [ ] Constants explained
- [ ] Architecture decisions noted
- [ ] TODOs minimal and purposeful

### Deployment Docs
- [ ] Environment variables listed
- [ ] Deployment steps clear
- [ ] Troubleshooting included
- [ ] Production checklist provided

---

## 🚀 Pre-Submission Checklist

### Frontend
- [ ] `npm run build` succeeds
- [ ] No build warnings
- [ ] Build output minimal
- [ ] All imports resolve
- [ ] No missing dependencies
- [ ] Package.json correct

### Backend
- [ ] `npm start` works
- [ ] Health check responds
- [ ] Environment variables correct
- [ ] No startup errors
- [ ] Package.json correct

### Git
- [ ] All files committed
- [ ] No node_modules committed
- [ ] No .env file committed (only .env.example)
- [ ] Meaningful commit messages
- [ ] README visible in root

### Project Files
- [ ] README.md complete
- [ ] QUICKSTART.md present
- [ ] ARCHITECTURE.md present
- [ ] DEPLOYMENT.md present
- [ ] .gitignore correct
- [ ] .env.example provided

---

## 🏆 Portfolio Quality

### Visual Appeal
- [ ] Modern, polished design
- [ ] Glassmorphism elements
- [ ] Smooth animations
- [ ] Professional gradients
- [ ] Good use of whitespace
- [ ] Consistent color scheme

### Functionality
- [ ] All features working
- [ ] No bugs or crashes
- [ ] Fast response times
- [ ] Graceful degradation
- [ ] Error messages clear

### Documentation
- [ ] Well-commented code
- [ ] Architecture documented
- [ ] Deployment ready
- [ ] Scalability plan shown
- [ ] Security considered

### Completeness
- [ ] All required features
- [ ] Bonus features included
- [ ] Professional README
- [ ] Production-ready code
- [ ] No TODOs in main code

---

## 📊 Final Verification

Run through this final checklist:

```bash
# 1. Clean start
rm -rf node_modules package-lock.json
npm install
npm run dev  # Both terminals

# 2. Test all features (see section above)
# 3. Check console for errors
# 4. Verify responsive design
# 5. Test in different browsers
# 6. Build for production
npm run build

# 7. Verify no warnings/errors
# 8. Check documentation
# 9. Review code quality
# 10. Test deployment locally (Docker)
```

---

## ✨ Success Criteria

Your project is ready for submission when:

✅ All features working  
✅ Zero console errors  
✅ Zero console warnings  
✅ Responsive design verified  
✅ Documentation complete  
✅ Code is clean and documented  
✅ Animations smooth  
✅ Performance good  
✅ Security considered  
✅ Ready for production deployment  

---

**You're ready to impress! 🎉**

Good luck with your internship evaluation!
