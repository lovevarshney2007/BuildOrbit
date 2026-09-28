# BuildOrbit — Development Rules

These rules govern how BuildOrbit is built. Every contributor (human or AI assistant) must follow them without exception.

---

## Working Rules

### 1. Do NOT build the entire application at once
Features are implemented one at a time, in logical sequence, with review between each step. No shortcuts.

### 2. Do NOT implement any business feature until the foundation is verified
Infrastructure (project setup, database connection, auth) must be confirmed working before any feature work begins.

### 3. Do NOT generate unnecessary code
Every file and function must serve an immediate, confirmed requirement. No speculative code, no placeholder pages that aren't needed yet, no utility functions "just in case."

### 4. Do NOT change the technology stack without explicit approval
The stack (Next.js, TypeScript, Tailwind, shadcn/ui, PostgreSQL, Prisma, Zod, bcrypt, Recharts, Lucide React) is fixed. Any change requires a discussion and a recorded decision in `DECISIONS.md`.

### 5. Do NOT modify unrelated files
Each change targets only the files required for the current step. No opportunistic refactoring or reformatting of unrelated code.

### 6. Before making changes, explain what you are going to do
Every step must be described clearly before implementation begins: what files will change, why, and what the expected result is.

### 7. Make only the smallest logical change required for the current step
Prefer small, reviewable diffs. If a step feels too large, break it down further.

### 8. After making changes, explain every important file and command
After any implementation, provide a clear explanation of what was created/modified, what each file does, and what any commands mean.

### 9. Do not automatically continue to the next feature
Each step ends with a stop. The next step begins only when explicitly instructed.

### 10. Do not claim something is complete unless it has been verified
"Done" means: built, run, and confirmed to work — not just written. Unverified steps are marked as **pending verification**.

### 11. Keep project documentation synchronized with the code
Every architectural decision, API change, database schema change, or status change must be reflected in the appropriate `docs/` file immediately.

### 12. Whenever an important requirement, architecture decision, database decision, API decision, or project status changes — update the documentation
The `docs/` folder is the single source of truth for project state. Code and documentation must stay in sync.

### 13. The developer runs important commands themselves
Commands that affect the environment (package installation, database migrations, git operations) are provided as instructions, not auto-executed, so the developer understands each step.

### 14. Do not auto-commit Git changes
Git commits are made explicitly by the developer with a deliberate message. No auto-commits.

---

## Code Quality Rules

- All code is written in **TypeScript** with strict mode enabled
- All API input is validated with **Zod** before any processing
- No `any` types without an explicit comment explaining why
- All Prisma queries use the generated types — no raw SQL unless absolutely necessary and documented
- Components are kept small and focused — one responsibility per component
- Environment variables are never hardcoded — always use `.env` with `.env.example` as the template

---

## Git Rules

- Branch naming: `feature/<name>`, `fix/<name>`, `docs/<name>`
- Commit messages follow the pattern: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`
  - Example: `feat(auth): add login route handler`
- Never commit `.env` files — only `.env.example`
- Never commit generated files like `node_modules/` or `.next/`

---

## Documentation Rules

- `PROJECT_CONTEXT.md` — Stable. Update only when the project purpose or stack changes.
- `REQUIREMENTS.md` — Update as requirements are confirmed or refined.
- `ARCHITECTURE.md` — Update when structural decisions are made or implemented.
- `DATABASE.md` — Update whenever a Prisma model is added, modified, or removed.
- `API_REFERENCE.md` — Update whenever a Route Handler is created or changed.
- `DEVELOPMENT_RULES.md` — Update only if a rule is formally agreed to be added or changed.
- `CURRENT_STATUS.md` — Update at the end of every working session.
- `DECISIONS.md` — Update whenever a non-trivial technical decision is made.
- `DESIGN_SYSTEM.md` — Update when UI conventions or tokens are established.

---

_Last updated: 2026-09-28 — Rules unchanged. Next.js project initialization verified._
