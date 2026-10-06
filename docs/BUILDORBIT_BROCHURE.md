# BUILDORBIT
**Workforce & HR Management Platform**

## About BuildOrbit
BuildOrbit is an end-to-end workforce and HR management platform designed to streamline operations, automate attendance, and manage payroll. Built for modern enterprises, it seamlessly connects employee management, leave tracking, location-based attendance, and client relations into one secure platform.

## Why BuildOrbit
Managing a distributed workforce is complex. BuildOrbit eliminates data silos by connecting attendance, leave, and payroll directly. By providing automated workflows, real-time geofenced tracking, and actionable analytics, BuildOrbit helps organizations reduce administrative overhead, ensure compliance, and empower employees through self-service tools.

## Core Capabilities

### Workforce Management
Maintain a comprehensive directory of your organization. Manage departments, designations, teams, and employee profiles from a single dashboard. 

### Employee Management
Enable employee self-service for updating profiles, tracking leave balances, and viewing payslips.

### Attendance
Track daily attendance with detailed logs for check-ins, check-outs, and worked hours. View attendance histories across the entire organization.

### Site & Location Management
Assign employees or entire teams to specific work sites. Enforce attendance compliance using HTML5 Geolocation and WebRTC camera capture for 100m geofencing validation.

### Leave Management
Create custom leave types (paid, unpaid, medical) with configurable policies. Employees can request leave, upload supporting documents, and track approvals seamlessly. 

### Payroll
Automate draft payroll generation. BuildOrbit calculates base salaries, applies manual allowances, and automatically deducts for unpaid leaves to generate accurate net salaries and payslips.

### CRM / Lead Management
Track client leads through a customizable pipeline. Manage follow-ups, assignments, and conversion statuses directly alongside workforce operations.

### Reports & Analytics
Access specialized reports including attendance tracking, payroll trends, and lead sales funnels through dynamic Recharts-powered analytics.

### Notifications
Keep teams aligned with automated in-app notifications and integrated transactional emails (via Resend) for leave requests, approvals, and payroll alerts.

### Security & Access Control
Protect sensitive data with a robust role-based access control (RBAC) architecture, JWT-based sessions, and secure Next.js middleware.

### Audit & Activity Tracking
Monitor system usage with comprehensive login activity logs and detailed audit trails for critical entity changes.

## Role-Based Access
BuildOrbit ensures security and focus through tailored dashboards and permissions:
- **SUPER ADMIN & ADMIN**: Full system access, policy configuration, and global reporting.
- **HR**: Manage payroll, leave approvals, employee records, and HR reporting.
- **LEAD**: Oversee assigned teams and CRM lead pipelines.
- **ENGINEER / EMPLOYEE**: Access self-service portals to mark attendance, apply for leave, view payslips, and manage profiles.

## Attendance & Location
Ensure accurate time-tracking for distributed teams. BuildOrbit allows HR to define Sites with specific coordinates and radii. When employees log in via the Self-Service Attendance Portal, the system validates their location against the assigned site's geofence before allowing a check-in.

## Leave & Payroll
BuildOrbit seamlessly connects leave to payroll. When an employee takes unpaid leave, the system automatically calculates the exact deduction based on their daily rate and the organization's payroll policy, reflecting the change instantly in their next draft payroll.

## Medical Leave
Configure specialized leave types like Medical Leave that require supporting documentation. Employees can securely upload prescriptions or medical certificates, which HR can review during the approval workflow.

## Reports & Analytics
Transform data into actionable insights. Admins and HR can access visual dashboards (powered by Recharts) detailing leave balances, attendance compliance, payroll cost trends, and CRM lead conversion funnels.

## Security
Built on enterprise-grade infrastructure, BuildOrbit utilizes PostgreSQL with Prisma ORM, secure JWT session management, strict RBAC middleware, and comprehensive audit logging to protect organizational data.

## Technology
BuildOrbit leverages a state-of-the-art stack: Next.js (App Router), React, Tailwind CSS v4, Prisma ORM, PostgreSQL, Recharts, and Resend for emails. The platform utilizes semantic CSS variables for a modern, responsive "Graphite / Near-Black" design system.

## Product Experience
The platform offers a premium, responsive user interface featuring a dynamic 12-column analytics grid, SVG charts, and a centralized enterprise dashboard accessible across desktop and mobile devices.

## Contact
**FosterAI Technologies**
Email: fosterai.tech@gmail.com
Phone: 9582273806
Address: 20, Tech Zone 7, IT Plots, Greater Noida, Uttar Pradesh 203207
