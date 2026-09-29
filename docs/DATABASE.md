# BuildOrbit — Database

> **Status:** PHASE 1 COMPLETE — Prisma 5.22.0 + PostgreSQL configured. Schema created. Client generated. Migration and seed pending database availability.

---

## Database Technology

| Component | Choice | Version |
|---|---|---|
| Database Engine | PostgreSQL | Any recent version (14+) |
| ORM | Prisma | 5.22.0 |
| Migration Tool | Prisma Migrate | Included in Prisma 5 |
| Connection | Direct PostgreSQL via `DATABASE_URL` env variable | — |

---

## Environment Configuration

```env
# .env (not committed to Git — real secrets only in this file)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/buildorbit?schema=public"
```

A `.env.example` file is committed as a template with placeholder values and no real secrets.

**Security rules:**
- `DATABASE_URL` is never exposed to client-side code.
- The `.env` file is in `.gitignore` and must never be committed.
- Only `.env.example` is committed to the repository.

---

## Prisma Client Location

```
src/lib/prisma.ts   ← Singleton PrismaClient instance (server-only)
```

**Why a singleton?** Next.js hot reload in development re-executes module files on every change. Without the singleton pattern, each hot reload would create a new PrismaClient, exhausting the PostgreSQL connection pool. The singleton stores the instance on Node.js `globalThis` in development so it survives reloads.

**IMPORTANT:** Never import `src/lib/prisma.ts` from:
- Client Components (`'use client'`)
- Browser-side code
- UI components
- Next.js Middleware (Edge Runtime)

---

## Schema File Location

```
prisma/
├── schema.prisma     ✅ Created — defines Role enum and User model
├── seed.ts           ✅ Created — development seed for SUPER_ADMIN
└── migrations/       ⏳ Will be created when `prisma migrate dev` runs
```

---

## Current Schema

### Role (Prisma Enum)

Represents the five fixed roles in BuildOrbit.

```prisma
enum Role {
  SUPER_ADMIN
  ADMIN
  HR
  LEAD
  ENGINEER
}
```

**Why an enum (not a table)?**
BuildOrbit has five fixed, well-known roles that do not change at runtime. Using a PostgreSQL enum via Prisma:
- Avoids a `roles` table and JOIN on every auth check
- Makes role queries type-safe in TypeScript
- Is extensible: if dynamic per-org roles are needed, a `Role` table can be added alongside the enum
- See [DEC-005] in `DECISIONS.md`

**Role hierarchy (highest → lowest):**
```
SUPER_ADMIN > ADMIN > HR > LEAD > ENGINEER
```

---

### User (Model)

Represents every person who can authenticate and use BuildOrbit.

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String
  role         Role     @default(ENGINEER)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([email])
  @@index([role])
  @@map("users")
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | `String` CUID | Primary key — non-guessable, collision-resistant. See [DEC-004] |
| `email` | `String` unique | Used for login. Unique constraint prevents duplicate accounts |
| `name` | `String?` | Optional display name. Nullable |
| `passwordHash` | `String` | bcrypt hash **only**. Plain text is NEVER stored |
| `role` | `Role` enum | Controls access. Defaults to ENGINEER (least privilege) |
| `isActive` | `Boolean` | Soft-disable without deletion. Defaults to `true` |
| `createdAt` | `DateTime` | Auto-set on record creation |
| `updatedAt` | `DateTime` | Auto-updated by Prisma on every write |

**Indexes:**
- `@@index([email])` — fast lookup during login
- `@@index([role])` — fast filtering by role (admin panels, access checks)

**Password security:**
- `passwordHash` stores the result of `bcrypt.hash(password, 10)` 
- 10 salt rounds is the industry-standard balance of security and performance
- The hash is **never returned in API responses**
- Plain-text passwords are never logged or stored

---

## User → Role Relationship

The relationship is embedded directly on the `User` model via the `role` enum field. There is no separate `Role` table.

```
User.role  →  Role enum value (SUPER_ADMIN | ADMIN | HR | LEAD | ENGINEER)
```

**Authentication flow:**
1. Login API receives `email` + `password`
2. `prisma.user.findUnique({ where: { email } })` → retrieves the user
3. `bcrypt.compare(password, user.passwordHash)` → verifies credentials
4. If valid: create session/JWT containing `{ userId, email, role }`
5. All protected API routes read `role` from the session and enforce access

---

## Future Models (Planned — Not Yet Implemented)

The following models will be added in future phases. The current schema leaves clean extension points.

### Organization / Structure
- `Employee` — Extended HR profile linked to a `User` (one-to-one)
- `Department` — Organizational departments
- `Designation` — Job titles

### HR & Payroll
- `LeaveType`, `LeaveBalance`, `LeaveRequest`
- `AttendanceRecord`
- `PayrollRecord`, `Payslip`

### CRM
- `Client`, `Contact`, `Project`, `Interaction`

### System
- `Session` — If database sessions are chosen (see DEC-003)
- `AuditLog`, `Notification`, `SystemConfig`

---

## Naming Conventions

- **Table name:** `@@map("users")` — Prisma uses PascalCase models; PostgreSQL table is `users` (snake_case)
- **Primary key:** CUID string — see [DEC-004]
- **All models will have:** `id`, `createdAt`, `updatedAt`
- **Foreign keys:** `{modelName}Id` (e.g., `userId`, `employeeId`)
- **Soft deletes:** `deletedAt` nullable timestamp where appropriate (future models)

---

## Migration Strategy

```bash
# Development — creates a migration file and applies it
npx prisma migrate dev --name init_user_role

# Production — applies pending migrations without creating new ones
npx prisma migrate deploy

# After schema changes — regenerate the TypeScript client
npx prisma generate
```

**⚠️ Status:** Migration has NOT been run yet because `DATABASE_URL` is not configured.
To run the migration:
1. Install PostgreSQL locally or provide a remote connection
2. Create a `.env` file from `.env.example`
3. Set `DATABASE_URL` to your PostgreSQL connection string
4. Run: `npx prisma migrate dev --name init_user_role`

---

## Development Seed

```bash
# Runs prisma/seed.ts via ts-node
npx prisma db seed
```

**Requirements before running seed:**
- `DATABASE_URL` must be set in `.env`
- `npx prisma migrate dev` must have been run first (tables must exist)
- `SEED_ADMIN_EMAIL` must be set in `.env`
- `SEED_ADMIN_PASSWORD` must be set in `.env`

**What the seed does:**
1. Reads `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from environment
2. Hashes the password with `bcrypt.hash(password, 10)`
3. Upserts a `SUPER_ADMIN` user — safe to run multiple times (no duplicates)
4. Logs the created user's ID, email, and role (never logs the password hash)

---

## Prisma Commands Reference

| Command | Purpose |
|---|---|
| `npx prisma generate` | Generate TypeScript client from schema (no DB needed) |
| `npx prisma validate` | Validate schema syntax (requires DATABASE_URL) |
| `npx prisma format` | Format schema.prisma file |
| `npx prisma migrate dev --name <name>` | Create + apply a new migration (development) |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma db seed` | Run the seed script |
| `npx prisma studio` | Open visual database browser |

---

_Last updated: 2026-09-29 — Phase 1 database foundation complete. Schema created, client generated, migration and seed pending DATABASE_URL._
