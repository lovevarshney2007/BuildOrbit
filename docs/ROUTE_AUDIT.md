# BuildOrbit — Route Audit

## Public Routes
- `/login` (Public / Unauthenticated only)
- `/register` (Public / Unauthenticated only)
- `/invite/[token]` (Public - checks token)
- `/` (Redirects to dashboard or login)

## Protected Routes (AppShell)

### Dashboard
- `/dashboard` (All roles)

### Workforce
- `/workforce/attendance` (All roles)
- `/workforce/employees` (SUPER_ADMIN, ADMIN, HR, LEAD)
- `/workforce/employees/new` (SUPER_ADMIN, ADMIN, HR)
- `/workforce/employees/[id]` (SUPER_ADMIN, ADMIN, HR, LEAD, Self)
- `/workforce/leave` (HR, LEAD, ENGINEER)
- `/workforce/leave/new` (HR, LEAD, ENGINEER)
- `/workforce/payslip` (All roles)
- `/workforce/payslip/[id]/print` (All roles)

### HR & Payroll
- `/hr/leave-types` (SUPER_ADMIN, ADMIN, HR)
- `/hr/leave-approval` (SUPER_ADMIN, ADMIN, HR)
- `/hr/payroll` (SUPER_ADMIN, ADMIN, HR)
- `/hr/shifts` (SUPER_ADMIN, ADMIN, HR)
- `/hr/invitations` (SUPER_ADMIN, ADMIN, HR)
- `/hr/sites` (SUPER_ADMIN, ADMIN, HR)
- `/hr/sites/new` (SUPER_ADMIN, ADMIN, HR)
- `/hr/sites/[id]` (SUPER_ADMIN, ADMIN, HR)

### CRM
- `/crm/leads` (SUPER_ADMIN, ADMIN, LEAD)
- `/crm/leads/[id]` (SUPER_ADMIN, ADMIN, LEAD)
- `/crm/invoices` (SUPER_ADMIN, ADMIN, LEAD - TBD)

### Reports
- `/reports/leads` (SUPER_ADMIN, ADMIN, LEAD)
- `/reports/attendance` (SUPER_ADMIN, ADMIN, HR)
- `/reports/leave` (SUPER_ADMIN, ADMIN, HR)
- `/reports/payroll` (SUPER_ADMIN, ADMIN, HR)

### Administration
- `/admin/settings` (SUPER_ADMIN, ADMIN)
- `/admin/roles` (SUPER_ADMIN)
- `/admin/login-activity` (SUPER_ADMIN, ADMIN)
- `/admin/audit-logs` (SUPER_ADMIN)

### User Profile
- `/profile` (All roles)
- `/onboarding` (All roles - Face Reg etc)

## API Routes
- `/api/payroll/[id]/process`
- `/api/payroll/[id]/pay`
- `/api/cron/auto-checkout`
- `/api/cron/payroll-draft`
- `/api/cron/leave-carryforward`
- `/api/employees/[id]`
- `/api/leads/[id]`
- `/api/leads/[id]/follow-ups`

*Status of each route will be updated as tested.*
