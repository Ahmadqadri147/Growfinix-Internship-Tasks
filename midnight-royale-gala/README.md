# Midnight Royale Gala - Cinematic Event Booking System

A production-ready luxury event booking platform built with React, Node.js, PostgreSQL, and Redis. Features real-time seat selection, 3D seat maps, Stripe payment integration, QR code ticketing, and a cinematic UI with GSAP/Framer Motion animations.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, GSAP, Framer Motion, Three.js |
| Backend | Node.js, Express, TypeScript, Socket.io |
| Database | PostgreSQL 16 (via Prisma ORM) |
| Cache | Redis 7 (seat locking, session management) |
| Payments | Stripe |
| Auth | JWT (JSON Web Tokens) |
| Containerization | Docker, Docker Compose |
| Proxy | Nginx (SPA routing, reverse proxy) |

## Prerequisites

- Node.js 20+
- Docker and Docker Compose (for containerized setup)
- npm or yarn
- PostgreSQL 16+ (for manual setup)
- Redis 7+ (for manual setup)
- Stripe account (for payment processing)

## Quick Start with Docker

The fastest way to get running is with Docker Compose:

```bash
# Clone and enter the project
cd midnight-royale-gala

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Build and start all services
docker-compose up -d

# Run database migrations and seed data
docker-compose exec backend npx prisma db push
docker-compose exec backend npx prisma db seed
```

Services will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Docker Commands Reference

```bash
# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up -d --build

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Run a command in a service
docker-compose exec backend npx prisma studio
```

## Manual Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials and Stripe keys

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Setup Database

```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Features

- **Cinematic Landing Page** - Immersive hero with Three.js particle field and GSAP scroll animations
- **Event Discovery** - Browse and filter events with dynamic search and category filters
- **3D Seat Selection** - Interactive Three.js seat map with real-time availability
- **Real-Time Booking** - Live seat locking via Socket.io with 5-minute reservation window
- **Secure Checkout** - Stripe payment integration with confirmation emails
- **QR Code Ticketing** - Auto-generated QR codes for event entry
- **User Dashboard** - Manage bookings, view tickets, download PDF receipts
- **Admin Panel** - Event management, venue CRUD, booking oversight, sales analytics
- **Coupon System** - Discount codes with percentage or fixed amount options
- **Responsive Design** - Fully responsive with mobile-first approach
- **Dark/Luxury Theme** - Premium dark UI with gold accents and micro-interactions

## Project Structure

```
midnight-royale-gala/
├── frontend/                    # React SPA (Vite)
│   ├── src/
│   │   ├── api/                 # API client modules
│   │   ├── components/          # UI components
│   │   │   ├── animations/      # GSAP/Framer Motion wrappers
│   │   │   └── three/           # Three.js 3D components
│   │   ├── contexts/            # React contexts
│   │   ├── hooks/               # Custom hooks
│   │   ├── layouts/             # Page layouts
│   │   ├── lib/                 # Utility functions
│   │   ├── pages/               # Route pages
│   │   ├── stores/              # Zustand stores
│   │   ├── types/               # TypeScript types
│   │   └── constants/           # App constants
│   ├── nginx.conf               # Nginx SPA config
│   └── Dockerfile               # Multi-stage build
├── backend/                     # Express API server
│   ├── src/
│   │   ├── config/              # App configuration
│   │   ├── controllers/         # Route handlers
│   │   ├── middleware/          # Express middleware
│   │   ├── routes/              # Route definitions
│   │   ├── services/            # Business logic
│   │   ├── socket/              # Socket.io setup
│   │   ├── utils/               # Helpers (JWT, logger)
│   │   └── validators/          # Input validation
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Seed data
│   └── Dockerfile               # Multi-stage build
├── shared/                      # Shared types/utils
├── docker-compose.yml           # Orchestration
└── .gitignore
```

## API Documentation

Base URL: `/api/v1`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Login and receive JWT |
| POST | /auth/logout | Invalidate session |
| GET | /auth/me | Get current user profile |
| PUT | /auth/profile | Update profile |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /events | List all published events |
| GET | /events/:id | Get event details with ticket types |
| GET | /events/featured | Get featured events |
| GET | /events/upcoming | Get upcoming events |

### Venues

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /venues | List all venues |
| GET | /venues/:id | Get venue details |

### Seats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /seats/event/:eventId | Get seat map for an event |
| POST | /seats/lock | Lock seats for reservation |
| POST | /seats/release | Release locked seats |

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /bookings | Get user's bookings |
| GET | /bookings/:id | Get booking details |
| POST | /bookings | Create a new booking |
| PUT | /bookings/:id/cancel | Cancel a booking |
| GET | /bookings/:id/ticket | Download QR ticket |
| GET | /bookings/:id/invoice | Download PDF invoice |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /payments/create-intent | Create Stripe payment intent |
| POST | /payments/confirm | Confirm payment |
| POST | /payments/webhook | Stripe webhook handler |

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tickets/types/:eventId | Get ticket types for event |

### Coupons

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /coupons/validate | Validate a coupon code |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/dashboard | Dashboard analytics |
| GET | /admin/events | Manage events |
| POST | /admin/events | Create event |
| PUT | /admin/events/:id | Update event |
| DELETE | /admin/events/:id | Delete event |
| GET | /admin/bookings | View all bookings |
| GET | /admin/users | View all users |
| GET | /admin/venues | Manage venues |
| POST | /admin/venues | Create venue |
| PUT | /admin/venues/:id | Update venue |
| DELETE | /admin/venues/:id | Delete venue |
| GET | /admin/sales | Sales analytics |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | API health check |

## License

MIT