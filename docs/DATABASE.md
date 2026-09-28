# BuildOrbit — Database

> **Status:** PLANNED — No database has been created or configured yet. This document outlines the planned database structure and will be updated as Prisma schemas are implemented.

---

## Database Technology

| Component | Choice |
|---|---|
| Database Engine | PostgreSQL |
| ORM | Prisma |
| Migration Tool | Prisma Migrate |
| Connection | Direct PostgreSQL connection via `DATABASE_URL` env variable |

---

## Planned Models (High-Level)

The following models are anticipated based on the initial requirements. All are subject to change as implementation begins. Field-level details will be added when each model is implemented.

### Core / Auth
- `User` — All system users with role, email, password hash, and status
- `Session` — If using database sessions (TBD based on auth decision)

### Organization
- `Organization` — For potential multi-tenant support
- `Department` — Organizational departments
- `Designation` — Job titles / designations

### Workforce
- `Employee` — Extended profile linked to a `User` record
- `EmploymentRecord` — Employment history, status changes
- `Document` — Employee-linked documents (contracts, IDs, etc.)

### HR & Payroll
- `LeaveType` — Configurable leave categories (sick, paid, unpaid, etc.)
- `LeaveBalance` — Per-employee leave balance per type per year
- `LeaveRequest` — Individual leave submissions with status and approvals
- `AttendanceRecord` — Daily attendance logs per employee
- `PayrollRecord` — Monthly payroll snapshots per employee
- `Payslip` — Generated payslip documents linked to payroll records

### CRM
- `Client` — External companies or individuals
- `Contact` — Individual contacts within a client organization
- `Project` — Projects assigned to internal teams, linked to clients
- `Interaction` — Notes and activity logs for client contacts

### Administration
- `AuditLog` — System-wide log of all significant actions
- `Notification` — In-app notification records per user
- `SystemConfig` — Key-value store for system-level configuration

---

## Naming Conventions (Planned)

- Table names: **PascalCase** (Prisma default → maps to snake_case in PostgreSQL)
- All tables will have:
  - `id` — UUID primary key (or auto-increment Int — decision pending)
  - `createdAt` — Timestamp, auto-set on creation
  - `updatedAt` — Timestamp, auto-updated on modification
- Foreign keys named as `{modelName}Id` (e.g., `userId`, `employeeId`)
- Soft deletes via `deletedAt` nullable timestamp (where appropriate)

---

## Environment Configuration (Planned)

```env
# .env (not committed to Git)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/buildorbit?schema=public"
```

An `.env.example` file will be committed with placeholder values.

---

## Migration Strategy (Planned)

- All schema changes will be made via **Prisma Migrate**
- Command to create a migration: `npx prisma migrate dev --name <migration-name>`
- Migrations will be committed to Git alongside the schema change
- Production migrations will use: `npx prisma migrate deploy`

---

## Schema File Location (Planned)

```
prisma/
├── schema.prisma     ← Main Prisma schema (not created yet)
└── migrations/       ← Auto-generated migration files (not created yet)
```

---

_Last updated: 2026-09-28_
