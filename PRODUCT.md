# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Individual users who want a private daily companion for building positive habits
and reducing unwanted ones. They use it to record today’s outcome, understand
their progress, and stay focused on personal goals.

## Product Purpose

Habit Shaper helps an individual create build and quit habits, record daily
completion or relapse outcomes, follow streaks and weekly completion rates, and
work toward habit-linked goals.

## Positioning

The product treats build and quit habits as distinct daily behaviors: build habits
advance through completion, while quit habits advance through clean days and reset
when a relapse is recorded. Both can support streak-based goals.

## Operating Context

The product is used as a lightweight web application. Each person has their own
email-and-password account, saved IANA timezone, and private habit data. The
backend determines the user’s local calendar day for tracking rules.

## Capabilities and Constraints

- Email/password registration, login, session restoration, and logout.
- Build and quit habits, daily tracking, streaks, weekly statistics, and goals.
- No social, team, coaching, or clinical workflow is in scope for the MVP.
- React frontend, NestJS/Fastify backend, MySQL, and Docker Compose startup.
- The complete application must run with Docker and Docker Compose.

## Brand Commitments

- Product name: Habit Shaper.
- Keep the interface lightweight, simple, and clean.
- Use a minimalist Apple-inspired direction: calm, precise, typography-led, and
  restrained. Do not use Apple assets, branding, or claims.

## Evidence on Hand

- Product requirements: `docs/MVP.md`.
- Architecture and security decisions: `docs/architecture.md` and
  `docs/decision/`.
- Data model: `docs/data-model.md`.
- No logo, photography, testimonials, or external brand assets are provided.

## Product Principles

1. Make today’s next action obvious.
2. Keep personal tracking private and individual.
3. Preserve truthful history rather than rewriting past outcomes.
4. Distinguish building a behavior from avoiding one.
5. Keep the MVP focused and lightweight.
