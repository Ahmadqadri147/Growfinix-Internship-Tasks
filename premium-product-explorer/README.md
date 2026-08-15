# Premium Product Explorer

Enterprise-grade Full-Stack **Search, Filtering, Sorting & Pagination** platform with a 50,000-product dataset.

## Stack

| Layer    | Technology |
| -------- | ---------- |
| Backend  | Node.js 22, Express 5, TypeScript, Prisma ORM, MongoDB (replica set), JWT, Zod, express-rate-limit |
| Frontend | React 19, Vite 6, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, Zustand, Framer Motion, Recharts |
| Infra    | Docker Compose (API + Nginx-served client), 50k seeded products |

## Project structure

```
premium-product-explorer/
├── backend/            # Express REST API (TypeScript)
│   ├── prisma/         # schema.prisma + seed.ts (50k products, 14 users, 60 brands, 20 categories)
│   └── src/
│       ├── controllers/  routes/  middleware/
│       ├── services/     validators/   utils/
│       └── server.ts
├── client/             # React SPA (Vite)
│   └── src/
│       ├── components/  hooks/  pages/  services/  stores/  types/
└── docker-compose.yml  # api + web (nginx)
```

## Features

- **Search** — multi-keyword full-text across title, description, subCategory, brand, category, and exact tag matches
- **Filtering** — category/brand (slug), subCategory, color, size, location, seller, tag, availability, price range, min rating, min discount, featured, date range
- **Sorting** — newest, oldest, price asc/desc, rating, popularity, best-selling, alphabetical, featured, discount
- **Pagination** — page/limit (max 48) with full meta (`total`, `totalPages`, `hasNext`, `hasPrev`)
- **Suggestions** — debounced type-ahead across products, categories and brands
- **Facets** — global filter sidebar with price range, counts, colors, sizes, locations, sellers, tags
- **Auth & RBAC** — register/login (JWT), admin-only product management + analytics dashboard
- **Shopping flows** — wishlist, orders (transactional with stock decrement), reviews with rating refresh
- **Analytics** — revenue by day, top searches, most-viewed, category distribution, recent activity

## Quick start

### 1. Prerequisites

- Node.js >= 20, npm
- MongoDB >= 7 with a **replica set** (Prisma transactions require it)

### 2. Backend

```bash
cd backend
cp .env.example .env        # edit DATABASE_URL / JWT_SECRET as needed
npm install
npm run prisma:push         # create indexes & collections
npm run seed                # 50k products + demo users (~1-2 min)
npm run dev                 # API on http://localhost:5000/api/v1
```

> **MongoDB replica set required.** Prisma needs MongoDB running as a replica set
> (single-node is fine). The bundled setup uses a dedicated instance on port
> `27018` — start it with `../scripts/start-mongo.ps1` (after a reboot), or point
> `DATABASE_URL` at any replica-set MongoDB. Seeding on top of existing data is
> safe: the seed clears collections without dropping indexes.

> Re-seed only products (keeps users/orders/reviews): `npm run seed:products`

### 3. Frontend

```bash
cd client
cp .env.example .env        # VITE_API_BASE_URL=/api/v1
npm install
npm run dev                 # dev server on http://localhost:5173 (proxies /api -> :5000)
```

### 4. Docker (optional)

```bash
docker compose up --build   # api on :5000, web on :80
```

## Demo accounts

| Role  | Email             | Password   |
| ----- | ----------------- | ---------- |
| Admin | admin@example.com | Admin@123  |
| User  | user@example.com  | User@123   |

## Example API calls

See [`docs/api-examples.md`](docs/api-examples.md) for a full collection of `curl`/PowerShell requests covering search, filters, sorting, pagination, auth, cart-less shopping flows (wishlist, orders, reviews) and admin endpoints.

Highlights:

```bash
# Search with sorting + pagination
GET /api/v1/products?q=wireless&sort=popular&page=1&limit=24

# Combined filtering
GET /api/v1/products?category=electronics&brand=novatech&minPrice=100&maxPrice=500&minRating=4

# Facets for the filter sidebar
GET /api/v1/products/facets

# Suggestions
GET /api/v1/products/suggestions?q=wire
```

## Quality gates

```bash
# backend
npm run typecheck && npm run lint && npm run build

# client
npm run typecheck && npm run lint && npm run build
```

## Performance notes

- Prisma MongoDB **relation filters translate to full-collection `$lookup` aggregations** — all brand/category filters are resolved to plain `brandId`/`categoryId` `$in` queries first (uses `Product_brandId_idx` / `Product_categoryId_idx`). Search latency on 50k docs: ~0.05–0.9 s.
- Facet counting is served by a single global `/products/facets` endpoint (cached client-side), so paged list requests stay lightweight.
- Parameterized id routes reject malformed ObjectIds with 404 (no P2023 500s).
