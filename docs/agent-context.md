# Habit Shaper — Agent Handoff Context

## Purpose

Habit Shaper is a lightweight, private web application for one person to build good habits, quit unwanted habits, and tie streak milestones to goals. It is a coding-test submission, so clarity, a working end-to-end product, meaningful documentation, and a clean Git history matter more than speculative features.

## Product rules

- A **build** habit records a completion for a local calendar day. Its streak is consecutive completed days.
- A **quit** habit records a relapse for a local calendar day. Its clean streak is consecutive days with no relapse.
- Build habits show weekly completion and missed days.
- A goal belongs to one habit and completes when its target number of consecutive days is reached.
- Completed goals remain visible as achievements. Archived or removed items do not appear as active items.
- The product is for an individual, private daily companion. Avoid social, coaching, AI, enterprise, and overly playful features.

## Technology and runtime

- Monorepo: pnpm workspaces
- Frontend: React, TypeScript, Vite
- Backend: NestJS with Fastify, TypeScript
- Database: MySQL with Prisma
- Runtime: Docker Compose from the repository root
- Validation: Zod at API boundaries and for environment variables
- Authentication: email/password, database-backed session cookie; no email verification

## Repository layout

```text
apps/
  api/
    prisma/                 # schema, migrations, seed
    src/
      auth/ users/ habits/ goals/ database/ health/ common/ config/
  web/
    src/
      app/                  # layouts, pages, providers
      features/             # auth, habits, goals
      shared/               # api, components, config, lib, styles
docs/
  architecture.md
  data-model.md
  development-plan.md
  task-breakdown.md
compose.yml
Dockerfile
README.md
```

Use the existing feature-based layout. Create shared components only when they are genuinely reused; do not create empty folders or abstractions for hypothetical future needs.

## Implemented features

### Foundation and delivery

- pnpm monorepo, CI checks, Compose startup, MySQL, Prisma migrations, Dockerfile, `.env.example`, and README commands are in place.
- `docker compose up --build` starts database, migration, and application containers.
- API health endpoint: `GET /api/health`.

### Authentication

- Registration, login, session restoration, logout, protected endpoints, and session-cookie handling.

### Habits and tracking

- Create and list build/quit habits.
- Rename and archive habits.
- Mark/undo build completion for today.
- Mark/undo quit relapse for today.
- Build streak, quit clean streak, weekly completion rate, and missed-day count.
- Local-date handling is timezone-aware, including archive date behavior.

### Goals

- Create a single active goal for an active habit.
- Show current streak progress.
- Edit target days or remove an active goal.
- Automatically complete active goals when a habit reaches the target.
- Preserve completed goals in the achievements section.

## Current plan position

Phases through **GOAL-003: Preserve completed achievements** are complete.

The next planned work is Phase G — UX refinement. Before implementing, read the exact task wording and acceptance criteria in:

- `docs/development-plan.md`
- `docs/task-breakdown.md`

Likely next task: **UX-002 Dashboard composition** (the initial visual system was already applied). Keep the scope small: improve hierarchy, clarity, and empty/loading/error states around the existing habit and goal flow. Do not introduce a design system, animation suite, dashboard analytics, or new dependencies unless the task genuinely needs them.

## Important implementation details

- Prisma client is generated to `apps/api/src/generated/prisma`.
- Prisma schema and migrations live in `apps/api/prisma/`.
- The application uses ESM. Relative TypeScript imports commonly use a `.js` suffix because Node resolves the compiled JavaScript at runtime.
- `GoalsService` and `HabitsModule` deliberately use Nest `forwardRef` because a daily habit action can immediately reconcile and complete an associated goal. The Compose health check has verified that the module graph starts correctly.
- Goals API list response is an object:

```ts
{ active: ActiveGoal[], achievements: CompletedGoal[] }
```

- Keep user ownership checks on every habit and goal query.
- Keep date and streak calculations in the habit domain utilities rather than duplicating them in controllers or UI.

## Quality commands

Run deterministic local tools; do not ask an LLM to simulate formatting, linting, type checking, or testing.

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
docker compose up --build
```

For local API development, create a local `.env` from `.env.example` and set `DATABASE_URL` to the local Docker database. `DATABASE_URL` is intentionally required by the Zod environment parser; an undefined value should fail fast.

## Working conventions for the next agent

- Explain the precise scope and affected files before editing. Wait for the developer's explicit “go” or “yes” if they have not already authorized the change.
- The project developer owns all Git actions. Do **not** run Git commands, commit, push, merge, or create PRs. Provide a suggested branch and conventional commit only when asked.
- Use `apply_patch` for code and document edits.
- Prefer the smallest complete implementation. Do not over-engineer.
- Preserve unrelated user changes in the working tree.
- When a task changes API/React/TypeScript, use the relevant local skills and report why in a concise progress update.
- When a task has no code changes, do not manufacture refactors just to appear busy.

## Useful reference documents

- `docs/MVP.md` — product scope and definitions
- `docs/architecture.md` — technical architecture and runtime boundaries
- `docs/data-model.md` — database entities and invariants
- `docs/development-plan.md` — phased delivery story
- `docs/task-breakdown.md` — task-level acceptance criteria

