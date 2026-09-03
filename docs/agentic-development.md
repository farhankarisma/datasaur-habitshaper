# Agentic Development Record

## Purpose

This document records how coding agents assisted the development of Habit Shaper. It
is a curated account of decisions, implementation work, corrections, and verification;
it is not a raw conversation transcript. The project developer remained responsible
for product decisions, Git operations, external actions, and final acceptance.

## Responsibility split

| Participant | Responsibilities |
| --- | --- |
| Project developer | Defined scope, approved changes, selected technology and UX direction, ran Git operations and deterministic checks, reviewed results, and owned submission. |
| Coding agent (Codex) | Analyzed requirements, proposed task slices, drafted documentation, implemented approved code changes, investigated reported failures, and suggested verification commands. |
| Impeccable design skill | Supplied focused interface guidance used while refining visual hierarchy, typography, interaction language, and responsive behavior. |
| Deterministic tools | Prettier, ESLint/Oxlint, TypeScript, Vitest, Docker Compose, Prisma, and GitHub Actions performed formatting, static analysis, tests, builds, migrations, and runtime checks. |

The coding agent was not permitted to commit, push, merge, create repositories, invite
reviewers, or independently change product scope. Before implementation, the agent
described the intended change and waited for explicit developer approval.

## Development approach

Work was organized as small vertical slices in `docs/development-plan.md` and
`docs/task-breakdown.md`. A typical task followed this loop:

1. The developer selected the next task and clarified priorities.
2. The agent explained the outcome, affected areas, and important tradeoffs.
3. The developer explicitly approved implementation.
4. The agent made a scoped change without performing Git operations.
5. The developer ran deterministic checks and reported failures.
6. The agent diagnosed and fixed the reported root cause.
7. The developer chose the branch, commit, push, and merge workflow.

This kept product authority with the developer while using the agent for implementation
speed and review assistance.

## Representative agent-assisted work

### Product and architecture

- Turned the initial feature list into explicit definitions for build habits, quit
  habits, relapses, streaks, weekly completion, and streak-based goals.
- Drafted the MVP, architecture, data model, development plan, task breakdown, and
  architectural decision records.
- Proposed a modular monolith so the React frontend and NestJS API could remain clear
  without introducing microservice overhead.
- Designed the reviewer-facing Compose flow: MySQL health check, one-shot Prisma
  migration, and application startup after migration succeeds.

### Application implementation

- Scaffolded the pnpm workspace and the React and NestJS applications.
- Implemented registration, login, session restoration, logout, session protection,
  password hashing, and opaque database-backed cookies.
- Implemented habit creation, listing, renaming, archiving, daily completion, relapse,
  undo actions, streak calculations, weekly progress, and timezone-aware dates.
- Implemented goal creation, editing, removal, progress, automatic completion, and
  preserved achievements.
- Refactored the source into feature-oriented frontend and backend boundaries rather
  than accumulating logic in a single component or controller.

### Interface refinement

- Used an open, calm daybook direction rather than a conventional corporate dashboard.
- Added reusable rows, section headings, progress display, loading, empty, error, and
  pending states where they served existing features.
- Replaced an unsatisfactory initial type direction after developer review and bundled
  Newsreader locally to avoid a runtime font dependency.
- Clarified the quit-habit interaction so clean days accumulate automatically and a
  relapse requires an explicit confirmation before resetting the visible clean streak.

### Debugging assistance

- Diagnosed an invalid `await` inside a React state-updater callback and moved response
  parsing outside the synchronous callback.
- Corrected workspace script/filter behavior when an API development command invoked
  the wrong recursive script.
- Explained ESM `.js` import suffixes in TypeScript as runtime-compatible imports for
  compiled Node.js modules.
- Fixed CI failures caused by a generated Prisma client not existing before type-check
  and by a value import that ESLint required to be a type-only import.
- Removed a stale `markedToday` variable reported consistently by lint, TypeScript, and
  the production build.
- Corrected formatting failures in documentation by directing Prettier to format the
  affected file rather than using an LLM as a formatter.

## Human decisions and corrections

The final project was not produced by accepting every agent suggestion. Important
developer decisions included:

- Selecting NestJS because it matched the likely reviewer context, then selecting the
  Fastify adapter for a lighter runtime.
- Moving CI foundation work earlier in the plan so every later slice had automated
  feedback.
- Choosing Zod for runtime boundary and environment validation after discussing its
  negligible impact for this application.
- Rejecting unnecessary Kubernetes, Jenkins, Argo CD, service mesh, and gateway work
  for the required single-machine Compose delivery.
- Preserving completion-rate integrity by limiting daily corrections to today rather
  than allowing broad historical rewriting.
- Requiring both frontend and backend refactoring before adding more features and
  requiring reusable UI components only where they improved real composition.
- Rejecting a generic-looking visual result, choosing the Newsreader typeface, and
  directing the product toward a calm private journal instead of corporate or
  AI-generated dashboard styling.
- Prioritizing the planned phase/task route when agent suggestions drifted toward an
  ad-hoc feature order.
- Retaining full ownership of branch names, commits, pushes, pull requests, merges,
  repository privacy, and reviewer invitation.

These corrections materially shaped the architecture, sequencing, interface, and
submission strategy.

## Verification evidence

Deterministic tools—not language-model judgment—were used to verify the repository.
The project defines these commands:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:db
docker compose up --build
```

During development, reported checkpoints included:

- Prettier reporting that all matched files used the configured style.
- API tests passing 12 test files and 52 tests.
- Frontend tests passing 3 test files and 5 tests.
- Type-check and build failures identifying the same unused React variable, which was
  then removed.
- Compose successfully starting the database, applying Prisma migrations, starting
  the combined application, and exposing `/api/health`.
- GitHub Actions running locked dependency installation, Prisma generation, formatting,
  linting, type-checking, tests, and build on pull requests and pushes to `main`.

These are development checkpoints, not a substitute for the final fresh-clone
rehearsal. The final submission should record the last command results after all files
are committed.

## Evidence hygiene

- No passwords, session tokens, private keys, reviewer details, or real `.env` values
  are included in this document.
- Raw prompts and complete chat transcripts are intentionally excluded; they contain
  noise and may contain machine-specific context.
- Agent suggestions that were rejected are summarized only where they explain a final
  human decision.
- Generated dependencies and build outputs remain excluded by `.gitignore` and
  `.dockerignore`.

## Limitations of this record

- This record was reconciled near submission from the maintained plans, documentation,
  implementation history, and developer-agent task history; it is not a timestamped
  log of every prompt.
- Test counts describe a recorded passing checkpoint and may change as tests are added.
- Repository-hosting actions and reviewer access cannot be verified by the coding
  agent because those actions remain under the developer's external authority.
- Final confidence still depends on the fresh-clone rehearsal and final audit described
  in the submission checklist.

## Outcome

Agent assistance accelerated analysis, documentation, implementation, and debugging,
while explicit approvals and deterministic verification kept the developer in control.
The resulting repository shows both the final application and the reasoning path used
to reach it without treating generated output as automatically correct.
