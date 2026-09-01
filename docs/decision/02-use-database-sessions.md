# ADR 0002: Use Opaque Database-Backed Sessions

- **Status:** Accepted
- **Decision date:** 2026-09-01
- **Owners:** Project developer

## Context

Habit Shaper requires email and password authentication for a same-origin web application.

The application must:

- Restore authenticated sessions.
- Support logout and session revocation.
- Protect personal habit data.
- Remain simple enough for an MVP.
- Run as a modular monolith with MySQL.

## Decision

Use opaque database-backed sessions.

After registration or login:

1. Generate a cryptographically random session token.
2. Store only its SHA-256 hash in MySQL.
3. Send the raw token in a secure, HTTP-only cookie.
4. Resolve each authenticated request through the stored token hash.
5. Revoke the session record during logout.

Passwords are hashed separately using Argon2id.

## Cookie Policy

The production session cookie must use:

- `HttpOnly`
- `Secure`
- `SameSite=Lax`
- A bounded expiration
- The narrowest practical path and domain

Development may disable `Secure` only when running over local HTTP.

## Alternatives Considered

### JWT access tokens

Rejected because the MVP does not need stateless authentication or independently deployed services. Revocation and logout would require additional token-management behavior.

### JWT stored in browser storage

Rejected because browser storage exposes the token to JavaScript and increases the impact of cross-site scripting.

### Third-party authentication provider

Rejected because social login and external identity providers are outside the MVP.

## Consequences

### Positive

- Logout immediately revokes the session.
- Session behavior is easy to inspect and test.
- No authentication token is exposed to frontend JavaScript.
- The design fits the existing MySQL dependency.
- Authorization remains centralized in NestJS guards.

### Negative

- Authentication requires a database lookup.
- Expired and revoked sessions require cleanup.
- Horizontal scaling depends on shared database access.

These costs are acceptable for the MVP.

## Security Invariants

- Never store the raw session token.
- Never log passwords, raw tokens, or cookie values.
- Use constant-time comparison where applicable.
- Return generic errors for invalid credentials.
- Scope protected resources to the authenticated user.
- Rotate the session token after successful authentication.
- Reject expired or revoked sessions.

## Verification

Automated tests must prove:

- Registration creates an authenticated session.
- Valid login creates a new session.
- Invalid credentials do not reveal which field failed.
- Refreshing the browser restores a valid session.
- Logout revokes the session.
- Expired and revoked sessions are rejected.
- Cross-user resource access is rejected.
