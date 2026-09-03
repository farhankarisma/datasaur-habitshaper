# Habit Shaper

## Run with Docker

Docker and Docker Compose are the only prerequisites.

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Open <http://localhost:3000>. The database schema is migrated automatically before
the application starts.

Stop the application with `docker compose down`. Add `--volumes` only when you
intentionally want to delete the local database data.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL connection URL used by the API and Prisma. Must begin with `mysql://`. |
| `NODE_ENV` | No | API mode: `development`, `test`, or `production`. Defaults to `development`. |
| `PORT` | No | API listening port. Defaults to `3000`. |
| `APP_HOST_PORT` | No | Host port published by Docker Compose. Defaults to `3000`. |
| `MYSQL_DATABASE` | No | Main Compose database name. |
| `MYSQL_SHADOW_DATABASE` | No | Shadow database used by Prisma development migrations. |
| `MYSQL_USER` | No | Compose database user. |
| `MYSQL_PASSWORD` | No | Compose database user password. |
| `MYSQL_ROOT_PASSWORD` | No | Compose MySQL root password. |
| `MYSQL_HOST_PORT` | No | MySQL port exposed to host-side tools. |
| `SHADOW_DATABASE_URL` | Development only | Shadow database URL for `prisma migrate dev`. |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` | Tests only | Connection values used by database integration tests. |

Docker Compose supplies safe development defaults. Copy `.env.example` when you
want to override them; never commit the resulting `.env` file or real secrets.

## Registration API

`POST /api/auth/register` accepts JSON containing `email`, `password`, and an IANA
`timezone`. A successful request returns only the public user fields and creates an
opaque database-backed session in an `HttpOnly` cookie. Passwords and raw session
tokens are never returned or stored in plaintext.
