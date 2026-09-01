# ADR 0001: Use a Modular Monolith

- **Status:** Accepted
- **Decision date:** 2026-09-01
- **Owners:** Project developer

## Context

Habit Shaper is a coding-test MVP developed by one primary developer. It requires a React frontend, NestJS backend, MySQL database, and one-command Docker Compose startup.

The product contains authentication, habits, tracking, progress, and goals. These areas need clear internal boundaries, but the requirements do not demonstrate a need for independent deployment, scaling, or team ownership.

## Decision

Implement Habit Shaper as a modular monolith.

The application uses one deployable application image containing:

- A React single-page application.
- A NestJS REST API.
- Prisma database access and migration tooling.

NestJS modules preserve internal boundaries for authentication, users, habits, tracking, goals, and health.

MySQL remains a separate Compose service because it is an independent runtime dependency.

## Alternatives Considered

### Microservices

Rejected because they would add service discovery, distributed transactions, deployment coordination, network failure handling, and operational overhead without an evidenced MVP requirement.

### Separate frontend and backend deployment containers

Rejected for the reviewer-facing runtime because it increases Compose complexity without improving the required product behavior. Development tooling may still run frontend and backend processes separately.

### Unstructured monolith

Rejected because mixing controllers, persistence, and business rules would weaken readability and testability.

## Consequences

### Positive

- Simple one-command startup.
- Fewer deployment and networking concerns.
- Transactions remain inside one backend process and database.
- Internal modules remain independently testable.
- The architecture is easy for a reviewer to inspect.

### Negative

- Frontend and backend are released together.
- Independent scaling is unavailable.
- Module boundaries require discipline because they are not enforced by network boundaries.

## Verification

The decision remains valid while:

- One primary developer owns the application.
- No module requires independent scaling or deployment.
- Cross-module transactions remain common.
- Docker Compose remains the required deployment path.

Revisit this decision only when measured operational or organizational needs justify a service boundary.
