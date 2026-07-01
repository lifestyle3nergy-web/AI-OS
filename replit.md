# AI OS v1.0

A futuristic mobile OS interface for the Lifestyle Energy ecosystem — a full-featured Expo app with live system metrics, AI chat, agent management, project tracking, and lifestyle analytics.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Mobile: Expo (React Native), expo-router, expo-blur, react-native-reanimated

## Where things live

- `artifacts/mobile/` — Expo mobile app (AI OS v1.0)
- `artifacts/mobile/app/(tabs)/` — Dashboard, Chat, Agents, Projects, Settings tabs
- `artifacts/mobile/app/` — Sub-pages: memory, research, energy, automations, reports
- `artifacts/mobile/context/AppContext.tsx` — Global state with simulated live system metrics
- `artifacts/mobile/components/` — GlassCard, MetricCard, AgentCard, ProjectCard, ChatBubble
- `artifacts/mobile/constants/colors.ts` — Dark-only theme tokens (neon purple + cyan)
- `artifacts/api-server/` — Express API server
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)

## Architecture decisions

- Dark-only theme: AI OS is always in dark mode — both `light` and `dark` color keys use the same deep-black palette.
- Live simulation: `AppContext` uses `setInterval(2500ms)` to generate random system metrics, mimicking a WebSocket feed — no backend required for the dashboard.
- AsyncStorage persistence: Projects and memories persist across app launches via `@react-native-async-storage/async-storage`.
- Glassmorphism: `GlassCard` uses `expo-blur` BlurView on iOS for native glass, falls back to semi-transparent dark card on Android/web.
- Pluggable agent mock: Agent state lives in context with status toggling; ready to be wired to real API calls via the Express backend.

## Product

- **Dashboard** — Live system metrics (CPU, RAM, Battery, Storage, Network), running agents, quick access, recent activity
- **AI Chat** — Conversational interface with PAI assistant (mock responses, chat history)
- **Agent Manager** — View/filter/control all 7 agents (PAI Core, Research, Memory, Automation, Energy, Content, Device Optimizer)
- **Projects** — Create/delete/track projects with progress bars and status badges (AsyncStorage persistence)
- **Settings** — System config, agent preferences, notifications, privacy
- **Memory Manager** — Store/categorize/delete memory entries with importance levels
- **Research Hub** — Search and browse AI-curated research papers
- **Lifestyle Energy** — Energy level tracking, daily metrics, AI recommendations, energy timeline
- **Automations** — Toggle and monitor automation pipelines
- **Reports** — Charts for task completion, energy correlation, agent performance KPIs

## Gotchas

- The mobile workflow runs Expo at a dynamic port via `$PORT` — never hardcode port numbers.
- The NativeTabs path (iOS 26+ liquid glass) and ClassicTabs path (older iOS/Android/web) are both implemented in `app/(tabs)/_layout.tsx`.
- `pnpm run typecheck` validates all packages; prefer it over editor LSP when they disagree.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
