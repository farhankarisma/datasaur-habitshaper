# Habit Shaper Task Breakdown

## 1. Purpose

This is the concise execution board for the Habit Shaper MVP. Detailed reasoning, risks, and submission strategy remain in `development-plan.md`; this file answers what is next, what blocks it, and what proves it complete.

## 2. Status Model

| Status        | Meaning                                        |
| ------------- | ---------------------------------------------- |
| `BACKLOG`     | Defined but missing a dependency               |
| `READY`       | All hard dependencies are satisfied            |
| `IN PROGRESS` | The current active task                        |
| `REVIEW`      | Implemented and awaiting verification or merge |
| `DONE`        | Accepted and merged into `main`                |
| `BLOCKED`     | Requires external input or authority           |

The project has one primary developer. Keep at most one implementation task `IN PROGRESS`; documentation may accompany the active slice.

## 3. Definition of Done

A task is `DONE` only when:

1. Its acceptance criteria pass.
2. Relevant automated tests pass.
3. Root formatting, linting, type-checking, testing, and build commands pass.
4. Documentation agrees with the implementation.
5. No unrelated files, generated output, or secrets are included.
6. The change has a focused Conventional Commit and reviewed pull request.
7. The pull request is merged into `main` without erasing the meaningful commit story.

## 4. Active Board

| ID          | Task                                         | Status        | Hard dependencies                 |
| ----------- | -------------------------------------------- | ------------- | --------------------------------- |
| `REPO-001`  | Initialize pnpm monorepo                     | `DONE`        | Approved plan                     |
| `DOC-001`   | Install approved documentation               | `IN PROGRESS` | `REPO-001`                        |
| `CI-001`    | Add foundation pull-request quality workflow | `READY`       | `REPO-001`                        |
| `REPO-002`  | Add contribution and commit controls         | `BACKLOG`     | `CI-001`                          |
| `FOUND-001` | Scaffold React and NestJS applications       | `BACKLOG`     | `CI-001`                          |
| `FOUND-002` | Add initial Prisma schema and migration      | `BACKLOG`     | `FOUND-001`, approved data model  |
| `FOUND-003` | Add one-command Compose startup              | `BACKLOG`     | `FOUND-001`, `FOUND-002`          |
| `FOUND-004` | Add configuration validation                 | `DONE`        | `FOUND-003`                       |
| `AUTH-001`  | Add registration                             | `DONE`        | `FOUND-002` through `FOUND-004`   |
| `AUTH-002`  | Add login and session restoration            | `BACKLOG`     | `AUTH-001`                        |
| `AUTH-003`  | Add logout                                   | `BACKLOG`     | `AUTH-002`                        |
| `AUTH-004`  | Prove cross-user isolation                   | `BACKLOG`     | `AUTH-002`, protected modules     |
| `HAB-001`   | Add habit creation and listing               | `BACKLOG`     | Authentication slice              |
| `HAB-002`   | Add rename, archive, and restore lifecycle   | `BACKLOG`     | `HAB-001`                         |
| `TRACK-001` | Add same-day build completion                | `BACKLOG`     | `HAB-001`                         |
| `TRACK-002` | Calculate build streaks                      | `BACKLOG`     | `TRACK-001`                       |
| `TRACK-003` | Calculate weekly build statistics            | `BACKLOG`     | `TRACK-001`                       |
| `TRACK-004` | Add same-day relapse recording               | `BACKLOG`     | `HAB-001`                         |
| `TRACK-005` | Calculate clean streaks                      | `BACKLOG`     | `TRACK-004`                       |
| `TRACK-006` | Harden clock and timezone boundaries         | `BACKLOG`     | `TRACK-001` through `TRACK-005`   |
| `GOAL-001`  | Add streak-based goals                       | `BACKLOG`     | `TRACK-002`, `TRACK-005`          |
| `GOAL-002`  | Add goal editing and removal                 | `BACKLOG`     | `GOAL-001`                        |
| `GOAL-003`  | Preserve completed achievements              | `BACKLOG`     | `GOAL-001`                        |
| `UX-001`    | Establish the visual system                  | `BACKLOG`     | `FOUND-001`                       |
| `UX-002`    | Complete dashboard composition               | `BACKLOG`     | Habits, tracking, and goals       |
| `UX-003`    | Refine language and relapse experience       | `BACKLOG`     | `UX-002`                          |
| `QA-001`    | Complete domain and time-boundary  tests      | `BACKLOG`     | Tracking policies                 |
| `QA-002`    | Complete API integration tests               | `BACKLOG`     | Auth through goals                |
| `QA-003`    | Add Playwright critical journeys             | `BACKLOG`     | Stable M6 Compose application     |
| `SEC-001`   | Apply MVP security baseline                  | `BACKLOG`     | Authentication and API foundation |
| `CI-002`    | Add integration and container verification   | `BACKLOG`     | `FOUND-003`, `QA-002`, `QA-003`   |
| `DOC-002`   | Complete reviewer README                     | `BACKLOG`     | Stable commands and features      |
| `DOC-003`   | Complete agentic-development record          | `BACKLOG`     | Maintained throughout delivery    |
| `SUB-001`   | Verify private repository                    | `BLOCKED`     | Explicit external verification    |
| `SUB-002`   | Invite reviewer                              | `BLOCKED`     | Exact reviewer identity           |
| `SUB-003`   | Run fresh-clone rehearsal                    | `BACKLOG`     | Release candidate                 |
| `SUB-004`   | Run final audit                              | `BACKLOG`     | Release candidate                 |

