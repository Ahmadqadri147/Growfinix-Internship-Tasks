# Background Email Queue System — Growfinix

A production-ready **Background Email Queue System** for a booking/enquiry application. The system ensures that the main API server responds immediately to frontend submissions without blocking on SMTP dispatches. All email tasks are offloaded to a Redis-backed BullMQ task queue and processed asynchronously by independent background worker processes.

## Architecture Overview

```
                      +-------------------+
                      |   React Frontend  |
                      |   (Vite + Tailwind)
                      +---------+---------+
                                |
                   (HTTP POST)  |  (HTTP GET)
                                v
                      +---------+---------+
                      |    Express API    | <=====> [ MongoDB Logs & Enquiries ]
                      +---------+---------+
                                |
                                | (Push job metadata)
                                v
                      +---------+---------+
                      |    Redis Store    |
                      |    (BullMQ Queue) |
                      +---------+---------+
                                |
                                | (FIFO Pull & Concurrency)
                                v
                      +---------+---------+
                      |   BullMQ Worker   |
                      +---------+---------+
                                |
                                | (Render templates & send)
                                v
                      +---------+---------+
                      |    Nodemailer     |
                      +---------+---------+
                                |
                                v
                           [ Customer ]
                           [  Admin   ]
```

When a user submits a booking/enquiry:
1. The **Express API** validates the request.
2. The enquiry is saved in **MongoDB**.
3. Two email dispatch jobs (Customer Confirmation + Admin Notification) are added to the **Redis Queue (`emailQueue`)** using **BullMQ**.
4. The API immediately returns a `201 Created` status with the elapsed processing time (~10ms).
5. The standalone **Background Worker** process pulls the jobs, renders HTML email templates, dispatches emails using **Nodemailer**, and updates log statuses in MongoDB.

---

## Key Features

1. **High Performance**: The main API server responds in milliseconds instead of hanging on SMTP handshakes.
2. **Robust Retries & Backoff**: Configured with 3 retry attempts, exponential backoff (`delay: 5000ms`), and status tracking in MongoDB.
3. **Queue Monitoring**: Live statistics (waiting, active, completed, failed, delayed jobs) fetched directly from Redis and rendered on the dashboard.
4. **Admin Dashboard**: Visual dashboard displaying total enquiries, queue logs with real-time status updates (pending, queued, processing, sent, failed), search filters, pagination, and manual retry triggers.
5. **Interactive Performance Demo**: Sandbox screen showing side-by-side processing latencies (Direct SMTP vs. Redis Queue) with live-updated bar charts.
6. **Smart Fallback**: The email service automatically runs in Dev Mode (capturing emails as JSON) if SMTP credentials are left as default placeholders, preventing startup crashes.

---

## Directory Structure

```
email-queue-system/
├── backend/
│   ├── config/              # Database, environment, and Redis configurations
│   ├── controllers/         # Enquiry, email log, and queue stats handlers
│   ├── middleware/          # Rate limiting, input validation, and error handlers
│   ├── models/              # Enquiry and EmailLog Mongoose schemas
│   ├── queues/              # BullMQ queue definition & job loaders
│   ├── routes/              # Express API endpoints
│   ├── services/            # Nodemailer transport setup
│   ├── templates/           # Professional HTML customer & admin email templates
│   ├── utils/               # Sanitizers, logger, and validator methods
│   ├── workers/             # BullMQ worker processor
│   ├── server.js            # Main Express application entry
│   ├── worker.js            # Standalone worker runner
│   └── .env.example         # Template environment variables
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Sidebar, etc.)
│   │   ├── pages/           # BookingForm, Dashboard, and PerformanceDemo pages
│   │   ├── services/        # Axios API wrapper (api.js)
│   │   ├── App.jsx          # SPA route router & toast notification manager
│   │   ├── index.css        # CSS & Tailwind styling setup
│   │   └── main.jsx         # React mounting entry
│   ├── index.html           # Main template with Google Fonts
│   ├── postcss.config.js    # PostCSS configuration
│   ├── tailwind.config.js   # Tailwind theme variables
│   └── vite.config.js       # Vite proxy & build configuration
├── docker-compose.yml       # Spin up Redis container
└── README.md                # Project documentation
```

---

## Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (running locally on port 27017 or remote Atlas URI)
- [Redis](https://redis.io/) (running locally on port 6379)

---

### Step 1: Clone and Configure Environment

1. Copy the backend environment example file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. The default variables are:
   ```env
PORT=5001
    NODE_ENV=development
    CORS_ORIGIN=http://localhost:5173
    MONGODB_URI=mongodb://127.0.0.1:27017/email_queue_system
    REDIS_HOST=127.0.0.1
    REDIS_PORT=6379
    REDIS_PASSWORD=

    # Leave as placeholders for local JSON mail capture.
    # Set real SMTP details to send real emails.
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your_smtp_username
    SMTP_PASSWORD=your_smtp_password
    ADMIN_EMAIL=admin@example.com
    SMTP_DISABLE_TLS=false
    SMTP_FROM_NAME="Growfinix Booking Desk"
   ```

---

### Step 2: Start Redis

If you have Docker installed, start Redis instantly:
```bash
docker compose up -d
```
Otherwise, make sure the local Redis server is active on `127.0.0.1:6379`.

---

### Step 3: Run the Backend Services

Open two separate terminals in the `backend/` folder:

**Terminal 1: Start the API Server**
```bash
npm install
npm run server
```
*Outputs: `[API] Server running on http://localhost:5001`*

**Terminal 2: Start the Background Queue Worker**
```bash
npm run worker
```
*Outputs: `[WORKER] BullMQ worker started — listening on emailQueue`*

---

### Step 4: Run the Frontend Client

Open a third terminal in the `frontend/` folder:
```bash
npm install
npm run dev
```
*Outputs: `Local: http://localhost:5173/`*

Now, open your browser and navigate to `http://localhost:5173/`.

---

## API Endpoints

### Enquiries
- `POST /api/enquiries` — Create enquiry & queue email confirmation (Asynchronous/Queue path - fast).
- `POST /api/enquiries/sync` — Create enquiry & wait for SMTP send before responding (Direct path - slow).
- `GET /api/enquiries` — Fetch paginated enquiries.
- `GET /api/enquiries/:id` — Fetch detailed enquiry along with related email dispatch logs.

### Queue Monitoring
- `GET /api/queue/stats` — Fetch live BullMQ counters (active, waiting, completed, failed, delayed).
- `GET /api/queue/jobs` — Fetch most recent 20 BullMQ jobs directly from Redis.

### Email Logs & Controls
- `GET /api/emails` — Fetch paginated email dispatch logs with status filters.
- `POST /api/emails/:jobId/retry` — Manually retry a failed email (re-queues in Redis).
- `DELETE /api/emails/:jobId` — Remove email log from database & Redis.

---

## Retry Mechanism & Status Flow

```
   [ pending ]
        |
   [ queued ]  <-------- (Manual Retry Button)
        |                      |
   [ processing ]              |
     /       \                 |
(Success)   (Failure)          |
   /           \               |
[ sent ]     [ failed ]  ======+
```

1. **`pending`**: Initial DB record is created.
2. **`queued`**: Added to BullMQ queue in Redis.
3. **`processing`**: Picked up by the Worker. `attempts` count increments.
4. **`sent`**: Successfully sent via SMTP.
5. **`failed`**: If SMTP fails, the job automatically retries with exponential backoff (up to 3 times). If all retries fail, it remains in `failed` status.
6. **`Manual Retry`**: The admin clicks "Retry" on the dashboard, which clears failures and re-adds the task to the queue for a fresh cycle.

---

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `5001` | Port the Express API listens on (Vite proxies `/api` here). |
| `NODE_ENV` | `development` | Enables stack traces in error responses. |
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated list of allowed frontend origins. |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/email_queue_system` | MongoDB connection string. |
| `REDIS_HOST` | `127.0.0.1` | Redis host. |
| `REDIS_PORT` | `6379` | Redis port. |
| `REDIS_PASSWORD` | *(empty)* | Redis password, if auth is enabled. |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server host. |
| `SMTP_PORT` | `587` | SMTP server port. |
| `SMTP_USER` | `your_smtp_username` | SMTP account. While this (or the password) contains `your_smtp_`, the app **falls back to a JSON transport** and never attempts a real SMTP connection. |
| `SMTP_PASSWORD` | `your_smtp_password` | SMTP account password. |
| `ADMIN_EMAIL` | `admin@example.com` | Recipient for admin notifications and fallback sender address. |
| `SMTP_DISABLE_TLS` | `false` | Set to `true` to disable TLS. |
| `SMTP_FROM_NAME` | `Growfinix Booking Desk` | Display name used as the email sender. |
| `EMAIL_DEMO_DELAY_MS` | `1200` | Artificial latency added to JSON transport sends so the sync path visibly lags. |

---

## Verification Steps

1. **API health** — `GET http://localhost:5001/api/health` should return `{"success": true, "data": {...}}`.
2. **Start the stack** — `docker compose up -d` (Redis), start MongoDB, then `npm run server` and `npm run worker` in `backend/`.
3. **Queue path** — Submit the booking form in *Asynchronous* mode on the frontend; the response should arrive in milliseconds. The worker terminal logs the job being picked up and rendered.
4. **Sync path** — Submit in *Synchronous* mode; the response should take roughly 1.2s (simulated SMTP latency).
5. **Dashboard** — Verify enquiry counts, queue gauges, and the email log table render; statuses transition `queued → processing → sent`.
6. **Retries** — Stop Redis (or force an SMTP failure) so jobs fail; confirm failed jobs appear with a **Retry** button. Click it and watch the job transition back to `queued`/`sent`.

## Troubleshooting

- **`ECONNREFUSED` on Redis** — Redis isn't running. Start it with `docker compose up -d` or a local server on `127.0.0.1:6379`.
- **MongoDB connection refused** — Ensure MongoDB is running on `127.0.0.1:27017` or set `MONGODB_URI` to an Atlas URI.
- **SMTP `EAUTH` errors** — SMTP credentials are invalid. Keep the `your_smtp_*` placeholders to use dev-mode JSON capture instead, or update `.env` with real credentials.
- **Frontend can't reach the API** — Confirm the backend runs on port `5001` (matches the Vite proxy in `frontend/vite.config.js`).
