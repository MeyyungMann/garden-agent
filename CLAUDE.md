# CLAUDE.md — Garden Agent Project Guide

## Overview
Local-first AI garden planning assistant. Conversational AI manages plants, seeds, locations, and planting schedules — all running locally with Ollama (no cloud APIs).

## Tech Stack
- **Framework:** Next.js 16 (App Router, Server Components, Server Actions)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui (Radix), Lucide icons
- **Database:** PostgreSQL 17 + Prisma 7 ORM
- **AI:** Ollama (qwen3:32b), Vercel AI SDK v6, ai-sdk-ollama
- **State:** Zustand (client), React hooks
- **Validation:** Zod v4
- **Infrastructure:** Docker Compose (Postgres + Ollama + App), NVIDIA GPU

## Architecture

### Data Flow
```
User ──► Chat UI ──► /api/chat ──► runAgent() ──► Ollama (streamText)
                                       │                    │
                                  DB context            17 tools
                                  injected              (server-side execute)
```

### Key Directories
```
src/
├── ai/                  # AI agent core
│   ├── agent.ts         # Orchestration: builds DB context, streams to Ollama
│   ├── tools/index.ts   # 17 tool definitions with server-side execute
│   └── prompts/system.ts # GardenAI system prompt
├── actions/             # Server Actions (all CRUD)
│   ├── plants.ts        # getPlants, getPlantById, createPlant, updatePlant, deletePlant
│   ├── seeds.ts         # getSeeds, getSeedById, createSeed, updateSeed, deleteSeed
│   ├── locations.ts     # getLocations, createLocation, updateLocation, deleteLocation
│   ├── plantings.ts     # getPlantings, createPlanting, updatePlanting, deletePlanting
│   ├── dashboard.ts     # getDashboardSummary
│   └── chat.ts          # createSession, saveMessage, getLatestSession, summarize
├── app/                 # Next.js pages (App Router)
│   ├── page.tsx         # Dashboard
│   ├── plants/          # Plant catalog + [id] detail
│   ├── seeds/           # Seed inventory + [id] detail
│   ├── garden/          # Garden locations
│   ├── calendar/        # Planting timeline
│   ├── chat/            # Fullscreen chat page
│   └── api/chat/route.ts # POST endpoint
├── components/
│   ├── chat/            # Chat UI (panel, messages, input, tool-result-card)
│   ├── crud/            # CRUD dialogs (plant, seed, location, planting forms + actions)
│   ├── layout/          # App shell, sidebar, header
│   ├── calendar/        # Timeline, status badges, year selector
│   └── ui/              # shadcn/ui primitives
├── hooks/
│   └── use-chat-agent.ts # useChat wrapper with session persistence + navigation
├── lib/
│   ├── db.ts            # Prisma client singleton
│   ├── ollama.ts        # Ollama provider config
│   ├── logger.ts        # createLogger utility
│   ├── format.ts        # formatEnum, date helpers
│   └── utils.ts         # cn() classname utility
└── types/index.ts       # Re-exports from generated Prisma types
```

## Database Models (Prisma)
- **Plant** — name, variety, type, daysToMaturity, sunRequirement, waterNeeds, growingNotes
- **Seed** — plantId (FK), quantity, quantityUnit, supplier, viability, purchaseDate, expiryDate
- **GardenLocation** — name, locationType, sunExposure, soilType, climateZone
- **Planting** — plantId (FK), locationId (FK), year, dates (sow/transplant/harvest), status
- **ChatSession / ChatMessage** — chat persistence with summary support

### Enums
- PlantType: VEGETABLE, HERB, FLOWER, FRUIT, OTHER
- SunRequirement: FULL_SUN, PARTIAL_SUN, SHADE
- WaterNeeds: LOW, MODERATE, HIGH
- LocationType: BED, POT, CONTAINER, ROW, GREENHOUSE, INDOOR, OTHER
- PlantingStatus: PLANNED, SOWN, GERMINATED, TRANSPLANTED, GROWING, HARVESTING, DONE, FAILED

## AI Tools (17 total)
| Entity | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| Plants | addPlant | searchPlants | updatePlantTool | deletePlantTool |
| Seeds | addSeed | getSeedInventory | updateInventory | deleteSeedTool |
| Locations | addLocation | getLocations | updateLocationTool | deleteLocationTool |
| Plantings | createPlanting | getPlantingSchedule | updatePlanting | deletePlantingTool |

Plus: `getDashboardSummary`, `navigateTo`

### Anti-Hallucination Pattern
`agent.ts` fetches ALL database state (locations, plants, seeds, plantings) before each request and injects it into the system prompt with real IDs. The model sees ground truth and is instructed to NEVER invent IDs.

## Development

### Commands
```bash
npm run dev              # Local dev server
npm run build            # Production build
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed sample data
npm run db:reset         # Reset DB
```

### Docker (primary workflow)
```bash
docker compose up -d                    # Start all services
docker compose up -d --build app        # Rebuild app after dependency changes
docker compose restart app              # Restart after code changes (if hot reload fails)
docker compose logs -f app              # Watch logs
```
Hot reload works via WATCHPACK_POLLING=true (required for Docker on Windows).

### Environment Variables
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/plant_organizer?schema=public
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:32b
```

## Patterns & Conventions

### CRUD Consistency
Every entity (Plant, Seed, Location, Planting) must have:
1. **Server Actions** in `src/actions/` — get, getById, create, update, delete
2. **AI Tools** in `src/ai/tools/index.ts` — matching CRUD tools with server-side execute
3. **UI CRUD components** in `src/components/crud/` — form dialog + actions (Add/Edit/Delete buttons)
4. **System prompt** in `src/ai/prompts/system.ts` — documenting all capabilities
5. **Database context** in `src/ai/agent.ts` — entity included in `buildDatabaseContext()`

When adding a new entity, update ALL five layers.

### Component Patterns
- Pages are Server Components (async, fetch data directly)
- CRUD forms are "use client" with useState per field
- Forms call server actions directly, then `router.refresh()` to revalidate
- Delete uses shared `DeleteConfirmationDialog`
- Format enums with `formatEnum()` from `src/lib/format.ts`

### AI Tool Pattern
```typescript
toolName: tool({
  description: "...",
  inputSchema: z.object({ ... }),
  execute: async (params) => {
    log.info("toolName called", params);
    try {
      const result = await serverAction(params);
      return { success: true as const, data: { ... } };
    } catch (error) {
      log.error("toolName failed", { error });
      return { success: false as const, error: "User-friendly message" };
    }
  },
})
```

### Chat Architecture
- `useChatAgent` hook lives in `ChatPanel` (not in child components) to survive fullscreen toggle
- Navigation tool results are handled via useEffect watching `chat.messages` (not onToolCall)
- Raw `<tools>` XML stripped from displayed text via regex in `chat-messages.tsx`
- Sessions auto-save messages, auto-summarize after 10+ new messages

### Logging
Use `createLogger("namespace")` from `src/lib/logger.ts`. Namespaces: `ai:agent`, `ai:tools`, `actions:plants`, `hooks:chat-agent`, `api:chat`, etc.

## User Preferences
- Always run in Docker unless explicitly told otherwise
- No .sh entrypoint files — inline commands in docker-compose.yml
- Sidebar has garden illustration background (`public/sidebar-garden.png`)
