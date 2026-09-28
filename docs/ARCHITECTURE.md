# BuildOrbit — Architecture

> **Status:** PLANNED — This document describes the intended architecture. Nothing described here has been implemented yet. Each section will be updated as implementation progresses.

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

## Directory Structure (Planned)

```
buildorbit/
├── app/
│   ├── (auth)/                  # Auth routes (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/             # Protected application routes
│   │   ├── dashboard/
│   │   ├── workforce/
│   │   ├── crm/
│   │   ├── reports/
│   │   ├── hr/
│   │   └── admin/
│   ├── api/                     # Next.js Route Handlers
│   │   ├── auth/
│   │   ├── users/
│   │   ├── workforce/
│   │   ├── crm/
│   │   ├── hr/
│   │   └── admin/
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── components/
│   ├── ui/                      # shadcn/ui base components
│   ├── layout/                  # AppShell, Sidebar, Header, etc.
│   └── shared/                  # Reusable domain-agnostic components
│
├── lib/
│   ├── prisma.ts                # Prisma client singleton
│   ├── auth.ts                  # Auth utilities
│   ├── validations/             # Zod schemas
│   └── utils.ts                 # General utilities
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Prisma migration files
│
├── docs/                        # Project documentation (this folder)
│
├── public/                      # Static assets
├── .env                         # Environment variables (not committed)
├── .env.example                 # Environment variable template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
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

_Last updated: 2026-09-28_
