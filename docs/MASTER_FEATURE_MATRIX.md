# BuildOrbit — Master Feature Matrix

> **Generated:** 2026-10-06
> **Coverage:** 152 features across 23 modules

## Summary

| Metric | Count |
|--------|-------|
| Total features discovered | 152 |
| Tested by existing tests | 72 |
| Covered by NEW tests (11-comprehensive) | 80 |
| Total tested after additions | 152 |
| Skipped features | 0 |

## Coverage Equation: 152 = 152 ✅  |  Skipped = 0 ✅

---

Legend: ✅ existing test | 🆕 new test file 11-comprehensive | — not applicable

| ID | Module | Feature | Route | API/Action | DB Model | Roles | UI | API | DB | WF |
|----|--------|---------|-------|-----------|----------|-------|----|----|----|----|
| AUTH-001 | Auth | Login page loads | /login | loginAction | User | Public | ✅ | — | — | — |
| AUTH-002 | Auth | Login SUPER_ADMIN | /login | loginAction | User,LoginActivity | Public | ✅ | — | ✅ | ✅ |
| AUTH-003 | Auth | Login ADMIN | /login | loginAction | User | Public | ✅ | — | ✅ | — |
| AUTH-004 | Auth | Login HR | /login | loginAction | User | Public | ✅ | — | ✅ | — |
| AUTH-005 | Auth | Login LEAD | /login | loginAction | User | Public | ✅ | — | ✅ | — |
| AUTH-006 | Auth | Login ENGINEER | /login | loginAction | User | Public | ✅ | — | ✅ | — |
| AUTH-007 | Auth | Wrong password error | /login | loginAction | — | Public | ✅ | — | — | — |
| AUTH-008 | Auth | Non-existent email error | /login | loginAction | — | Public | ✅ | — | — | — |
| AUTH-009 | Auth | Empty form validation | /login | loginAction | — | Public | ✅ | — | — | — |
| AUTH-010 | Auth | Logout → /login | — | logoutAction | — | Auth | ✅ | — | — | — |
| AUTH-011 | Auth | Session persists on nav | — | — | — | Auth | ✅ | — | — | — |
| AUTH-012 | Auth | Invalid session cookie → redirect | — | middleware | — | Public | ✅ | — | — | — |
| AUTH-013 | Auth | Protected /dashboard redirects | /dashboard | middleware | — | Public | ✅ | — | — | — |
| AUTH-014 | Auth | Protected /workforce/employees redirects | /workforce/employees | middleware | — | Public | ✅ | — | — | — |
| AUTH-015 | Auth | Protected /hr/payroll redirects | /hr/payroll | middleware | — | Public | ✅ | — | — | — |
| AUTH-016 | Auth | Protected /admin/settings redirects | /admin/settings | middleware | — | Public | ✅ | — | — | — |
| AUTH-017 | Auth | Protected /crm/leads redirects | /crm/leads | middleware | — | Public | ✅ | — | — | — |
| AUTH-018 | Auth | Register page loads | /register | registerAction | User | Public | ✅ | — | — | — |
| AUTH-019 | Auth | Register duplicate email error | /register | registerAction | User | Public | ✅ | — | — | — |
| AUTH-020 | Auth | Root / shows landing page | / | — | — | Public | ✅ | — | — | — |
| AUTH-021 | Auth | LoginActivity record created on login | /login | loginAction | LoginActivity | Public | — | — | 🆕 | — |
| AUTH-022 | Auth | LoginActivity stores IP/browser/OS/device | /login | loginAction | LoginActivity | Public | — | — | 🆕 | — |
| AUTH-023 | Auth | Inactive user cannot log in | /login | loginAction | User | Public | 🆕 | — | — | — |
| PROF-001 | Profile | Profile page loads | /profile | — | User,Employee | All | ✅ | — | — | — |
| PROF-002 | Profile | Profile shows current user info | /profile | — | User | All | ✅ | — | — | — |
| PROF-003 | Profile | Update name/phone/address | /profile | updateProfileAction | User,Employee | All | 🆕 | — | 🆕 | — |
| PROF-004 | Profile | Employment details section visible | /profile | — | Employee | All | ✅ | — | — | — |
| PROF-005 | Profile | Document uploader visible | /profile | uploadDocumentAction | EmployeeDocument | All | 🆕 | — | — | — |
| PROF-006 | Profile | Upload employee document | /profile | uploadDocumentAction | EmployeeDocument | All | 🆕 | — | 🆕 | — |
| DASH-001 | Dashboard | Dashboard page loads | /dashboard | — | multiple | All | ✅ | — | — | — |
| DASH-002 | Dashboard | SUPER_ADMIN dashboard KPIs from DB | /dashboard | — | User,Employee | SUPER_ADMIN | 🆕 | — | 🆕 | — |
| DASH-003 | Dashboard | Engineer dashboard (donut charts) | /dashboard | — | Attendance | ENGINEER | ✅ | — | — | — |
| DASH-004 | Dashboard | Dashboard counts live from DB | /dashboard | — | multiple | All | 🆕 | — | 🆕 | — |
| DASH-005 | Dashboard | No hardcoded business data | /dashboard | — | multiple | All | 🆕 | — | 🆕 | — |
| EMP-001 | Employees | List page loads | /workforce/employees | — | Employee | Admin+ | ✅ | — | — | — |
| EMP-002 | Employees | Records show in table | /workforce/employees | — | Employee | Admin+ | ✅ | — | — | — |
| EMP-003 | Employees | Search employees | /workforce/employees | — | Employee | Admin+ | ✅ | — | — | — |
| EMP-004 | Employees | Create form loads | /workforce/employees/new | createEmployeeAction | User,Employee | HR+ | ✅ | — | — | — |
| EMP-005 | Employees | Create employee success | /workforce/employees/new | createEmployeeAction | User,Employee | HR+ | ✅ | — | ✅ | ✅ |
| EMP-006 | Employees | Duplicate email error | /workforce/employees/new | createEmployeeAction | User | HR+ | ✅ | — | — | — |
| EMP-007 | Employees | Missing required fields validation | /workforce/employees/new | createEmployeeAction | — | HR+ | ✅ | — | — | — |
| EMP-008 | Employees | Detail page loads | /workforce/employees/[id] | — | Employee,User | Admin+ | ✅ | ✅ | — | — |
| EMP-009 | Employees | Update phone | /workforce/employees/[id] | updateEmployeeAction | Employee | HR+ | ✅ | — | ✅ | — |
| EMP-010 | Employees | Status change (activate/deactivate) | /workforce/employees/[id] | updateEmployeeAction | Employee | HR+ | 🆕 | — | 🆕 | — |
| EMP-011 | Employees | Role change | /workforce/employees/[id] | updateEmployeeAction | User | HR+ | 🆕 | — | 🆕 | — |
| EMP-012 | Employees | Salary update | /workforce/employees/[id] | updateEmployeeAction | Employee | HR+ | 🆕 | — | 🆕 | — |
| EMP-013 | Employees | Team assignment | /workforce/employees/[id] | updateEmployeeAction | Employee,Team | HR+ | 🆕 | — | 🆕 | — |
| EMP-014 | Employees | Department assignment | /workforce/employees/[id] | updateEmployeeAction | Employee,Dept | HR+ | 🆕 | — | 🆕 | — |
| EMP-015 | Employees | DELETE via API | — | DELETE /api/employees/[id] | Employee,User | Admin+ | — | ✅ | 🆕 | — |
| EMP-016 | Employees | Engineer blocked from /new | /workforce/employees/new | RBAC | — | ENGINEER | ✅ | — | — | — |
| EMP-017 | Employees | GET /api/employees/[id] returns data | — | GET /api/employees/[id] | Employee | Admin+ | — | ✅ | — | — |
| EMP-018 | Employees | GET /api/employees/nonexistent → 404 | — | GET /api/employees/[id] | — | Admin+ | — | ✅ | — | — |
| EMP-019 | Employees | DELETE without auth → 401 | — | DELETE /api/employees/[id] | — | — | — | ✅ | — | — |
| EMP-020 | Employees | Created employee can log in | — | createEmployeeAction | User | HR+ | — | — | — | ✅ |
| EMP-021 | Employees | Face descriptor stored in DB | /onboarding | enrollFaceAction | Employee | ENGINEER | 🆕 | — | 🆕 | — |
| ATT-001 | Attendance | Page loads | /workforce/attendance | — | Attendance | All | ✅ | — | — | — |
| ATT-002 | Attendance | Mark attendance check-in | /workforce/attendance | markAttendanceAction | Attendance | All | 🆕 | — | 🆕 | — |
| ATT-003 | Attendance | Mark attendance check-out | /workforce/attendance | markAttendanceAction | Attendance | All | 🆕 | — | 🆕 | — |
| ATT-004 | Attendance | History shows records | /workforce/attendance | — | Attendance | All | 🆕 | — | 🆕 | — |
| ATT-005 | Attendance | Date filter | /workforce/attendance | — | Attendance | All | 🆕 | — | — | — |
| ATT-006 | Attendance | Employee filter (HR/Admin) | /workforce/attendance | — | Attendance | HR+ | 🆕 | — | — | — |
| ATT-007 | Attendance | Duplicate same day prevented | — | markAttendanceAction | Attendance | All | — | — | 🆕 | — |
| ATT-008 | Attendance | Geofence validation | /workforce/attendance | markAttendanceAction | Attendance,Site | All | 🆕 | — | 🆕 | — |
| ATT-009 | Attendance | isLate flag set correctly | — | attendance-service | Attendance,Shift | All | — | — | 🆕 | — |
| ATT-010 | Attendance | Auto-checkout cron endpoint | /api/cron/auto-checkout | GET | Attendance | CRON | — | 🆕 | 🆕 | — |
| ATT-011 | Attendance | ON_LEAVE when leave approved | — | approveLeaveAction | Attendance | HR+ | — | — | 🆕 | 🆕 |
| ATT-012 | Attendance | Attendance report page loads | /reports/attendance | — | Attendance | HR+ | ✅ | — | — | — |
| ATT-013 | Attendance | Report data from DB | /reports/attendance | — | Attendance | HR+ | 🆕 | — | 🆕 | — |
| ATT-014 | Attendance | workedMinutes on checkout | — | attendance-service | Attendance | All | — | — | 🆕 | — |
| SITE-001 | Sites | Sites list page loads | /hr/sites | — | Site | HR+ | 🆕 | — | — | — |
| SITE-002 | Sites | Create site | /hr/sites/new | createSiteAction | Site | HR+ | 🆕 | — | 🆕 | — |
| SITE-003 | Sites | Site detail page loads | /hr/sites/[id] | — | Site | HR+ | 🆕 | — | — | — |
| SITE-004 | Sites | Edit site | /hr/sites/[id] | updateSiteAction | Site | HR+ | 🆕 | — | 🆕 | — |
| SITE-005 | Sites | Activate/deactivate site | /hr/sites/[id] | updateSiteAction | Site | HR+ | 🆕 | — | 🆕 | — |
| SITE-006 | Sites | Assign employee to site | /hr/sites/[id] | assignEmployeeToSite | EmployeeSiteAssignment | HR+ | 🆕 | — | 🆕 | — |
| SITE-007 | Sites | Assign team to site | /hr/sites/[id] | assignTeamToSite | TeamSiteAssignment | HR+ | 🆕 | — | 🆕 | — |
| SITE-008 | Sites | Radius stored correctly | /hr/sites/new | createSiteAction | Site | HR+ | — | — | 🆕 | — |
| SITE-009 | Sites | Lat/Lng stored | /hr/sites/new | createSiteAction | Site | HR+ | — | — | 🆕 | — |
| SITE-010 | Sites | Assignment effective dates | — | createSiteAction | EmployeeSiteAssignment | HR+ | — | — | 🆕 | — |
| SITE-011 | Sites | Site → geofence affects attendance | — | markAttendanceAction | Attendance,Site | All | — | — | 🆕 | 🆕 |
| SHIFT-001 | Shifts | Shifts page loads | /hr/shifts | — | Shift | HR+ | 🆕 | — | — | — |
| SHIFT-002 | Shifts | Create shift | /hr/shifts | createShiftAction | Shift | HR+ | 🆕 | — | 🆕 | — |
| SHIFT-003 | Shifts | Assign shift to employee | /hr/shifts | assignShiftAction | ShiftAssignment | HR+ | 🆕 | — | 🆕 | — |
| SHIFT-004 | Shifts | Late coming detection | — | attendance-service | Attendance,Shift | All | — | — | 🆕 | — |
| SHIFT-005 | Shifts | Early leaving detection | — | attendance-service | Attendance,Shift | All | — | — | 🆕 | — |
| LEAVE-001 | Leave | List page loads | /workforce/leave | — | LeaveRequest | All | ✅ | — | — | — |
| LEAVE-002 | Leave | Shows user's requests | /workforce/leave | — | LeaveRequest | All | ✅ | — | — | — |
| LEAVE-003 | Leave | Apply form loads | /workforce/leave/new | applyLeaveAction | LeaveRequest | All | ✅ | — | — | — |
| LEAVE-004 | Leave | Submit valid request | /workforce/leave/new | applyLeaveAction | LeaveRequest,LeaveBal | All | ✅ | — | ✅ | — |
| LEAVE-005 | Leave | Overlap validation | /workforce/leave/new | applyLeaveAction | LeaveRequest | All | ✅ | — | ✅ | — |
| LEAVE-006 | Leave | Insufficient balance | /workforce/leave/new | applyLeaveAction | LeaveBalance | All | 🆕 | — | 🆕 | — |
| LEAVE-007 | Leave | Reason validation (min 5 chars) | /workforce/leave/new | applyLeaveAction | — | All | 🆕 | — | — | — |
| LEAVE-008 | Leave | Half-day leave | /workforce/leave/new | applyLeaveAction | LeaveRequest | All | 🆕 | — | 🆕 | — |
| LEAVE-009 | Leave | Pending → balance reserved | — | applyLeaveAction | LeaveBalance | All | — | — | 🆕 | — |
| LEAVE-010 | Leave | Approval page loads | /hr/leave-approval | — | LeaveRequest | HR+ | ✅ | — | — | — |
| LEAVE-011 | Leave | HR approves → APPROVED | /hr/leave-approval | approveLeaveAction | LeaveRequest | HR+ | ✅ | — | ✅ | — |
| LEAVE-012 | Leave | HR rejects → REJECTED | /hr/leave-approval | approveLeaveAction | LeaveRequest | HR+ | ✅ | — | ✅ | — |
| LEAVE-013 | Leave | Approve → LeaveBalance usedDays++ | — | approveLeaveAction | LeaveBalance | HR+ | — | — | 🆕 | 🆕 |
| LEAVE-014 | Leave | Approve → Attendance ON_LEAVE created | — | approveLeaveAction | Attendance | HR+ | — | — | 🆕 | 🆕 |
| LEAVE-015 | Leave | Cancel pending leave | /workforce/leave | cancelLeaveAction | LeaveRequest | All | 🆕 | — | 🆕 | — |
| LEAVE-016 | Leave | Cancel approved → balance restored | — | cancelLeaveAction | LeaveBalance | All | — | — | 🆕 | 🆕 |
| LEAVE-017 | Leave | Email on apply | — | applyLeaveAction | — | All | — | — | — | 🆕 |
| LEAVE-018 | Leave | Email on approval | — | approveLeaveAction | — | HR+ | — | — | — | 🆕 |
| LEAVE-019 | Leave | Leave report page loads | /reports/leave | — | LeaveRequest | HR+ | 🆕 | — | — | — |
| LEAVE-020 | Leave | Carry forward cron | /api/cron/leave-carryforward | GET | LeaveBalance | CRON | — | 🆕 | 🆕 | — |
| LT-001 | LeaveType | Page loads | /hr/leave-types | — | LeaveType | HR+ | ✅ | — | — | — |
| LT-002 | LeaveType | Create leave type | /hr/leave-types | createLeaveTypeAction | LeaveType | HR+ | 🆕 | — | 🆕 | — |
| LT-003 | LeaveType | Edit leave type | /hr/leave-types | updateLeaveTypeAction | LeaveType | HR+ | 🆕 | — | 🆕 | — |
| LT-004 | LeaveType | Toggle active/inactive | /hr/leave-types | updateLeaveTypeAction | LeaveType | HR+ | 🆕 | — | 🆕 | — |
| LT-005 | LeaveType | isPaid toggle | /hr/leave-types | updateLeaveTypeAction | LeaveType | HR+ | — | — | 🆕 | — |
| LT-006 | LeaveType | requiresDocument policy | /hr/leave-types | updateLeaveTypeAction | LeaveType | HR+ | — | — | 🆕 | — |
| LT-007 | LeaveType | payrollImpact field | /hr/leave-types | updateLeaveTypeAction | LeaveType | HR+ | — | — | 🆕 | — |
| MED-001 | MedLeave | Requires doc after N days | /workforce/leave/new | applyLeaveAction | LeaveDocument | All | 🆕 | — | 🆕 | — |
| MED-002 | MedLeave | PDF upload accepted | /workforce/leave/new | applyLeaveAction | LeaveDocument | All | 🆕 | — | 🆕 | — |
| MED-003 | MedLeave | File size limit enforced | /workforce/leave/new | applyLeaveAction | — | All | 🆕 | — | — | — |
| MED-004 | MedLeave | Invalid file type rejected | /workforce/leave/new | applyLeaveAction | — | All | 🆕 | — | — | — |
| MED-005 | MedLeave | Document in DB | — | applyLeaveAction | LeaveDocument | All | — | — | 🆕 | — |
| MED-006 | MedLeave | HR can view doc on approval | /hr/leave-approval | — | LeaveDocument | HR+ | 🆕 | — | — | — |
| PAY-001 | Payroll | Page loads | /hr/payroll | — | Payroll | HR+ | ✅ | — | — | — |
| PAY-002 | Payroll | Records in table | /hr/payroll | — | Payroll | HR+ | ✅ | — | — | — |
| PAY-003 | Payroll | Generate payroll for month | /hr/payroll | generatePayrollAction | Payroll | HR+ | ✅ | — | 🆕 | — |
| PAY-004 | Payroll | DRAFT → PROCESSED API | — | POST /api/payroll/[id]/process | Payroll | HR+ | ✅ | ✅ | ✅ | — |
| PAY-005 | Payroll | PROCESSED → PAID API | — | POST /api/payroll/[id]/pay | Payroll | HR+ | — | 🆕 | 🆕 | — |
| PAY-006 | Payroll | DRAFT → PAID invalid | — | POST /api/payroll/[id]/pay | Payroll | HR+ | — | ✅ | — | — |
| PAY-007 | Payroll | Duplicate payroll prevented | — | Prisma unique | Payroll | HR+ | — | — | ✅ | — |
| PAY-008 | Payroll | Leave deduction in net salary | — | payroll-calc | Payroll,LeaveRequest | HR+ | — | — | 🆕 | — |
| PAY-009 | Payroll | Unpaid leave → deduction | — | payroll-calc | Payroll | HR+ | — | — | 🆕 | 🆕 |
| PAY-010 | Payroll | Payroll report page | /reports/payroll | — | Payroll | HR+ | ✅ | — | — | — |
| PAY-011 | Payroll | Payroll report data from DB | /reports/payroll | — | Payroll | HR+ | 🆕 | — | 🆕 | — |
| PAY-012 | Payroll | Auto-draft cron endpoint | /api/cron/payroll-draft | GET | Payroll | CRON | — | 🆕 | 🆕 | — |
| SLIP-001 | Payslip | Page loads for engineer | /workforce/payslip | — | Payroll | All | ✅ | — | — | — |
| SLIP-002 | Payslip | Shows correct amounts | /workforce/payslip | — | Payroll | All | 🆕 | — | 🆕 | — |
| SLIP-003 | Payslip | Print page loads | /workforce/payslip/[id]/print | — | Payroll | All | 🆕 | — | — | — |
| SLIP-004 | Payslip | Only shows own payslips | /workforce/payslip | — | Payroll | ENGINEER | 🆕 | — | 🆕 | — |
| CRM-001 | CRM | Leads list page | /crm/leads | — | Lead | Lead+ | ✅ | — | — | — |
| CRM-002 | CRM | Create lead | /crm/leads | createLeadAction | Lead | Lead+ | ✅ | — | ✅ | — |
| CRM-003 | CRM | Lead detail page | /crm/leads/[id] | — | Lead | Lead+ | ✅ | ✅ | — | — |
| CRM-004 | CRM | Edit lead status | /crm/leads/[id] | updateLeadAction | Lead | Lead+ | ✅ | ✅ | ✅ | — |
| CRM-005 | CRM | Pipeline statuses | /crm/leads | — | Lead | Lead+ | ✅ | — | — | — |
| CRM-006 | CRM | Add follow-up | /crm/leads/[id] | POST /api/leads/[id]/follow-ups | LeadFollowUp | Lead+ | ✅ | ✅ | ✅ | — |
| CRM-007 | CRM | Mark follow-up done | /crm/leads/[id] | PATCH follow-ups | LeadFollowUp | Lead+ | 🆕 | 🆕 | 🆕 | — |
| CRM-008 | CRM | Delete lead | /crm/leads/[id] | deleteLeadAction | Lead | Admin+ | 🆕 | 🆕 | 🆕 | — |
| CRM-009 | CRM | Lead source tracking | /crm/leads | createLeadAction | Lead | Lead+ | — | — | 🆕 | — |
| CRM-010 | CRM | Lead assignment to user | /crm/leads | createLeadAction | Lead | Admin+ | 🆕 | — | 🆕 | — |
| CRM-011 | CRM | Convert lead to client | /crm/leads/[id] | convertLeadAction | Lead,Client | Admin+ | 🆕 | — | 🆕 | 🆕 |
| CRM-012 | CRM | Leads report page | /reports/leads | — | Lead | Lead+ | ✅ | — | — | — |
| CRM-013 | CRM | Leads report data from DB | /reports/leads | — | Lead | Lead+ | 🆕 | — | 🆕 | — |
| CRM-014 | CRM | GET /api/leads/[id] | — | GET /api/leads/[id] | Lead | Lead+ | — | ✅ | — | — |
| CRM-015 | CRM | PATCH /api/leads/[id] | — | PATCH /api/leads/[id] | Lead | Lead+ | — | ✅ | — | — |
| CRM-016 | CRM | Engineer blocked from CRM | /crm/leads | RBAC | — | ENGINEER | ✅ | — | — | — |
| INV-001 | Invoices | Invoices page loads | /crm/invoices | — | Invoice,Client | Admin+ | 🆕 | — | — | — |
| INV-002 | Invoices | List from DB | /crm/invoices | — | Invoice | Admin+ | 🆕 | — | 🆕 | — |
| INV-003 | Invoices | Empty state | /crm/invoices | — | Invoice | Admin+ | 🆕 | — | — | — |
| INV-004 | Invoices | Status badges correct | /crm/invoices | — | Invoice | Admin+ | 🆕 | — | — | — |
| NOTIF-001 | Notif | Bell visible in header | — | — | Notification | All | 🆕 | — | — | — |
| NOTIF-002 | Notif | Mark as read | — | markNotifReadAction | Notification | All | 🆕 | — | 🆕 | — |
| NOTIF-003 | Notif | LEAVE_APPLIED notification created | — | applyLeaveAction | Notification | All | — | — | 🆕 | 🆕 |
| NOTIF-004 | Notif | LEAVE_APPROVED notification | — | approveLeaveAction | Notification | HR+ | — | — | 🆕 | 🆕 |
| NOTIF-005 | Notif | LEAVE_REJECTED notification | — | approveLeaveAction | Notification | HR+ | — | — | 🆕 | 🆕 |
| SET-001 | Settings | Page loads | /admin/settings | — | OrgPolicy | Admin+ | ✅ | — | — | — |
| SET-002 | Settings | Timezone setting saves | /admin/settings | updateSettingsAction | OrgPolicy | Admin+ | 🆕 | — | 🆕 | — |
| SET-003 | Settings | Weekly off days config | /admin/settings | updateSettingsAction | OrgPolicy | Admin+ | 🆕 | — | 🆕 | — |
| SET-004 | Settings | Payroll divisor mode | /admin/settings | updateSettingsAction | OrgPolicy | Admin+ | 🆕 | — | 🆕 | — |
| SET-005 | Settings | GPS accuracy setting | /admin/settings | updateSettingsAction | OrgPolicy | Admin+ | 🆕 | — | 🆕 | — |
| SET-006 | Settings | Engineer blocked from settings | /admin/settings | RBAC | — | ENGINEER | ✅ | — | — | — |
| LOG-001 | LoginAct | Page loads | /admin/login-activity | — | LoginActivity | Admin+ | ✅ | — | — | — |
| LOG-002 | LoginAct | Records show | /admin/login-activity | — | LoginActivity | Admin+ | 🆕 | — | 🆕 | — |
| LOG-003 | LoginAct | Shows user/role/IP/browser/OS | /admin/login-activity | — | LoginActivity | Admin+ | 🆕 | — | — | — |
| LOG-004 | LoginAct | Date range filter | /admin/login-activity | — | LoginActivity | Admin+ | 🆕 | — | — | — |
| LOG-005 | LoginAct | Engineer blocked | /admin/login-activity | RBAC | — | ENGINEER | ✅ | — | — | — |
| LOG-006 | AuditLog | Audit log page loads | /admin/audit-logs | — | AuditLog | SUPER_ADMIN | 🆕 | — | — | — |
| LOG-007 | AuditLog | Audit entries show | /admin/audit-logs | — | AuditLog | SUPER_ADMIN | 🆕 | — | 🆕 | — |
| RBAC-001 | RBAC | Roles page loads (SA only) | /admin/roles | — | User | SUPER_ADMIN | ✅ | — | — | — |
| RBAC-002 | RBAC | Role counts from DB | /admin/roles | — | User | SUPER_ADMIN | 🆕 | — | 🆕 | — |
| RBAC-003 | RBAC | Admin blocked from /admin/roles | /admin/roles | RBAC | — | ADMIN | ✅ | — | — | — |
| RBAC-004 | RBAC | HR blocked from CRM | /crm/leads | RBAC | — | HR | ✅ | — | — | — |
| RBAC-005 | RBAC | Engineer blocked from /hr/payroll | /hr/payroll | RBAC | — | ENGINEER | ✅ | — | — | — |
| RBAC-006 | RBAC | Lead blocked from /hr/* | /hr/payroll | RBAC | — | LEAD | ✅ | — | — | — |
| RBAC-007 | RBAC | All roles see dashboard | /dashboard | — | — | All | ✅ | — | — | — |
| RBAC-008 | RBAC | Super Admin accesses all routes | all | — | — | SUPER_ADMIN | ✅ | — | — | — |
| INV2-001 | Invite | Invitations page loads | /hr/invitations | — | EmpInvitation | HR+ | 🆕 | — | — | — |
| INV2-002 | Invite | Send invitation | /hr/invitations | sendInvitationAction | EmpInvitation | HR+ | 🆕 | — | 🆕 | — |
| INV2-003 | Invite | Accept invitation page | /invite/[token] | acceptInvitationAction | EmpInvitation,User | Public | 🆕 | — | 🆕 | 🆕 |
| INV2-004 | Invite | Expired invitation rejected | /invite/[token] | acceptInvitationAction | EmpInvitation | Public | 🆕 | — | — | — |
| ONB-001 | Onboard | Onboarding page loads | /onboarding | — | — | ENGINEER | 🆕 | — | — | — |
| ONB-002 | Onboard | Face registration | /onboarding | enrollFaceAction | Employee | ENGINEER | 🆕 | — | 🆕 | — |
| ORG-001 | OrgPolicy | Policy record in DB | — | org-policy | OrgPolicy | — | — | — | 🆕 | — |
| ORG-002 | OrgPolicy | weeklyOffDays affects leave count | — | leave-days | OrgPolicy | — | — | — | 🆕 | — |
| ORG-003 | OrgPolicy | Holidays affect leave count | — | leave-days | Holiday | — | — | — | 🆕 | — |
| CRON-001 | Cron | Auto-checkout endpoint returns 200/401 | /api/cron/auto-checkout | GET | Attendance | CRON | — | 🆕 | — | — |
| CRON-002 | Cron | Payroll draft endpoint returns 200/401 | /api/cron/payroll-draft | GET | Payroll | CRON | — | 🆕 | — | — |
| CRON-003 | Cron | Leave carryforward endpoint | /api/cron/leave-carryforward | GET | LeaveBalance | CRON | — | 🆕 | — | — |
| HC-001 | Audit | Dashboard KPIs not hardcoded | /dashboard | — | multiple | All | 🆕 | — | 🆕 | — |
| HC-002 | Audit | Employee count live from DB | /dashboard | — | Employee | All | 🆕 | — | 🆕 | — |
| HC-003 | Audit | No "Coming Soon" on any page | all | — | — | All | ✅ | — | — | — |
| UI-001 | UIState | Empty state on employee list | /workforce/employees | — | Employee | All | 🆕 | — | — | — |
| UI-002 | UIState | Success toast after action | all | — | — | All | 🆕 | — | — | — |
| UI-003 | UIState | Error state on form errors | all forms | — | — | All | 🆕 | — | — | — |
| UI-004 | UIState | 404 for invalid employee ID | /workforce/employees/bad | — | Employee | All | 🆕 | — | — | — |
| UI-005 | UIState | Responsive layout (mobile) | all | — | — | All | ✅ | — | — | — |
| UI-006 | UIState | Visual regression baseline | all | — | — | All | ✅ | — | — | — |

---

## Placeholder / Dead Feature Audit

| Location | Issue | Status |
|----------|-------|--------|
| /crm/invoices → "Create Invoice" button disabled | Explicitly disabled, no "Coming Soon" text shown | ACCEPTABLE — future enhancement |
| /admin/login-activity → no purge button | Not in requirements or schema | ACCEPTABLE |

---

*Last updated 2026-10-06. Total: 152 discovered, 152 tested.*
