# Architecture & Product Decisions (ADRs)

## ADR 001: Brand Identity & Product Naming — CEOWEB
- **Date**: 2026-10-06
- **Context**: The product transitioned from the early prototype name "NinjaLoop" to the official name **CEOWEB**.
- **Decision**:
  - **Product Name**: CEOWEB
  - **Proposed Tagline**: *Lead your network, build your legacy, master the loop.*
  - **Visual Identity**: Modern executive-cyber aesthetic. Custom SVG wordmark featuring a stylized crown inside an interconnected hexagonal network node with Katana Crimson (`#E11D48`) and Cyber Cyan (`#06B6D4`) gradients.
  - **Terminology Alignment & Legacy Notes**:
    - The underlying martial arts belt ranks progression (White -> Yellow -> Orange -> Green -> Blue -> Brown -> Black Belt Master) and streak mechanics remain fully functional to preserve gamification test integrity.
    - User-facing references to "ninjas" or "clans" have been refactored to CEOWEB executives, founders, networks, and dojo guilds. In upcoming phases, clan terminology can be further styled as "Guilds" or "Executive Circles" if desired.

## ADR 002: Dual-Mode Backend Architecture (Supabase Real + Mock Store Fallback)
- **Date**: 2026-10-06
- **Context**: Admissions evaluators and reviewers must be able to inspect and test the live UI immediately without needing Supabase cloud API credentials, while production deployments need full Postgres, Auth, Storage, and Realtime WebSocket subscriptions.
- **Decision**: Implement an environmental feature toggle: when valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are detected, real Supabase client queries and channels are used; otherwise, the in-memory/localStorage seed store automatically services requests with a visual dev indicator badge.

## ADR 003: Russian Localization Default & Organic Community Identity
- **Date**: 2026-10-06
- **Context**: The user requested a default Russian interface experience, removing fake "demo" banners and bot labels in favor of authentic user profiles.
- **Decision**: Implemented `LanguageContext` and comprehensive bilingual dictionary (`src/lib/i18n.ts`) with Russian (`ru`) set as the default language. Removed artificial "demo" badges and bot placeholders across all screens.

## ADR 004: Ephemeral Security & Unified Social Data Persistence
- **Date**: 2026-10-06
- **Context**: Ephemeral stories and view-once snaps require strict lifecycle enforcement (24h auto-expiry and single-view burning) across both Node test runners and browser sessions.
- **Decision**: Created `src/lib/socialDataService.ts` with dual storage (in-memory Map cache + browser localStorage + optional Supabase). Enforced server/client 24h expiration on stories and single-view status burning (`status: 'opened'`) on snaps, verified via automated Vitest test suites.
