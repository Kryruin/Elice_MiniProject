# API Documentation & Architecture Analysis

## Technology Stack Justification
- Frontend: React + Vite + TypeScript
  - Fast DX, HMR, strong typing
  - Alternatives: Vue (smaller team familiarity), Angular (heavier but batteries-included)
- Backend: FastAPI (Python)
  - Declarative APIs, async-first, Pydantic validation
  - Alternatives: Node/Express (ubiquitous), Go/Fiber (performance, but more boilerplate)
- Database: SQLite
  - Zero-setup for assessment, appropriate for single-node dev/demo
  - Alternatives: Postgres (prod-ready), Redis (caching/session), MongoDB (schema-flexible)

## API Design Philosophy
- Resource-oriented, simple REST under `/api/*`
- Cookie-based session (`elice_session`) auto-provisioned; no auth complexity for demo
- External API is normalized to app-specific DTOs to avoid leaking upstream shapes

## Endpoints
- Health
  - `GET /api/health` → `{ status: 'ok' }`
- Session
  - `GET /api/session` → `{ userId }`
- Saved Items
  - `GET /api/saved` → `{ items: [...] }`
  - `POST /api/saved` body `{ id, title, author?, year?, source? }` → `{ ok: true }`
  - `DELETE /api/saved/:id` → `{ ok: true }`
- Progress
  - `GET /api/progress` → `{ progress: { [resourceId]: { status, percent, updatedAt } } }`
  - `PUT /api/progress/:id` body `{ status, percent }` → `{ ok: true }`

## Error Handling & Rate Limits
- External API errors → 500 with `An unexpected error occurred`
- Youtube API errors → Catch specific Google API errors, which will contain more details 
- Simple retry strategy can be added (not required for demo)

## Authentication/Authorization Strategy
- Demo: cookie session only
- Production: add proper user accounts (JWT sessions), CSRF for state-changing routes, HTTPS-only cookies

## Performance & Scalability Considerations
- Scaling frontend: static hosting + CDN
- Scaling backend: FastAPI workers via Uvicorn/Gunicorn; add caching (e.g., Redis) for search results
- DB: migrate to Postgres; add indices on session_id/resource_id
- Bottlenecks now: single process, no cache, SQLite file-locking
- API call optimization: normalize and cache search results; debounce search input on client, paginate
