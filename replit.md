# Grownox

AI-powered smart farming platform for Filipino farmers, built exclusively for the Philippines using official PSGC (Philippine Standard Geographic Code) location data and Department of Agriculture market data.

## Run & Operate

- `npm run dev` — start the application (frontend + API server on port 3000)
- `bash scripts/start-api-server.sh` — start API server directly (port 8080)
- `npm run typecheck` — full typecheck across all packages
- `npm run build` — typecheck + build all packages
- Required env: `GEMINI_API_KEY` (Gemini AI), `DATABASE_URL` (optional Postgres)

## Stack

- Node.js, TypeScript
- API: Express 5 (port 3000 / 8080)
- DB: Drizzle ORM / SQLite / PostgreSQL
- Validation: Zod (`zod/v4`), `drizzle-zod`
- AI Features: Gemini API (@google/genai)
- Build: esbuild + Vite
- Frontend: React + Vite + Tailwind CSS + Wouter + TanStack Query

## Where things live

- `artifacts/agri-assistant/` — React frontend
- `artifacts/api-server/` — Express backend
- `artifacts/api-server/src/routes/chat.ts` — AI chat route (Gemini API)
- `artifacts/api-server/src/routes/farming-plan.ts` — PSGC-strict farm planning
- `artifacts/api-server/src/routes/marketplace.ts` — Real user crop marketplace
- `lib/db/src/schema/` — DB schema (farming_plans, ph-crops, marketplace)
- `scripts/start-api-server.sh` — API server launcher

## Product Features

- **Dashboard**: Overview with weather hero, category nav cards, market prices, AI summaries
- **Weather**: Live + forecast weather for the farmer's PSGC location
- **Crops**: Philippine crop database (DA Philippines data)
- **Market**: Live DA commodity market prices with AI insights
- **Marketplace**: Real user crop listings, buyer cart, direct order placement, and seller listing management
- **Farm Planner**: GDD-based farming schedules using climate data. PSGC-locked.
- **AI Chat** (`/chat`): Agriculture specialist assistant powered by Gemini API. Answers questions about crops, pests, fertilizers, weather, and market prices.
- **Settings**: PSGC location management, crop profile, language & theme preferences

