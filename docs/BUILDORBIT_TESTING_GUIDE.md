# BuildOrbit — Application Testing Guide

## 1. Application Overview
**BuildOrbit** is an end-to-end workforce and HR management platform designed to streamline operations, automate attendance, and manage payroll. It connects employee management, leave tracking, location-based attendance, and client relations into one secure platform.

**Major Modules:**
- Workforce Management
- Attendance (Geofenced)
- Leave Management (including Medical Leave with documents)
- Payroll
- CRM / Leads
- Reporting & Analytics
- Settings & Auditing

**Supported Roles:**
- SUPER_ADMIN
- ADMIN
- HR
- LEAD
- ENGINEER (Employee)

## 2. Test Environment
- **Application URL:** Use the local or staging URL provided (e.g., `http://localhost:3000`).
- **Test Accounts:** Access is defined through predefined mock users based on roles (SUPER_ADMIN, ADMIN, HR, LEAD, ENGINEER) seeded in the database.
- **Browser Requirements:** Chrome, Firefox, Safari, or Edge (latest versions recommended). For geofenced attendance, the browser must allow location tracking and camera access.
- **Test Database:** Ensure the database is seeded using the Prisma seed script to populate test data, including sites, leave types, users, and organization policies.

## 3. ROLE-BY-ROLE TESTING

### SUPER ADMIN & ADMIN
**Flow:**
1. **Login:** Access as Super Admin or Admin.
2. **Dashboard:** Verify access to the enterprise dashboard featuring organization-wide statistics.
3. **Modules Available:** All modules (Workforce, HR, CRM, Admin, Reports).
4. **Feature Testing:** 
   - Verify ability to create/edit sites and users.
   - Verify access to global reports.
   - Verify access to Settings and Login Activity logs.
5. **Expected Result:** Full access to configure organization policies and view all data.

### HR
**Flow:**
1. **Login:** Access as HR.
2. **Dashboard:** Verify HR-focused metrics (leave requests, payroll status).
3. **Modules Available:** Workforce (Employees, Attendance, Leaves), HR (Payroll, Leave Approvals, Leave Master).
4. **Feature Testing:**
   - Review and approve/reject leave requests.
   - Generate and process draft payrolls.
   - Edit Leave Master configurations.
5. **Expected Result:** Cannot access Settings or CRM, but has full control over HR processes.

### LEAD
**Flow:**
1. **Login:** Access as Lead.
2. **Dashboard:** Verify team-centric dashboard.
3. **Modules Available:** CRM/Leads, Team Attendance, Team Leaves.
4. **Feature Testing:**
   - Add/edit CRM leads.
   - Update lead pipelines and follow-ups.
   - View team attendance.
5. **Expected Result:** Access restricted to assigned team members and CRM pipeline. Cannot access Payroll or global Settings.

### ENGINEER / EMPLOYEE
**Flow:**
1. **Login:** Access as Engineer.
2. **Dashboard:** Verify employee self-service dashboard (12-column grid, SVG charts, leave balances).
3. **Modules Available:** Self-Service Portal (My Profile, My Attendance, My Leaves, Apply Leave, Payslip).
4. **Feature Testing:**
   - Apply for leave.
   - Mark attendance via Self-Service Portal.
   - Download/view payslips.
5. **Expected Result:** Cannot access HR, Admin, or CRM modules. Access is restricted to personal records.

## 4. COMPLETE FEATURE TESTING

### Authentication
- [ ] Login with valid credentials.
- [ ] Login with invalid credentials (verify error state).
- [ ] Role-based redirect upon login.
- [ ] Session expiry and logout.

### Dashboard
- [ ] Verify role-specific widgets load correctly.
- [ ] Check dynamic charts (attendance, leave balances).

### Workforce
- **Employees:** List view, pagination, search, filter by status/department.
- **Attendance:** View daily logs, verify check-in/out times.
- **Leave:** View leave history and status.

### Sites & Location
- **Sites:** Create new site, set lat/long and radius, assign employees/teams.
- **Geofence:** Verify validation logic (inside vs. outside radius).

### Leave & HR
- **Apply Leave:** Select type, calculate days, validate.
- **Leave Master:** Edit leave types, change paid/unpaid status.
- **Leave Approval:** Approve/reject workflow, verify balance update.

### Medical Leave & Documents
- **Apply:** Select medical leave, attach file (PDF/JPG/PNG).
- **Validation:** Check size limit (e.g., 5MB).
- **Review:** HR verifies document in approval flow.

### Payroll
- **Draft:** Generate payroll for a month.
- **Calculation:** Verify base salary, allowances, and automatic deductions for unpaid leave.
- **Payslip:** View generated payslip.

### CRM / Leads
- **Leads:** Create lead, update status (pipeline), assign owner.
- **Follow-ups:** Log follow-up actions.

### Reports
- **Attendance Report:** Filter by date, view records.
- **Payroll Report:** View cost trends.
- **Lead Report:** View sales funnel.

