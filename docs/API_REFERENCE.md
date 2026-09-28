# BuildOrbit — API Reference

> **Status:** PLANNED — No API endpoints have been implemented yet. This document defines the planned API structure and conventions. It will be updated as each endpoint is built and verified.

---

## API Conventions

### Base URL

All API routes are served from the Next.js application:

```
/api/...
```

No separate backend server. All routes are Next.js Route Handlers at `/app/api/`.

### Request & Response Format

- All requests and responses use `Content-Type: application/json`
- All successful responses follow this envelope:

```json
{
  "success": true,
  "data": { ... }
}
```

- All error responses follow this envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": { ... }
  }
}
```

### HTTP Status Codes

| Code | Usage |
|---|---|
| `200` | Successful GET / PATCH / DELETE |
| `201` | Successful POST (resource created) |
| `400` | Bad request / validation error |
| `401` | Unauthenticated |
| `403` | Authenticated but unauthorized (insufficient role) |
| `404` | Resource not found |
| `409` | Conflict (e.g., duplicate email) |
| `500` | Internal server error |

### Authentication

- All protected routes require a valid session (authentication mechanism TBD)
- The server will verify the session and extract the user's `id` and `role`
- Role-based access is enforced per endpoint

---

## Planned API Endpoints

> None of the following endpoints are implemented. This is a planning reference only.

---

### Auth

| Method | Path | Description | Role |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user and create session | Public |
| `POST` | `/api/auth/logout` | Destroy session | Authenticated |
| `GET` | `/api/auth/me` | Get current authenticated user | Authenticated |

---

### Users

| Method | Path | Description | Role |
|---|---|---|---|
| `GET` | `/api/users` | List all users | Admin+ |
| `POST` | `/api/users` | Create a new user | Admin+ |
| `GET` | `/api/users/:id` | Get a specific user | Admin+ |
| `PATCH` | `/api/users/:id` | Update a user | Admin+ |
| `DELETE` | `/api/users/:id` | Deactivate a user | Admin+ |

---

### Workforce

| Method | Path | Description | Role |
|---|---|---|---|
| `GET` | `/api/workforce/employees` | List all employees | HR+ |
| `POST` | `/api/workforce/employees` | Create employee profile | HR+ |
| `GET` | `/api/workforce/employees/:id` | Get employee detail | HR+ / Self |
| `PATCH` | `/api/workforce/employees/:id` | Update employee profile | HR+ |
| `GET` | `/api/workforce/departments` | List departments | All |
| `POST` | `/api/workforce/departments` | Create department | Admin+ |

---

### HR & Payroll

| Method | Path | Description | Role |
|---|---|---|---|
| `GET` | `/api/hr/leave-types` | List leave types | HR+ |
| `GET` | `/api/hr/leave-requests` | List leave requests | HR+ |
| `POST` | `/api/hr/leave-requests` | Submit a leave request | Employee+ |
| `PATCH` | `/api/hr/leave-requests/:id` | Approve/reject leave | HR+ / Lead |
| `GET` | `/api/hr/attendance` | Get attendance records | HR+ |
| `GET` | `/api/hr/payroll` | List payroll records | HR+ |

---

### CRM

| Method | Path | Description | Role |
|---|---|---|---|
| `GET` | `/api/crm/clients` | List clients | Lead+ |
| `POST` | `/api/crm/clients` | Create client | Admin+ |
| `GET` | `/api/crm/clients/:id` | Get client detail | Lead+ |
| `PATCH` | `/api/crm/clients/:id` | Update client | Admin+ |
| `GET` | `/api/crm/projects` | List projects | Lead+ |
| `POST` | `/api/crm/projects` | Create project | Admin+ |

---

### Reports

| Method | Path | Description | Role |
|---|---|---|---|
| `GET` | `/api/reports/workforce` | Workforce summary report | HR+ |
| `GET` | `/api/reports/attendance` | Attendance report | HR+ |
| `GET` | `/api/reports/payroll` | Payroll summary report | Admin+ |
| `GET` | `/api/reports/crm` | CRM activity report | Lead+ |

---

### Administration

| Method | Path | Description | Role |
|---|---|---|---|
| `GET` | `/api/admin/audit-logs` | View audit logs | Admin+ |
| `GET` | `/api/admin/config` | Get system config | Super Admin |
| `PATCH` | `/api/admin/config` | Update system config | Super Admin |

---

_Last updated: 2026-09-28_
