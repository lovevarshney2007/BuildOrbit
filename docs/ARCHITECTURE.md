# BuildOrbit — Architecture

> **Status:** PHASE 1 — Database foundation complete. Application shell (Sidebar + Header + AppShell) implemented. Next.js 16.3.6 with App Router running at `http://localhost:3000`.

---

## Overview

BuildOrbit is a full-stack web application built on **Next.js with the App Router**. The application uses a monorepo-style single Next.js project where the frontend (React pages) and backend (Route Handlers) coexist.

```
Browser (React / Next.js)
        │
        ▼
Next.js App Router
  ├── /app/(app)/         → Protected application pages (AppShell)
  ├── /app/(auth)/        → Auth pages (planned)
  └── /app/api/           → Backend Route Handlers (planned)
        │
        ▼
src/lib/prisma.ts         → Singleton PrismaClient (server-only)
        │
        ▼
Prisma ORM (v5.22.0)
        │
        ▼
PostgreSQL Database
```

---

## Directory Structure

```
buildorbit/
├── src/
│   ├── app/                             # ✅ Next.js App Router root
│   │   ├── layout.tsx                   # ✅ Root layout (Inter font, BuildOrbit metadata)
│   │   ├── page.tsx                     # ✅ Root page → redirect to /dashboard
│   │   ├── globals.css                  # ✅ Global styles (Tailwind v4 + CSS variables)
│   │   ├── (app)/                       # ✅ Protected route group (AppShell layout)
│   │   │   ├── layout.tsx               # ✅ Mounts AppShell for all protected pages
│   │   │   └── dashboard/
│   │   │       └── page.tsx             # ✅ Dashboard placeholder
│   │   ├── (auth)/                      # ❌ Planned — login, register
│   │   └── api/                         # ❌ Planned — Route Handlers
│   │       ├── auth/
│   │       ├── users/
│   │       └── ...
│   │
│   ├── components/
│   │   ├── ui/                          # ✅ shadcn/ui base components
│   │   └── layout/
│   │       ├── AppShell.tsx             # ✅ Layout compositor
│   │       ├── Sidebar.tsx              # ✅ Fixed left sidebar
│   │       └── Header.tsx              # ✅ Fixed top header
│   │
│   └── lib/
│       ├── prisma.ts                    # ✅ Singleton PrismaClient (server-only)
│       ├── navigation.ts                # ✅ Role-aware navigation config
│       └── utils.ts                     # ✅ cn() utility (clsx + tailwind-merge)
│
├── prisma/
│   ├── schema.prisma                    # ✅ Database schema (User + Role enum)
│   ├── seed.ts                          # ✅ Development seed (SUPER_ADMIN)
│   └── migrations/                      # ⏳ Pending — created when migrate dev runs
│
├── docs/                                # ✅ Project documentation
├── public/                              # ✅ Static assets
├── .env                                 # ❌ Not committed — real secrets (create from .env.example)
├── .env.example                         # ✅ Committed — variable names, no real values
├── .gitignore                           # ✅ Excludes .env, node_modules, .next
├── next.config.ts                       # ✅ Next.js config
├── tsconfig.json                        # ✅ TypeScript strict mode
└── package.json                         # ✅ All dependencies installed
```

---

## Installed Packages

### Production Dependencies
| Package | Version | Purpose |
|---|---|---|
| `next` | 16.3.6 | Full-stack React framework |
| `react` / `react-dom` | 19.2.8 | React runtime |
| `@prisma/client` | 5.22.0 | Generated type-safe database client |
| `bcryptjs` | 3.0.3 | Password hashing |
| `@radix-ui/react-slot` | ^1.3.3 | shadcn/ui dependency |
| `class-variance-authority` | ^0.7.1 | shadcn/ui component variants |
| `clsx` | ^2.1.1 | Class name utility |
| `lucide-react` | ^1.48.0 | Icon library |
| `tailwind-merge` | ^3.7.0 | Tailwind class merging |

### Dev Dependencies
| Package | Version | Purpose |
|---|---|---|
| `prisma` | 5.22.0 | Prisma CLI (migrate, generate, format) |
| `ts-node` | ^10.9.2 | TypeScript runner for seed.ts |
| `@types/bcryptjs` | ^2.4.6 | TypeScript types for bcryptjs |
| `typescript` | ^5 | TypeScript compiler |
| `tailwindcss` | ^4 | CSS framework |
| `eslint` | ^9 | Linting |

---

## Frontend Architecture

- **Next.js App Router** with layout nesting for auth vs protected routes
- **Route Groups:**
  - `(app)` — all protected pages, wrapped in AppShell (Sidebar + Header)
  - `(auth)` — ❌ planned — login, register (no AppShell)
- **Server Components** by default; Client Components only where interactivity is required
  - `AppShell`, `Sidebar` are Client Components (useState for mobile/collapse)
  - `Header` is a Client Component (conditional rendering)
  - All page components are Server Components
- **shadcn/ui** as the base component library, customized to the BuildOrbit design system

---

## Backend Architecture (Planned)

- **Next.js Route Handlers** at `/app/api/` serve as the REST API layer
- All handlers will follow a consistent pattern:
  1. Parse and validate request body using **Zod**
  2. Check authentication and authorization (role check from session)
  3. Execute database operation via **Prisma** (always server-side)
  4. Return a typed JSON response (never expose `passwordHash`)
- No separate backend server — everything runs in the same Next.js process

---

## Database Architecture

- **PostgreSQL** as the primary relational database
- **Prisma ORM v5.22.0** for schema definition, migrations, and type-safe queries
- **Singleton PrismaClient** in `src/lib/prisma.ts` — prevents connection pool exhaustion during Next.js hot reloads
- **Schema:** `prisma/schema.prisma` — defines `Role` enum and `User` model
- **Seed:** `prisma/seed.ts` — creates initial SUPER_ADMIN from environment variables

See `DATABASE.md` for full schema documentation.

### Database Boundary Rule

```
❌ FORBIDDEN: Importing prisma.ts from client components, browser code, or middleware
✅ ALLOWED:   Importing prisma.ts from server components, Route Handlers, seed scripts
```

---

## Authentication Architecture (Planned)

- Session-based or JWT-based (decision pending — see DEC-003 in `DECISIONS.md`)
- **Password hashing:** `bcryptjs` with 10 salt rounds
- **User lookup:** `prisma.user.findUnique({ where: { email } })`
- **Credential check:** `bcrypt.compare(plainPassword, user.passwordHash)`
- **Session payload:** `{ userId, email, role }` — role enables RBAC on every request
- **Middleware** will protect all `/(app)/*` routes from unauthenticated access

---

## Key Architectural Decisions

See `DECISIONS.md` for a log of all architectural decisions and their rationale.

| Decision | Summary |
|---|---|
| [DEC-001] | Technology stack (Next.js, TypeScript, Prisma, bcrypt, etc.) |
| [DEC-002] | Documentation-first development approach |
| [DEC-003] | Auth strategy (JWT vs sessions) — pending |
| [DEC-004] | CUID as primary key strategy |
| [DEC-005] | Role as Prisma enum (not a separate table) |

---

_Last updated: 2026-09-29 — Database foundation complete. Prisma 5.22.0, Role enum, User model, singleton client, seed script._
