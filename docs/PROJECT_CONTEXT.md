# BuildOrbit — Project Context

## Project Name

**BuildOrbit**

The name reflects the idea of orbiting around a build team — keeping all workforce, HR, and client relationships in a single, unified system that revolves around the people doing the work.

---

## Project Purpose

BuildOrbit is a professional **Workforce / HR / CRM management web application** designed for organizations that need to manage:

- Their internal workforce (employees, leads, HR staff, admins)
- Human resources operations (attendance, leaves, payroll, documents)
- Client relationships and project assignments (CRM)
- Role-based access to sensitive data and administrative functions
- Reporting and analytics across all modules

BuildOrbit is not a consumer product. It is an internal enterprise tool intended to be used by company staff at various permission levels.

---

## Technology Stack

| Layer | Technology | Status |
|---|---|---|
| Frontend Framework | Next.js 16.3.6 (App Router) | ✅ Initialized & verified |
| Language | TypeScript | ✅ Configured |
| Styling | Tailwind CSS v4 | ✅ Configured |
| App Directory | `src/app` | ✅ Confirmed |
| Component Library | shadcn/ui | ❌ Not yet installed |
| Backend / API | Next.js Route Handlers | ❌ Not yet implemented |
| Database | PostgreSQL | ❌ Not yet configured |
| ORM | Prisma | ❌ Not yet initialized |
| Validation | Zod | ❌ Not yet installed |
| Authentication | bcrypt (password hashing) | ❌ Not yet implemented |
| Charts / Analytics | Recharts | ❌ Not yet installed |
| Icons | Lucide React | ❌ Not yet installed |
| Version Control | Git + GitHub | ❌ Not yet initialized |

---

## Development Philosophy

1. **Step-by-step, verified progress** — Each feature is built, tested, and confirmed before moving to the next.
2. **Minimal surface area** — No code is written unless it serves a current requirement.
3. **Documentation-first** — Every architectural decision, API change, and database change is documented before or immediately after implementation.
4. **Clarity over cleverness** — Code should be readable and maintainable by any engineer on the team.
5. **No premature abstraction** — Generic utilities and shared code are introduced only when a clear pattern has emerged from real use.

---

## Role-Based Nature of the Application

BuildOrbit is fundamentally a **role-based access control (RBAC) system**. Every page, API endpoint, and data record is controlled by the role of the authenticated user.

### Roles (Planned)

| Role | Description |
|---|---|
| **Super Admin** | Full system access. Can manage all organizations, users, settings, and system configuration. |
| **Admin** | Organization-level administrator. Manages users, roles, settings within their organization. |
| **HR** | Manages employee records, attendance, leave approvals, payroll, and documents. |
| **Lead** | Team lead. Can view their team's data, manage task assignments, and submit reports. |
| **Engineer / Employee** | Standard user. Can view their own profile, submit leave requests, view payslips, and access assigned project data. |

> Role hierarchy: Super Admin > Admin > HR > Lead > Engineer/Employee

---

## Project Status

See [`CURRENT_STATUS.md`](./CURRENT_STATUS.md) for the latest status of the project.

---

_Last updated: 2026-09-28 — Next.js project initialization verified._
