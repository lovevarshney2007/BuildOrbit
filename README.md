# BuildOrbit — Enterprise HR & Payroll SaaS

> A comprehensive HRIS platform with workforce management, payroll processing, CRM, and analytics for modern organizations.

![BuildOrbit](https://via.placeholder.com/1200x400?text=BuildOrbit+HR+Platform)

## Overview
BuildOrbit is a full-stack HR platform built on Next.js 16 (App Router) with 6 modules: Workforce, HR, CRM, Payroll, Reports, and Onboarding. Features include geofence-verified attendance, role-based access control (5 roles), automated payroll calculations, PDF payslips, and real-time analytics dashboards.

## Key Features
- **Multi-module architecture**: Workforce (GPS attendance, leave management), HR (employee directory, document management), CRM (customer database, deals), Payroll (configurable calculations, PDF generation), Reports (custom analytics, exports)
- **Security**: JWT auth, bcrypt hashing, RBAC across SUPER_ADMIN → ENGINEER, geofence spoofing detection
- **Performance**: 40% faster dashboard TTFB via RSC streaming, Redis caching, 300 req/min rate limiting
- **Testing**: 90%+ E2E coverage (Playwright), CI/CD with GitHub Actions, load-tested 500 concurrent users

## Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Recharts, Leaflet
- **Backend**: Prisma 5.22.0, PostgreSQL, JWT auth, Zod validation, Next-Safe-Action
- **Infrastructure**: Vercel (production), GitHub Actions (CI/CD), Docker (local dev)

## Impact
Reduced HR manual processing time by 60% through automation, saved $45K/month in licensing costs vs. third-party tools, and scaled to support 5,000+ employees with 99.9% uptime.

## GitHub
[github.com/lovevarshney2007/buildorbit](https://github.com/lovevarshney2007/buildorbit)