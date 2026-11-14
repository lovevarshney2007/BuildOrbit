# BuildOrbit

> An all-in-one HR, Payroll, Workforce Management, CRM, and Reporting platform for modern organizations.

![BuildOrbit](https://via.placeholder.com/1200x400?text=BuildOrbit+HR+Platform)

## Features

BuildOrbit provides a comprehensive suite of tools to manage your organization's human resources:

### 📊 Dashboard
- Overview of key metrics at a glance
- Visual charts and analytics
- Recent activities and alerts

### 👥 Workforce Management
- Employee directory and profiles
- Attendance tracking with GPS geofencing
- Leave management (medical, casual, urgent, etc.)
- Payroll processing with multiple calculation methods
- Payslip generation and viewing

### 👔 HR Management
- Human resource operations
- Application tracking system
- Document management
- Department organization

### 📈 Reports
- Comprehensive analytics and insights
- Custom report generation
- Drill-down data exploration
- Export functionality

### 🤖 CRM
- Customer relationship management
- Contact database
- Deal tracking
- Activity history

### 👤 Profile Management
- User profiles
- Account settings
- Security configuration
- Preference management

## Tech Stack

### Core Framework
- **Next.js 16.3.6** - React framework with App Router
- **React 19.2.8** - UI library
- **TypeScript 5** - Type safety

### Frontend Libraries
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Leaflet** - Maps and location tracking
- **Face-api.js** - Face recognition (security features)

### Backend & Database
- **Prisma 5.22.0** - ORM with type-safe queries
- **PostgreSQL** - Primary database
- **bcryptjs** - Password hashing
- **JWT / Token-based Authentication** - Security

### Email & File Handling
- **Resend** - Email sending
- **Cloudinary** - File uploads and storage
- **PDFKit** - PDF generation for payslips
- **React Email** - Email templates

### Utilities
- **Zod** - Schema validation
- **Next-Safe-Action** - Server action library
- **date-fns** - Date manipulation
- **clsx + tailwind-merge** - Utility classes

## Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun
- PostgreSQL Database

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd buildorbit
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

4. **Edit `.env` with your configuration**
```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/buildorbit?schema=public"

# Authentication
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Application
RESEND_API_KEY="your_resend_api_key_here"
NODE_ENV="development"
```

5. **Set up database**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (for development)
npx prisma db push --accept-data-loss

# For production, use migrations
npx prisma migrate deploy
```

6. **Seed the database (creates initial SUPER_ADMIN)**
```bash
npx prisma db seed
```

7. **Run development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

8. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

### Development

```bash
# Start development server
npm run dev

# Run with Turbopack (faster)
npm run dev -- --turbopack
```

### Building

```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Testing

```bash
# Run all E2E tests
npm run test:e2e

# Run all E2E tests (with detailed output)
npm run test:e2e:ui

# Run specific test suites
npm run test:e2e:routes      # Route security tests
npm run test:e2e:auth       # Authentication tests
npm run test:e2e:rbac       # Role-based access control tests
npm run test:e2e:crud       # CRUD operations tests
npm run test:e2e:workflows  # Workflow security tests
npm run test:e2e:headed     # Run tests with visible browser

# Run specific test files
npm run test:e2e:report     # Open test report
```

## Documentation

- [**Architecture**](docs/ARCHITECTURE.md) - System architecture and design decisions
- [**Database Schema**](docs/DATABASE.md) - Database structure and relationships
- [**API Reference**](docs/API_REFERENCE.md) - REST API endpoints
- [**Development Rules**](docs/DEVELOPMENT_RULES.md) - Coding conventions and guidelines
- [**Design System**](docs/DESIGN_SYSTEM.md) - UI/UX standards and components
- [**Testing Guide**](docs/BUILDORBIT_TESTING_GUIDE.md) - Testing strategies and procedures

## Project Structure

```
buildorbit/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (app)/                    # Protected routes (AppShell)
│   │   │   ├── admin/                # Admin dashboard
│   │   ├── (auth)/                   # Public/auth routes
│   │   ├── api/                      # REST API endpoints
│   │   ├── crm/                      # CRM module
│   │   ├── dashboard/                # Dashboard module
│   │   ├── hr/                       # HR module
│   │   ├── reports/                  # Reports module
│   │   ├── workforce/                # Workforce management
│   │   ├── onboarding/               # Onboarding flow
│   │   └── profile/                  # User profile
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   └── layout/                   # Layout components
│   └── lib/
│       ├── prisma.ts                 # Prisma client singleton
│       ├── navigation.ts             # Navigation configuration
│       └── utils.ts                  # Utility functions
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Development seed script
├── docs/                              # Project documentation
├── tests/                             # Test files
├── public/                            # Static assets
├── playwright.config.ts               # Playwright configuration
├── .env.example                       # Environment variables template
└── package.json                       # Dependencies
```

## Roles & Permissions

BuildOrbit supports role-based access control:

| Role | Description |
|------|-------------|
| **SUPER_ADMIN** | Full system access, manages all roles and settings |
| **ADMIN** | System administration, manages HR and employee data |
| **HR** | Human resources operations, leave management, payroll processing |
| **LEAD** | Team leadership, can manage team members |
| **ENGINEER** | Employee-focused, access to work-related features |

## Security Features

- **Password hashing** with bcrypt (10 salt rounds)
- **JWT-based authentication**
- **Role-based access control (RBAC)**
- **Geofence-based attendance tracking**
- **Session management**
- **Input validation with Zod**
- **Server-side API handlers**

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For issues, questions, or feedback, please contact the development team.

---

**Last Updated:** November 2024

**Version:** 0.1.0