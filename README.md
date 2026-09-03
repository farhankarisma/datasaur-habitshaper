# Habit Shaper

Habit Shaper is a lightweight, private web application for building helpful habits,
quitting unwanted habits, and working toward streak-based goals. It was developed as
a coding-test submission with an emphasis on complete vertical slices, explicit
business rules, and a reviewer-friendly containerized setup.

## Features

- Register, log in, restore a session, and log out with email and password.
- Create, rename, list, and archive build or quit habits.
- Mark or undo today's completion for a build habit.
- Record or undo today's relapse for a quit habit.
- Track build streaks, clean streaks, weekly completion, and missed days.
- Create, edit, and remove a streak goal linked to a habit.
- Complete goals automatically when their target streak is reached.
- Preserve completed goals as achievements.
- Calculate calendar days using the user's saved IANA timezone.

## Quick start

Docker and Docker Compose are the only prerequisites. From the repository root, run:

```powershell
docker compose up --build
```

Then open:

- Application: <http://localhost:3000>
- Health check: <http://localhost:3000/api/health>

The first startup may take a few minutes while Docker downloads images and builds the
application. Compose waits for MySQL to become healthy, applies all Prisma migrations,
and starts the application only after migration succeeds.

Stop the stack without deleting its database:

```powershell
docker compose down
```

Delete the containers and persisted development database only when a clean reset is
intended:

```powershell
docker compose down --volumes
```

## Reviewer walkthrough

1. Register with an email address and password. The browser timezone is stored with
   the account.
2. Create a **Build** habit and mark it complete for today.
3. Create a **Quit** habit. Clean days accumulate automatically; record a relapse only
   when it happens.
4. Create a consecutive-day goal for either habit.
5. Review the current streak, weekly build statistics, goal progress, and completed
   achievements.
6. Log out and confirm that the private dashboard is no longer accessible.

## Technology

| Area | Choice |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, native CSS |
| Backend | NestJS with Fastify, TypeScript |
| Database | MySQL 8.4, Prisma ORM |
| Validation | Zod |
| Authentication | Argon2 password hashing and opaque database-backed sessions |
| Testing | Vitest and Testing Library |
| Delivery | Docker, Docker Compose, GitHub Actions |

The production image builds both applications. NestJS serves the compiled React
frontend and the `/api` endpoints from one origin. Compose runs three services:

- `db`: persistent MySQL database with a health check.
- `migrate`: one-shot Prisma migration service.
- `app`: combined frontend and API application with a health check.

## Configuration

No `.env` file is required for the default Docker startup because `compose.yml`
contains development-safe fallback values. To customize ports or credentials, copy
the documented placeholders first:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Do not commit `.env` or real credentials.

| Variable | Used by | Default or requirement |
| --- | --- | --- |
| `APP_HOST_PORT` | Compose | Host application port; defaults to `3000` |
| `MYSQL_HOST_PORT` | Compose/local tools | Host MySQL port; defaults to `3307` |
| `MYSQL_DATABASE` | Compose | Defaults to `habit_shaper` |
| `MYSQL_SHADOW_DATABASE` | Compose/Prisma development | Defaults to `habit_shaper_shadow` |
| `MYSQL_USER` | Compose | Development database user |
| `MYSQL_PASSWORD` | Compose | Development database password |
| `MYSQL_ROOT_PASSWORD` | Compose | Development root password |
| `DATABASE_URL` | API/Prisma | Required outside Compose; must use a `mysql://` URL |
| `SHADOW_DATABASE_URL` | Prisma development | Required by `prisma migrate dev` |
| `NODE_ENV` | API | `development`, `test`, or `production` |
| `PORT` | API | API port; defaults to `3000` |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` | Database tests | Test database connection values |

## Local development

Local development is optional and requires Node.js 24 and pnpm 10 in addition to
Docker. Create the local environment file, start MySQL, install dependencies, generate
the Prisma client, and run both applications in watch mode:

```powershell
Copy-Item .env.example .env
docker compose up db -d
pnpm install --frozen-lockfile
pnpm db:generate
pnpm dev
```

The frontend development server prints its URL in the terminal. The API listens on
the `PORT` configured in `.env`.

## Quality checks

The pull-request workflow installs from the lockfile, generates the Prisma client,
and runs the deterministic repository checks:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Database integration tests require the Compose MySQL service and the values from
`.env.example`:

```powershell
docker compose up db -d
pnpm test:db
```

## Source layout

```text
habit-shaper/
├── apps/
│   ├── api/
│   │   ├── prisma/          # Schema and migrations
│   │   └── src/             # Auth, users, habits, goals, health, and configuration
│   └── web/
│       └── src/             # App shell, feature modules, and shared UI
├── docs/                    # Product, architecture, data, and delivery documentation
├── .github/workflows/       # Continuous integration
├── compose.yml              # Reviewer-facing stack
├── Dockerfile               # Multi-stage production image
└── .env.example             # Placeholder configuration
```

## Documentation

- [`docs/MVP.md`](docs/MVP.md) defines product terminology, rules, and acceptance
  criteria.
- [`docs/architecture.md`](docs/architecture.md) describes system boundaries and
  architectural decisions.
- [`docs/data-model.md`](docs/data-model.md) explains entities, relationships, and
  streak invariants.
- [`docs/development-plan.md`](docs/development-plan.md) records the phased delivery
  plan.
- [`docs/task-breakdown.md`](docs/task-breakdown.md) contains the task board and
  acceptance criteria.
- [`docs/agentic-development.md`](docs/agentic-development.md) records how coding
  agents assisted development and where human judgment remained authoritative.

## Known limitations

- The application intentionally supports individual accounts only; there are no
  social, team, coaching, or administrative features.
- Email verification and password recovery are outside the MVP.
- Daily completion and relapse corrections are limited to today to preserve history.
- Only one active goal can be attached to a habit at a time.
- Archived habits are removed from the active interface and currently have no restore
  action.

## Troubleshooting

- If port `3000` or `3307` is already in use, copy `.env.example` to `.env` and change
  `APP_HOST_PORT` or `MYSQL_HOST_PORT`.
- If the database was created with older local credentials, run
  `docker compose down --volumes` and restart. This permanently removes local Compose
  database data.
- Inspect container state and logs with `docker compose ps` and
  `docker compose logs app migrate db`.

## License

This repository is a private coding-test submission and is not licensed for
redistribution.