## 5. Immediate Sequence

### DOC-001: Documentation foundation

Deliverables:

- `docs/MVP.md`
- `docs/architecture.md`
- `docs/development-plan.md`
- `docs/data-model.md`
- `docs/task-breakdown.md`
- Initial decision records where a durable tradeoff needs one

Acceptance:

- Approved source content is preserved.
- Encoding is valid UTF-8.
- Terminology and stack choices agree across documents.
- The exact Compose filename is always `compose.yml`.
- No private local filesystem paths appear.

Intended commit:

```text
docs: add project planning and architecture documents
```

### CI-001: Foundation CI

Deliverable: `.github/workflows/quality.yml`.

The workflow must use:

- GitHub Actions.
- Node.js 24.
- pnpm 10.13.1.
- Frozen lockfile installation.
- Dependency caching.
- Read-only repository permissions.
- Concurrency cancellation for superseded branch runs.
- A bounded job timeout.

Required commands:

```text
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Acceptance:

- Pushes and pull requests run the workflow.
- All root quality commands report independently.
- A failing command blocks the workflow.
- Later workspaces are picked up without redesigning the workflow.
- Database, Compose, browser, and scanning jobs are explicitly deferred to `CI-002`.

Intended commit:

```text
ci: add foundation quality workflow
```

### FOUND-001: Application scaffold

Deliverables:

- `apps/web` using React and Vite.
- `apps/api` using NestJS and the Express adapter.
- React application shell.
- NestJS health endpoint.
- Workspace-level lint, type-check, test, and build commands.

Acceptance:

- Both applications build from root commands.
- CI-001 executes both workspaces.
- No placeholder UI is described as a finished feature.

## 6. Vertical-Slice Sequence

After the foundation, deliver user value in this order:

```text
Authentication
  -> habit creation and ownership
  -> daily build and quit tracking
  -> streak and weekly progress
  -> goals
  -> integrated UX
  -> hardening and submission
```

### Authentication slice

- Registration normalizes email, hashes passwords with Argon2id, stores timezone, and creates a session.
- Login verifies credentials and restores an opaque database-backed session.
- Logout revokes the session.
- Cross-user authorization tests prove ownership isolation.

### Habit slice

- Create and list owned build and quit habits.
- Keep habit type immutable.
- Rename, archive, and restore habits without deleting history.
- Preserve active tracking periods for eligibility calculations.

### Tracking slice

Two paths may be developed separately after `HAB-001`:

```text
TRACK-001 -> TRACK-002 -> TRACK-003
TRACK-004 -> TRACK-005
```

Both paths must enforce same-day-only mutation using the backend-derived local date.

### Goal slice

- Create one active consecutive-day goal per habit.
- Derive progress from the relevant streak.
- Allow editing or removing only active goals.
- Record completion permanently and atomically.

## 7. CI Evolution

CI is deliberately split instead of postponed:

| Workflow | Added                                        | Responsibility                                                                |
| -------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| `CI-001` | Immediately after repository setup           | Install, format, lint, type-check, unit test, build                           |
| `CI-002` | After Compose and integrated tests stabilize | MySQL, migrations, API integration, Compose smoke, Playwright, container scan |

Local Docker Compose remains the reviewer-facing source of truth. CI supports it but does not replace the required root `docker compose up` workflow.

## 8. Critical Path

```text
REPO-001
  -> CI-001
  -> FOUND-001
  -> FOUND-002
  -> FOUND-003
  -> FOUND-004
  -> AUTH
  -> HABITS
  -> TRACKING
  -> GOALS
  -> QA and SECURITY
  -> CI-002
  -> SUBMISSION
```

`DOC-001` can proceed beside `CI-001`, but both must finish before the foundation milestone closes.

## 9. Verification Gate

Before moving to the next task:

```text
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

Run additional database, Compose, API, or browser checks whenever the active task introduces those surfaces.

## 10. External Blockers

- Reviewer invitation requires the exact identity supplied in the submission email.
- Repository visibility must be verified before invitation.
- External pushes, invitations, or visibility changes require explicit developer action.
- No deadline is assumed; task sizes express relative complexity only.
