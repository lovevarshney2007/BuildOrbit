# BuildOrbit — Design System

> This document defines the visual and interaction design language for BuildOrbit. All UI decisions must conform to these guidelines.

---

## Design Philosophy

BuildOrbit is a **professional enterprise application**. The design must communicate:

- **Clarity** — Data and actions are immediately legible
- **Efficiency** — Power users can navigate and act without friction
- **Trustworthiness** — The UI should feel stable, structured, and reliable
- **Restraint** — No decorative elements that don't serve a functional purpose

**What BuildOrbit is NOT:**
- Not a marketing website
- Not a consumer mobile app
- Not a portfolio or showcase
- Not an AI product with dramatic visual effects

---

## Layout & Responsiveness

- **Desktop-first** — The primary use case is a desktop browser at 1280px+ width
- **Responsive** — Must remain functional and usable at tablet breakpoints (768px+)
- **Mobile** — Read-only / limited access views acceptable; not a priority for initial builds
- Standard layout: **Fixed sidebar + top header + main content area**
- Sidebar width: ~240px (collapsed: ~64px icon-only)
- Content max-width: ~1440px with padding

---

## Color System

### Palette

| Token | Value (HSL) | Usage |
|---|---|---|
| `--background` | `60 5% 96%` | Page background (warm off-white / #f5f5f4) |
| `--foreground` | `0 0% 7%` | Primary text (near-black / #111111) |
| `--card` / `--popover` | `0 0% 100%` | Cards, panels, modals, tables (white) |
| `--border` / `--input` | `240 6% 90%` | All borders and dividers (#e4e4e7) |
| `--primary` | `0 0% 7%` | Primary actions, sidebar, headings (graphite / near-black / #111111) |
| `--primary-foreground` | `0 0% 100%` | Text on primary actions (white) |
| `--secondary` | `240 5% 96%` | Secondary buttons, subtle backgrounds (#f4f4f5) |
| `--muted` | `240 5% 96%` | Disabled fields, alternate subtle backgrounds |
| `--muted-foreground` | `240 4% 46%` | Secondary text, labels, captions (#71717a) |
| `--ring` | `0 0% 7%` | Focus rings (near-black) |

### Status Colors (Restrained)

| Token | Usage |
|---|---|
| `success` (Emerald) | Success state, active status badges |
| `warning` (Amber) | Warning state, pending badges |
| `error` (Rose) | Error state, destructive actions |
| `info` (Sky) | Informational state |

> Status colors are used **only** for badges, alerts, and validation feedback — not for backgrounds, buttons, or decorative elements.

### Explicitly Prohibited
- ❌ Generic SaaS Blue themes
- ❌ Gradients (linear or radial)
- ❌ Glassmorphism (backdrop-blur on cards)
- ❌ Neon colors
- ❌ Dark mode (for initial build — may be revisited later)
- ❌ Saturated backgrounds
- ❌ Decorative AI-style visual effects (blobs, aurora, shimmer)

---

## Typography

### Font

| Use | Font | Source |
|---|---|---|
| Primary UI font | **Inter** | Google Fonts |
| Alternative | **Geist** | Vercel (if available via next/font) |
| Code / monospace | **JetBrains Mono** | Google Fonts (optional, for code display only) |

### Scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| Page title | `1.25rem` (20px) | 600 | Main page heading (one per page) |
| Section heading | `1rem` (16px) | 600 | Card titles, section labels |
| Body | `0.875rem` (14px) | 400 | All body text, table cells |
| Small / caption | `0.75rem` (12px) | 400 | Labels, metadata, badges |

> ❌ No `text-3xl`, `text-4xl`, or hero typography in application views. This is not a landing page.

---

## Spacing

- Base unit: `4px`
- Use Tailwind spacing scale (`p-2` = 8px, `p-4` = 16px, `p-6` = 24px)
- Card padding: `p-4` or `p-6`
- Section spacing: `gap-6` or `gap-4` in grid/flex layouts
- Consistent `gap-2` between form fields

---

## Component Guidelines

### Tables
- Use for all multi-row data — not cards in a grid
- Columns: compact, left-aligned text, right-aligned numbers
- Actions column: icon buttons or a dropdown menu (no full text buttons per row)
- Sortable columns indicated with a chevron icon
- Pagination below the table
- Empty state: centered message with a descriptive icon

### Forms
- Labels above inputs (never placeholder-only labels)
- All inputs use the shadcn/ui `Input`, `Select`, `Textarea` components
- Validation errors displayed below the field in `--color-error`
- Submit button right-aligned or full-width in dialogs
- Use `Dialog` / `Sheet` for create/edit forms — not separate pages (for simple forms)

### KPI Cards (Dashboard)
- Compact — no large hero numbers
- Structure: Icon + Label + Value + Trend indicator (optional)
- No gradients, no colored card backgrounds
- White surface, subtle border

### Buttons

| Variant | Usage |
|---|---|
| `default` (dark) | Primary action per page or dialog |
| `outline` | Secondary actions |
| `ghost` | Sidebar nav items, icon-only actions |
| `destructive` | Delete / deactivate actions (red) |

- Only **one primary button** visible per view/dialog at a time
- No multiple filled buttons side by side

### Badges / Status Indicators
- Use `Badge` component from shadcn/ui
- Variants: `success`, `warning`, `error`, `info`, `default`
- Text: short and uppercase or sentence-case (not all-caps for long labels)

### Dialogs & Modals
- Use for create/edit/confirm actions
- Max width: `sm` (384px) for confirms, `md` (512px) for forms, `lg` (640px) for complex forms
- Always include a clear title and a close button
- Destructive confirmation dialogs must show explicit consequence text

### Icons
- Library: **Lucide React** exclusively
- Size: `16px` (`size-4`) inline, `20px` (`size-5`) in buttons and nav
- Never use icons without an accessible label or tooltip when used alone

---

## Sidebar Navigation

- Fixed left sidebar, always visible on desktop
- Active route: subtle background highlight with `--color-accent` left border indicator
- Grouped navigation sections with section labels
- Icon + text in expanded state; icon only in collapsed state
- Bottom section: user profile / logout

---

## What "Enterprise UI" Means Here

- Tables over card grids for data lists
- Tight spacing — no excessive whitespace padding
- No large decorative illustrations in the main UI
- Functional empty states (text + icon, no elaborate graphics)
- Consistent header structure on every page: Page title + breadcrumb + primary action button
- Dialogs for create/edit, not separate routes (for most forms)
- Data density is a feature, not a problem

---

_Last updated: 2026-09-30_
