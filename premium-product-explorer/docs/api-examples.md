# API Examples

Base URL: `http://localhost:5000/api/v1`

Demo credentials: `admin@example.com` / `Admin@123` (admin) — `user@example.com` / `User@123` (user)

---

## Search

```bash
# Single keyword
GET /products?q=wireless

# Multi keyword (all terms must match)
GET /products?q=wireless+headphones

# Keyword across brand/category names + tag matching
GET /products?q=novatech

# Type-ahead suggestions
GET /products/suggestions?q=wire
```

## Filtering

```bash
# Category + brand (slugs) + price range
GET /products?category=electronics&brand=novatech&minPrice=100&maxPrice=500

# Rating, availability, discount
GET /products?minRating=4&availability=IN_STOCK&minDiscount=30

# Multi-value (comma separated)
GET /products?category=electronics,audio&brand=novatech,sonix

# Colors / sizes / location / seller / tags
GET /products?color=Black,White&size=M&location=New+York&tag=wireless

# Featured, date range
GET /products?featured=true&dateFrom=2025-01-01&dateTo=2026-12-31
```

## Sorting

```bash
GET /products?sort=newest        # default
GET /products?sort=price_asc
GET /products?sort=price_desc
GET /products?sort=popular
GET /products?sort=rating_desc
GET /products?sort=best_selling
GET /products?sort=alphabetical
GET /products?sort=featured
GET /products?sort=discount
```

## Pagination

```bash
# page + limit (max limit = 48)
GET /products?page=3&limit=24
GET /products?page=100&limit=48

# Response meta
# { page, limit, total, totalPages, hasNext, hasPrev }
```

## Facets & collections

```bash
GET /products/facets        # priceRange, categories w/ counts, brands, colors, sizes, locations, sellers, tags
GET /products/featured
GET /products/trending
GET /products/new-arrivals
GET /products/best-deals
GET /products/:id
GET /products/:id/related/:categoryId
GET /categories
GET /brands
```

## Auth

```bash
POST /auth/register
# { "name": "Jane", "email": "jane@example.com", "password": "Pass@1234" }

POST /auth/login
# { "email": "user@example.com", "password": "User@123" }
# -> { "token": "eyJhbGci...", "user": {...} }

GET  /auth/me            # Bearer token
PATCH /auth/me           # { "name": "..." } or { "avatar": "..." }
```

## Wishlist, orders, reviews (Bearer token)

```bash
POST   /wishlist/:productId
GET    /wishlist
GET    /wishlist/:productId/status
DELETE /wishlist/:productId

GET  /orders
GET  /orders/:id
POST /orders
# { "items": [ { "productId": "6a6c...", "quantity": 2 } ] }

GET    /reviews/product/:productId?sort=helpful
GET    /reviews/product/:productId/breakdown
POST   /reviews/product/:productId
# { "rating": 5, "title": "Great", "comment": "Loved it" }
POST   /reviews/:id/helpful
DELETE /reviews/:id
```

## Search history

```bash
GET  /search/trending
GET  /search/recent        # Bearer token
POST /search/record
# { "query": "wireless" }   # Bearer token (optional)
DELETE /search/recent      # Bearer token
```

## Admin (admin Bearer token)

```bash
GET    /admin/stats
GET    /admin/revenue?days=30
GET    /admin/top-searches
GET    /admin/search-volume
GET    /admin/most-viewed
GET    /admin/recent-activity
GET    /admin/category-distribution
GET    /admin/products?page=1&limit=24
POST   /admin/products
# { "title": "...", "description": "...", "brandId": "...", "categoryId": "...",
#   "subCategory": "...", "price": 99.99, "stock": 50, "images": ["https://..."],
#   "sku": "optional", ... }
PATCH  /admin/products/:id
DELETE /admin/products/:id
```

## Health

```bash
GET /health
```

## Error shape

```json
{ "success": false, "message": "Product not found" }
```

- Malformed ObjectIds in path params → `404 Resource not found`
- Zod validation failures → `400` with per-field issues
- Unauthenticated → `401`, non-admin on admin routes → `403`
