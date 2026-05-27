# Graph Report - .  (2026-05-27)

## Corpus Check
- Corpus is ~40,807 words - fits in a single context window. You may not need a graph.

## Summary
- 295 nodes · 533 edges · 20 communities (15 shown, 5 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core App Layer|Core App Layer]]
- [[_COMMUNITY_Backend API Routes|Backend API Routes]]
- [[_COMMUNITY_UI Page Components|UI Page Components]]
- [[_COMMUNITY_API Route Handlers|API Route Handlers]]
- [[_COMMUNITY_Project Config|Project Config]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Audit & Event System|Audit & Event System]]
- [[_COMMUNITY_Product Docs & i18n|Product Docs & i18n]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_Auth Middleware|Auth Middleware]]
- [[_COMMUNITY_Dev Tool Config|Dev Tool Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Styling Config|Styling Config]]
- [[_COMMUNITY_Seed Data|Seed Data]]
- [[_COMMUNITY_Supabase Client|Supabase Client]]

## God Nodes (most connected - your core abstractions)
1. `getAppVersion()` - 30 edges
2. `Database` - 19 edges
3. `compilerOptions` - 16 edges
4. `useToast()` - 16 edges
5. `NewClientPage` - 15 edges
6. `createClient()` - 14 edges
7. `clients table (initial)` - 14 edges
8. `ClientDetailPage` - 13 edges
9. `Supabase Auth` - 12 edges
10. `createClient()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Client Portal (no-login token-based access)` --conceptually_related_to--> `generatePortalToken()`  [INFERRED]
  project.md → lib/utils.ts
- `Portal Token Rotation` --conceptually_related_to--> `generatePortalToken()`  [INFERRED]
  project.md → lib/utils.ts
- `getAppVersion()` --implements--> `Port-based version detection`  [INFERRED]
  lib/version.ts → V2_SETUP_INSTRUCTIONS.md
- `getAppVersion()` --implements--> `Dual-port setup (v1 port 3000, v2 port 3007)`  [INFERRED]
  lib/version.ts → V2_SETUP_INSTRUCTIONS.md
- `Slovenian translations (sl)` --references--> `Normiran s.p. (Slovenian sole proprietor)`  [INFERRED]
  lib/i18n/sl.ts → PDR_version-2_0.md

## Communities (20 total, 5 thin omitted)

### Community 0 - "Core App Layer"
Cohesion: 0.08
Nodes (37): metadata, RootLayout(), PortalLinkCard(), PortalLinkCardProps, Toast, ToastContext, ToastContextType, ToastProvider() (+29 more)

### Community 1 - "Backend API Routes"
Cohesion: 0.08
Nodes (19): ClientsList(), ClientsListProps, ClientWithMetrics, FilterType, genAI, sl, TranslationKey, ClientDetailPage() (+11 more)

### Community 2 - "UI Page Components"
Cohesion: 0.12
Nodes (41): LoginPage, ClientDetailPage, NewClientPage, DocumentsPage, HelpPage, DashboardLayout, PacksPage, DashboardPage (+33 more)

### Community 3 - "API Route Handlers"
Cohesion: 0.10
Nodes (40): AI Compose Reminder API Route, AI Generate Tasks API Route, AI Support Copilot API Route, AI Triage Help API Route, Portal Token Rotate API Route, Send Reminder API Route, Portal Task Mark Done API Route, Portal Task Mark Needs Help API Route (+32 more)

### Community 4 - "Project Config"
Cohesion: 0.09
Nodes (21): author, description, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/forms, keywords (+13 more)

### Community 5 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 6 - "Audit & Event System"
Cohesion: 0.12
Nodes (16): AuditEvent, AuditEventType, createAuditEvent(), getAuditEventsForClient, updateSession, createClient (server), Audit Log (immutable event trail), Bookkeeper Persona (+8 more)

### Community 7 - "Product Docs & i18n"
Cohesion: 0.18
Nodes (17): AI Setup Instructions (Gemini), Google Gemini API integration, Provider-Agnostic AI Architecture, Slovenian translations (sl), Accounting Operations OS (v2.0 concept), Normiran s.p. (Slovenian sole proprietor), Sortify v2.0 PRD (Slovenia), Account Type Selection (Firm vs Solo) (+9 more)

### Community 8 - "Runtime Dependencies"
Cohesion: 0.12
Nodes (16): dependencies, date-fns, dotenv, @google/generative-ai, nanoid, next, react, react-dom (+8 more)

### Community 9 - "Auth Middleware"
Cohesion: 0.38
Nodes (4): config, middleware(), updateSession(), Json

## Knowledge Gaps
- **99 isolated node(s):** `config`, `nextConfig`, `config`, `name`, `version` (+94 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getAppVersion()` connect `Core App Layer` to `Backend API Routes`, `UI Page Components`, `API Route Handlers`, `Product Docs & i18n`?**
  _High betweenness centrality (0.223) - this node is a cross-community bridge._
- **Why does `ClientActions()` connect `API Route Handlers` to `Core App Layer`, `Backend API Routes`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Why does `Database` connect `UI Page Components` to `Core App Layer`, `Auth Middleware`, `Backend API Routes`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getAppVersion()` (e.g. with `Port-based version detection` and `Dual-port setup (v1 port 3000, v2 port 3007)`) actually correct?**
  _`getAppVersion()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `nextConfig`, `config` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core App Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `Backend API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.07878787878787878 - nodes in this community are weakly interconnected._