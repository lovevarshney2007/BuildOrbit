# BuildOrbit - Pending Tasks & Roadmap 🚀

This document tracks the features and modules that are yet to be implemented in the BuildOrbit operating system.

## 1. User & Role Management (HR/Admin) 👥
- [x] **Invite Users:** Ability for HR to send email invitations to new employees to join the platform.
- [x] **Employee Onboarding:** A step-by-step onboarding flow for new employees to fill out their profile, upload documents (ID proofs, Bank Details), and register their Face ID.
- [x] **Role Permissions:** Granular access control to manage what `LEAD`, `ENGINEER`, and `HR` can view or edit.

## 2. Document Management 📂
- [x] **Cloud Storage Integration:** Integrate AWS S3 or a similar service to securely store employee documents.
- [x] **Medical Certificates:** When an employee applies for Sick Leave for more than 2 days, enforce a mandatory document upload.
- [x] **Payslip Storage:** Automatically archive generated PDF payslips to the employee's document vault.

## 3. Automation (Cron Jobs) ⚙️
- [x] **Daily Attendance Auto-Checkout:** If an employee forgets to Check-Out, a background job should automatically mark them as checked-out at the end of the shift or mark the day as half-day depending on the policy.
- [x] **Monthly Payroll Auto-Drafting:** On the 1st of every month, automatically generate "DRAFT" payroll records for all active employees by calculating the previous month's LWP (Unpaid Leaves).
- [x] **Leave Balance Carry Forward:** At the end of the financial year, automatically carry forward remaining unused leaves to the next year based on the Leave Policy rules.

## 4. Shift & Roster Management ⏰
- [x] **Shift Policies:** Define multiple shifts (e.g., Morning Shift, Night Shift) with specific start and end times.
- [x] **Roster Assignment:** Allow HR/Managers to assign specific shifts to different teams or employees.
- [x] **Late Coming/Early Going Tracking:** Automatically flag employees who check in late or check out early based on their assigned shift.

## 5. Advanced CRM (Client Records) 📈
- [x] **Client Profiles:** Convert "Leads" into "Clients" and maintain a detailed database of client projects and contracts.
- [x] **Invoicing:** Generate invoices for clients based on project milestones.

## 6. Notifications & Real-Time Alerts 🔔
- [x] **In-App Notifications:** A notification bell icon in the dashboard for real-time alerts (e.g., "Your leave was approved", "New Lead Assigned").
- [x] **Slack/Discord Integration:** Send critical alerts (like Super Admin security alerts or high-value CRM leads) directly to a company Slack channel.

## 7. App Refinements 📱
- [x] **Mobile Responsiveness:** Polish the UI components to ensure perfect usability on mobile devices (especially the Face Recognition Check-In).
- [x] **PWA (Progressive Web App):** Configure the app so employees can "Install" it on their phones directly from the browser for quick attendance marking.