### Admin
- **Audit Logs:** Verify critical actions are logged.
- **Login Activity:** Check IP and device tracking.

## 5. ATTENDANCE TEST FLOW

**Positive Scenario:**
1. Employee Login -> Open Attendance.
2. Check assigned site.
3. Allow location/camera permission.
4. System detects location.
5. Location verified within geofence radius.
6. Mark attendance (Check-in).
7. Verify attendance record is created.
8. Check dashboard and attendance report for updates.

**Negative Scenarios:**
- Outside allowed location (geofence fails).
- No location permission granted (browser block).
- Invalid/mocked location.
- No site assignment for the employee.

## 6. LEAVE TEST FLOW

1. Apply Leave -> Select Leave Type (e.g., Paid Leave).
2. Select Dates -> System calculates working days.
3. Submit -> Status is Pending.
4. HR Review -> Approve.
5. Verify Leave Balance is deducted.
6. Verify Attendance reflects "ON_LEAVE" for those dates.
7. Verify Payroll reflects paid status (no deduction).
8. Verify Dashboard and Reports update.

## 7. MEDICAL LEAVE TEST FLOW

1. Apply Medical Leave -> Select dates.
2. System requires supporting document (Prescription/Certificate).
3. Upload valid file (PDF/JPG/PNG, <5MB).
4. Submit -> HR Review.
5. HR views the secure document.
6. Approve -> Leave balance updates.

**Negative Scenarios:**
- Upload invalid file type.
- Upload file > max limit.
- Submit without required document.

## 8. PAYROLL TEST FLOW

**Scenario: Unpaid Leave Deduction**
1. Ensure Employee has 1 day of Unpaid Leave approved in the month.
2. Generate Draft Payroll for the month.
3. Verify: Basic Salary + Allowances - (Unpaid Leave Deduction) = Net Salary.
4. Verify payslip reflects the exact leave deduction based on the daily rate.

## 9. SITE + LOCATION TEST FLOW

1. HR: Create Site (Set latitude, longitude, radius).
2. HR: Assign Team to Site.
3. Employee (in Team): Opens Attendance Portal.
4. System calculates distance between device coordinates and Site coordinates.
5. Inside Geofence -> Check-in Allowed.
6. Outside Geofence -> Check-in Rejected.

## 10. CRM / LEAD TEST FLOW

1. Lead/Admin: Create Lead.
2. Pipeline: Move lead from NEW -> CONTACTED -> QUALIFIED.
3. Follow-up: Add meeting notes.
4. Convert: Mark lead as CONVERTED.
5. Reports: Verify Lead Sales Funnel report reflects conversion.

## 11. REPORTING TEST FLOW

1. Open Report (Attendance, Payroll, or CRM).
2. Apply filter (e.g., Date range, Status).
3. Verify data accurately reflects system state.
4. Test dynamic charts (Recharts) render correctly on resize.

## 12. NOTIFICATION TEST FLOW

- **Leave Applied:** Notification to HR/Approver.
- **Leave Approved/Rejected:** Notification to Employee.
- **Payroll Event:** Notification when Payslip is generated.
*Verify notifications appear in the in-app notification center.*

## 13. UI/UX TESTING

**Responsive Testing:**
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

**Elements to Verify:**
- Layout consistency.
- Navigation (Sidebar vs. Mobile menu).
- Data tables scrolling horizontally on mobile.
- Dialogs/Modals displaying correctly.
- Button states (loading, disabled).
- Forms (validation error states).
- Dark/Graphite theme consistency.

## 14. BUG REPORT FORMAT

```
Bug ID: [e.g., BUG-001]
Module: [e.g., Attendance]
Feature: [e.g., Geofence Check-in]
Steps to Reproduce:
  1. Login as Engineer.
  2. Go to Attendance.
  3. ...
Expected Result: Check-in should fail.
Actual Result: Check-in succeeds outside geofence.
Severity: [Low/Medium/High/Critical]
Screenshot/Evidence: [Link]
Status: [New/In Progress/Resolved]
```

## 15. TEST RESULT SUMMARY

| Feature | PASS | FAIL | BLOCKED | NOT APPLICABLE |
| :--- | :---: | :---: | :---: | :---: |
| Authentication | [ ] | [ ] | [ ] | [ ] |
| Dashboard | [ ] | [ ] | [ ] | [ ] |
| Workforce (Employees) | [ ] | [ ] | [ ] | [ ] |
| Attendance (Geofence) | [ ] | [ ] | [ ] | [ ] |
| Leave Management | [ ] | [ ] | [ ] | [ ] |
| Medical Leave Uploads | [ ] | [ ] | [ ] | [ ] |
| Payroll Generation | [ ] | [ ] | [ ] | [ ] |
| CRM / Leads | [ ] | [ ] | [ ] | [ ] |
| Reporting / Analytics | [ ] | [ ] | [ ] | [ ] |
| Notifications | [ ] | [ ] | [ ] | [ ] |
| Role-Based Permissions | [ ] | [ ] | [ ] | [ ] |
