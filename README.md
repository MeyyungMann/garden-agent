# Plant & Seed Organizer

A local-first AI agent webapp for organizing plants, seeds, and garden planning. Features a conversational AI assistant that can manage your garden data, plan planting schedules, and navigate the app — all running locally with no cloud dependencies.

## Features

- **AI Chat Assistant** — Conversational agent that can create plants, manage seeds, schedule plantings, and navigate pages
- **Dashboard** — Overview with stats, upcoming tasks, and active plantings
- **Plant Catalog** — Browse plants with sun/water requirements and days to maturity
- **Seed Inventory** — Track seed lots with quantity, supplier, viability, and expiry
- **Garden Locations** — Manage beds, pots, containers, and greenhouse spaces
- **Planting Calendar** — Month-by-month timeline view with visual lifecycle bars
- **Status Tracking** — Full planting lifecycle: PLANNED → SOWN → GERMINATED → TRANSPLANTED → GROWING → HARVESTING → DONE

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| Database | PostgreSQL 17, Prisma 7 ORM |
| AI | Ollama (local LLM), Vercel AI SDK v6, ai-sdk-ollama |
| Infrastructure | Docker, Docker Compose, NVIDIA GPU support |

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose
- [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) (for GPU acceleration)
- [Node.js 22+](https://nodejs.org/) (for local development)

## Quick Start (Docker)

```bash
# 1. Clone the repo
git clone https://github.com/MeyyungMann/garden-agent.git
cd garden-agent

# 2. Start all services (PostgreSQL, Ollama, App)
docker compose up -d

# 3. Run database migrations
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/plant_organizer" npx prisma migrate deploy

# 4. Seed the database with sample data
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/plant_organizer" npx tsx prisma/seed.ts

# 5. Pull the AI model
docker exec garden-agent-ollama-1 ollama pull qwen3:32b

# 6. Open the app
open http://localhost:3000
```

## Local Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL and OLLAMA_BASE_URL

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run db:seed

# Start the dev server
npm run dev
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| App | `localhost:3000` | Next.js webapp |
| PostgreSQL | `localhost:5433` | Database (mapped to 5433 to avoid conflicts) |
| Ollama | `localhost:11434` | Local LLM server |

## AI Agent Tools

The chat assistant has 10 tools it can use:

| Tool | Description |
|------|-------------|
| `searchPlants` | Query plants by name, type, or variety |
| `addPlant` | Create a new plant entry |
| `addSeed` | Add a seed lot linked to a plant |
| `updateInventory` | Update seed quantity, viability, or notes |
| `getPlantingSchedule` | Fetch plantings for a date range or location |
| `createPlanting` | Schedule a new planting |
| `updatePlanting` | Update planting status or dates |
| `getLocations` | List garden locations |
| `getDashboardSummary` | Get aggregate stats |
| `navigateTo` | Navigate to any page in the app |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/chat/route.ts   # AI chat endpoint
│   ├── calendar/           # Planting calendar
│   ├── garden/             # Garden locations
│   ├── plants/             # Plant catalog
│   ├── seeds/              # Seed inventory
│   └── page.tsx            # Dashboard
├── ai/
│   ├── agent.ts            # streamText config + tool registration
│   ├── tools/index.ts      # All 10 tool definitions
│   └── prompts/system.ts   # System prompt
├── actions/                # Server actions for CRUD
├── components/
│   ├── chat/               # Chat panel, messages, input
│   ├── calendar/           # Timeline, status badges
│   ├── layout/             # App shell, sidebar, header
│   └── ui/                 # shadcn/ui components
├── hooks/                  # useChat agent wrapper
└── lib/                    # DB client, Ollama provider, logger
prisma/
├── schema.prisma           # 5 models, 4 enums
├── seed.ts                 # Sample data
└── migrations/
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `qwen2.5` | LLM model name |

## GPU Support

GPU acceleration is enabled by default in `docker-compose.yml` for NVIDIA GPUs. To disable it, comment out the `deploy` section under the `ollama` service.

The app is configured to use `qwen3:32b` (20 GB) which fits comfortably on GPUs with 24+ GB VRAM.

## Common Commands

```bash
# View logs
docker compose logs -f app

# Restart a service
docker compose restart app

# Check Ollama model status
docker exec garden-agent-ollama-1 ollama ps

# Stop all services
docker compose down

# Stop and remove volumes (wipes database)
docker compose down -v
```
