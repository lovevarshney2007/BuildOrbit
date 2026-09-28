# BuildOrbit — Architecture

> **Status:** FOUNDATION INITIALIZED — Next.js 16.3.6 with App Router is initialized and verified running at `http://localhost:3000`. The directory structure below shows the **planned** layout; only the base scaffold (`src/app/`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`) exists at this time. All other paths are planned and not yet created.

---

## Overview

BuildOrbit is a full-stack web application built on **Next.js with the App Router**. The application uses a monorepo-style single Next.js project where the frontend (React pages) and backend (Route Handlers) coexist.

```
Browser (React / Next.js)
        │
        ▼
Next.js App Router
  ├── /app/(pages)        → Frontend pages
  └── /app/api/           → Backend Route Handlers (REST-style)
        │
        ▼
Prisma ORM
        │
        ▼
PostgreSQL Database
```

---

## Directory Structure (Planned — Only Scaffold Currently Exists)

```
buildorbit/
├── src/
│   └── app/                         # ✅ Exists — Next.js App Router root
│       ├── layout.tsx               # ✅ Root layout (scaffold)
│       ├── page.tsx                 # ✅ Root page (scaffold)
│       ├── globals.css              # ✅ Global styles (Tailwind v4)
│       ├── (auth)/                  # ❌ Planned — Auth routes (login, register)
│       │   ├── login/
│       │   └── register/
│       ├── (dashboard)/             # ❌ Planned — Protected application routes
│       │   ├── dashboard/
│       │   ├── workforce/
│       │   ├── crm/
│       │   ├── reports/
│       │   ├── hr/
│       │   └── admin/
│       └── api/                     # ❌ Planned — Next.js Route Handlers
│           ├── auth/
│           ├── users/
│           ├── workforce/
│           ├── crm/
│           ├── hr/
│           └── admin/
│
├── components/                      # ❌ Planned
│   ├── ui/                          # shadcn/ui base components
│   ├── layout/                      # AppShell, Sidebar, Header, etc.
│   └── shared/                      # Reusable domain-agnostic components
│
├── lib/                             # ❌ Planned
│   ├── prisma.ts                    # Prisma client singleton
│   ├── auth.ts                      # Auth utilities
│   ├── validations/                 # Zod schemas
│   └── utils.ts                     # General utilities
│
├── prisma/                          # ❌ Planned
│   ├── schema.prisma                # Database schema
│   └── migrations/                  # Prisma migration files
│
├── docs/                            # ✅ Project documentation (this folder)
│
├── public/                          # ✅ Static assets (scaffold)
├── .env                             # ❌ Not yet created
├── .env.example                     # ❌ Not yet created
├── next.config.ts                   # ✅ Exists
├── tsconfig.json                    # ✅ Exists
└── package.json                     # ✅ Exists
```

---

## Frontend Architecture (Planned)

- **Next.js App Router** with layout nesting for auth vs dashboard routes
- **Route Groups** to separate authenticated and unauthenticated areas:
  - `(auth)` — login, register, forgot password
  - `(dashboard)` — all protected application pages
- **Server Components** by default; Client Components only where interactivity is required
- **shadcn/ui** as the base component library, customized to match the BuildOrbit design system

---

## Backend Architecture (Planned)

- **Next.js Route Handlers** at `/app/api/` serve as the REST API layer
- All handlers will follow a consistent pattern:
  1. Parse and validate request body using **Zod**
  2. Check authentication and authorization (role check)
  3. Execute database operation via **Prisma**
  4. Return a typed JSON response
- No separate backend server — everything runs in the same Next.js process

---

## Authentication Architecture (Planned)

- Session-based or JWT-based authentication (decision pending — see `DECISIONS.md`)
- Password hashing using **bcrypt**
- Role stored in the session/token and verified on every protected API route
- Middleware will protect all `/dashboard/*` routes from unauthenticated access

---

## Database Architecture (Planned)

- **PostgreSQL** as the primary relational database
- **Prisma ORM** for schema definition, migrations, and type-safe queries
- See `DATABASE.md` for full schema planning

---

## Key Architectural Decisions

See `DECISIONS.md` for a log of all architectural decisions and their rationale.

---

_Last updated: 2026-09-28 — Next.js project initialization verified. Directory structure updated to reflect actual `src/app` layout._
