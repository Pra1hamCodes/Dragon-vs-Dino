# Dragon-Dino

An infinite 3D side-scrolling runner where you control a dinosaur dodging dragons. Built with React, Three.js, and Node.js.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Three.js (R3F), Framer Motion, Tailwind CSS |
| State | Zustand (game), TanStack Query (server), React Hook Form + Zod |
| 3D Engine | @react-three/fiber, @react-three/drei, @react-three/cannon, @react-three/postprocessing |
| Backend | Node.js 20, Express 5, TypeScript, Socket.io 4 |
| Database | PostgreSQL (Supabase), Prisma ORM |
| Cache | Redis (Upstash) |
| Auth | JWT (RS256) + refresh token rotation, OAuth (Google, GitHub) |
| Deployment | Vercel (web), Railway (API), Supabase (DB), Upstash (Redis) |
| CI/CD | GitHub Actions |
| PWA | vite-plugin-pwa with offline support |

## Project Structure

```
dragon-dino/
├── apps/
│   ├── web/          # React frontend (Vite)
│   └── api/          # Express backend
├── packages/
│   └── shared/       # Shared types & Zod schemas
└── .github/workflows/  # CI/CD
```

## Local Development

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- PostgreSQL (or Supabase project)
- Redis (or Upstash)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd dragon-dino
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your database, Redis, and auth credentials

# Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate

# Seed demo data
pnpm db:seed

# Start dev servers (web + api concurrently)
pnpm dev
```

The web app runs at `http://localhost:5173`, API at `http://localhost:3001`.

## Environment Variables

See [.env.example](.env.example) for all required variables with documentation.

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL for frontend |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` | RS256 keypair for JWT signing |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Supabase project credentials |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `MAX_SCORE_RATE` | Anti-cheat: max score per second |

## Game Features

- **3D World** — Procedural terrain with biome transitions, parallax backgrounds, day/night cycle
- **Physics** — Cannon.js physics for jumping, collision detection
- **Power-ups** — Shield, magnet, double jump, slow-mo, 2x score
- **Boss Fights** — Every 500 points: face the Dragon King
- **Multiplayer** — Real-time Socket.io races (up to 4 players)
- **Season Pass** — 10-tier progression with rewards
- **Leaderboard** — Redis-cached daily/weekly/all-time rankings
- **Anti-Cheat** — Score validation, input hash verification, session tokens
- **PWA** — Installable, works offline, background score sync
- **Mobile** — Touch controls, accelerometer support, haptic feedback

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web + API dev servers |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed demo data |

## Deployment

### Frontend (Vercel)

1. Connect repo to Vercel
2. Set root directory to `apps/web`
3. Add environment variables (VITE_ prefix)
4. Deploy

### Backend (Railway)

1. Connect repo to Railway
2. Use the Dockerfile at `apps/api/Dockerfile`
3. Add environment variables
4. Deploy

### Database (Supabase)

1. Create a Supabase project
2. Copy the connection string to `DATABASE_URL`
3. Run `pnpm db:migrate` to apply schema
4. Run `pnpm db:seed` for initial data

## License

MIT
