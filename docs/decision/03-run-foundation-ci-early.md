# ADR 0004: Run Foundation CI Early

- **Status:** Accepted
- **Decision date:** 2026-09-01
- **Owners:** Project developer

## Context

The original delivery plan placed continuous integration near the final hardening phase.

That would allow formatting, linting, type, test, and build failures to accumulate across multiple pull requests before an automated quality gate existed.

However, database integration, Docker Compose, Playwright, and container scanning cannot run meaningfully before their supporting infrastructure has been implemented.

## Decision

Introduce continuous integration in two stages.

### CI-001: Foundation quality workflow

Add immediately after repository initialization.

It runs:

```text
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
