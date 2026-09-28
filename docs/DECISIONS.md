# BuildOrbit — Decisions Log

> This file records all non-trivial technical and architectural decisions made during the development of BuildOrbit. Each entry explains what was decided, why, and when.

---

## Decision Log

---

### [DEC-001] Technology Stack Selection

**Date:** 2026-09-28
**Status:** ✅ Confirmed

**Decision:**
The following technology stack was selected for BuildOrbit:

| Layer | Technology | Reason |
|---|---|---|
| Frontend Framework | Next.js (App Router) | Full-stack React framework with built-in routing, SSR, and API route support |
| Language | TypeScript | Type safety across the entire stack (frontend + backend + DB layer) |
| Styling | Tailwind CSS | Utility-first CSS with design token support, widely adopted in enterprise tooling |
| Component Library | shadcn/ui | Accessible, composable components built on Radix UI; not a black-box library |
| Backend | Next.js Route Handlers | Avoids needing a separate backend server; suitable for internal tools at this scale |
| Database | PostgreSQL | Robust, production-grade relational database with excellent Prisma support |
| ORM | Prisma | Type-safe database access, auto-generated types, clean migration system |
| Validation | Zod | Runtime schema validation, integrates well with TypeScript and React Hook Form |
| Auth (passwords) | bcrypt | Industry standard for password hashing |
| Charts | Recharts | React-native charting library, sufficient for dashboard KPIs and reports |
| Icons | Lucide React | Clean, consistent icon set; official icon library for shadcn/ui |
| Version Control | Git + GitHub | Standard |

**Alternatives considered:** None formally evaluated at this stage. Stack was specified as a requirement.

**Impact:** All code, tooling, and configuration in this project must conform to this stack. Changes require a new decision entry.

---

### [DEC-002] Documentation-First Development Approach

**Date:** 2026-09-28
**Status:** ✅ Confirmed

**Decision:**
Before any code is written, a complete documentation structure is established in `docs/`. Documentation must be kept in sync with the codebase throughout development.

**Reason:**
This ensures every decision is traceable, every architectural choice is intentional, and the project state is always clear — regardless of who is working on it.

**Impact:** Every significant code change must be accompanied by a documentation update in the appropriate `docs/` file.

---

### [DEC-003] Authentication Strategy

**Date:** 2026-09-28
**Status:** 🔵 Pending — Decision required before Phase 2

**Options under consideration:**
1. **JWT stored in HttpOnly cookies** — Stateless, no DB lookup on each request, simple to implement
2. **Database sessions (via Prisma)** — Stateful, sessions can be revoked server-side, more secure
3. **NextAuth.js / Auth.js** — Third-party library that handles both; adds a dependency

**Decision:** TBD — Will be decided before authentication implementation begins.

---

### [DEC-004] Primary Key Strategy

**Date:** 2026-09-28
**Status:** 🔵 Pending — Decision required before database schema is created

**Options under consideration:**
1. **UUID** (`String @id @default(uuid())`) — Non-guessable, URL-safe, no sequential leakage
2. **Auto-increment Integer** (`Int @id @default(autoincrement())`) — Simpler, smaller, faster joins
3. **CUID** (`String @id @default(cuid())`) — Similar to UUID but Prisma-native, collision-resistant

**Decision:** TBD — Will be decided before the first Prisma schema is written.

---

_Last updated: 2026-09-28_
