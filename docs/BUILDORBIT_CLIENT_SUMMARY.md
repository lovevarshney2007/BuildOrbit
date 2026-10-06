# BuildOrbit — Client Presentation Summary

## Overview
**BuildOrbit** is a comprehensive, end-to-end Workforce and HR Management platform. It is engineered to consolidate employee tracking, attendance verification, leave management, payroll processing, and CRM lead tracking into a single, unified ecosystem.

## Target Users
- **Modern Enterprises & Agencies:** Organizations that require strict attendance compliance across multiple locations.
- **HR Administrators:** Professionals seeking to automate leave calculations and payroll deductions.
- **Distributed Teams:** Employees who need a mobile-friendly, self-service portal to manage their workday.

## Main Problems Solved
- **Data Silos:** Eliminates the need for disjointed spreadsheets by connecting leave balances directly to automated payroll deductions.
- **Time Theft:** Prevents unauthorized attendance logs through geofenced site validation and camera capture.
- **Administrative Overhead:** Automates routine tasks such as leave balance recalculation, payroll drafting, and email notifications.

## Core Modules
1. **Workforce Management:** Centralized directory for departments, designations, teams, and employee records.
2. **Attendance & Location:** Geolocation-verified check-ins restricted to predefined work sites (100m radius).
3. **Leave Management:** Robust approval workflows with support for various leave types (Paid, Unpaid, Medical) and secure document uploads.
4. **Payroll Processing:** Automated draft payroll generation that computes net salary based on basic pay, allowances, and unpaid leave deductions.
5. **CRM / Leads:** Built-in sales pipeline to track leads, assign ownership, and log follow-ups.
6. **Reporting:** Interactive analytics dashboards for attendance, payroll trends, and CRM sales funnels.

## Role-Based Access
BuildOrbit ensures a secure environment by tailoring access:
- **SUPER ADMIN / ADMIN:** Full system configuration, policy management, and global data access.
- **HR:** Access to workforce data, leave approvals, and payroll processing.
- **LEAD:** Restricted to overseeing assigned teams and managing CRM leads.
- **ENGINEER / EMPLOYEE:** Limited to a self-service portal (attendance, personal leave, profile updates, and payslips).

## Key Workflows
- **Geofenced Check-in:** Employee logs in → portal requests location → validates against assigned site coordinates → permits check-in.
- **Leave-to-Payroll Automation:** Employee requests unpaid leave → HR approves → system deducts leave balance & updates attendance → payroll engine automatically calculates salary deduction for the month.
- **Medical Leave Validation:** Employee requests medical leave → uploads prescription/certificate → HR reviews document during approval.

## Technology & Security
- **Tech Stack:** Next.js (App Router), React, Tailwind CSS v4, Prisma ORM, PostgreSQL, Recharts.
- **Security:** JWT-based session management, Next.js middleware for strict RBAC route protection, and centralized audit logging. 
- **Design:** Modern "Graphite / Near-Black" enterprise aesthetic ensuring responsive use on both desktop and mobile.

## Current Implementation Status
- **Status:** **Fully Implemented and Production-Ready** for all core workflows (Phases 1-10 completed).
- **Verified Capabilities:** Role-based dashboards, database connectivity, geofenced attendance, leave-to-payroll automation, CRM, and real-time Recharts analytics are complete and tested.
- **Known Limitations:** The platform relies on browser-based HTML5 Geolocation, which requires users to explicitly grant location permissions. Device-level location spoofing (e.g., GPS spoofing apps) is mitigated by WebRTC camera verification, though extreme edge cases depend on device integrity.
