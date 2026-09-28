# BuildOrbit — Requirements

> **Status:** Placeholder structure. Requirements are being gathered and will be filled in incrementally as each module is implemented.

---

## User Roles

### Super Admin
- [ ] Full access to all system resources
- [ ] Manage organizations and tenants
- [ ] View and manage all users across the system
- [ ] Access system-level configuration and settings
- [ ] View system-wide audit logs

### Admin
- [ ] Manage users within their organization
- [ ] Assign and modify roles (excluding Super Admin)
- [ ] Configure organization-level settings
- [ ] Access all modules within their organization
- [ ] View audit logs for their organization

### HR
- [ ] Manage employee profiles
- [ ] Handle onboarding and offboarding workflows
- [ ] Approve / reject leave requests
- [ ] Manage payroll records
- [ ] Upload and manage employee documents
- [ ] View attendance and time records

### Lead
- [ ] View and manage their assigned team members
- [ ] Track team attendance and performance
- [ ] Assign tasks and projects to team members
- [ ] Submit reports for their team
- [ ] Approve/reject leave requests for their team (if delegated by HR)

### Engineer / Employee
- [ ] View their own profile and documents
- [ ] Submit leave requests
- [ ] View leave balance and history
- [ ] View payslips
- [ ] View assigned projects and tasks
- [ ] Update their own profile information

---

## Module Requirements

### Dashboard
- [ ] Role-specific KPI summary cards
- [ ] Quick actions based on user role
- [ ] Recent activity feed
- [ ] Upcoming events / deadlines widget
- [ ] Team status overview (for Leads and above)

### Workforce
- [ ] Employee directory with search and filter
- [ ] Employee detail profile page
- [ ] Department and team management
- [ ] Designation / job title management
- [ ] Employment status tracking (active, inactive, on leave, etc.)
- [ ] Onboarding checklist
- [ ] Offboarding workflow

### CRM (Client Relationship Management)
- [ ] Client / company directory
- [ ] Client contact management
- [ ] Project assignment linking clients to internal teams
- [ ] Interaction history / notes
- [ ] Deal / opportunity pipeline (if applicable)

### Reports
- [ ] Workforce summary reports
- [ ] Attendance reports (by employee, department, date range)
- [ ] Leave utilization reports
- [ ] Payroll summary reports
- [ ] CRM activity reports
- [ ] Export to CSV / PDF

### HR & Payroll
- [ ] Attendance tracking (manual or integrated)
- [ ] Leave types configuration (paid, unpaid, sick, etc.)
- [ ] Leave balance calculation
- [ ] Leave request workflow (submit → approve/reject)
- [ ] Payroll calculation (basic salary + deductions + bonuses)
- [ ] Payslip generation
- [ ] Salary revision history

### Administration
- [ ] Organization settings
- [ ] Role and permission management
- [ ] User invitation and onboarding
- [ ] Audit log viewer
- [ ] System notifications and announcements
- [ ] Data backup and export

---

_Last updated: 2026-09-28_
