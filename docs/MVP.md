# Habit Shaper MVP

## 1. Product Definition

Habit Shaper is a lightweight web application that helps authenticated users:

- Build positive habits by recording daily completion.
- Quit unwanted habits by recording relapses and tracking clean streaks.
- Set measurable consecutive-day goals linked to their habits.

The primary product loop is:

```text
Register or log in -> create a habit -> record today's outcome -> view streak and progress
```

## 2. Terminology

| Term         | Meaning                                               | Example                       |
| ------------ | ----------------------------------------------------- | ----------------------------- |
| Build habit  | A positive behavior the user wants to perform daily   | Read every day                |
| Quit habit   | An unwanted behavior the user wants to stop           | Stop smoking                  |
| Completion   | The user performed a build habit today                | The user read today           |
| Relapse      | The user performed an unwanted behavior again         | The user smoked today         |
| Streak       | Consecutive days on which a build habit was completed | Five consecutive reading days |
| Clean streak | Consecutive days without a relapse                    | Seven smoke-free days         |
| Goal         | A consecutive-day target linked to one habit          | Read for 30 consecutive days  |

The interface should use **Build a positive habit** and **Quit an unwanted habit**. The internal type values may remain `BUILD` and `BREAK`.

## 3. Global Product Rules

### 3.1 Ownership and access

- Every habit, completion, relapse, and goal belongs to one authenticated user.
- A user must never be able to read or modify another user's data.
- All reads and writes must be scoped by the authenticated user's ID.

### 3.2 Calendar days and timezones

- Daily outcomes are based on the user's saved timezone.
- The backend determines the user's current local date. It must not trust a client-supplied date as proof that a day is editable.
- Exact event timestamps are stored in UTC.
- Historical completion and relapse dates remain unchanged if the user later changes timezone.

### 3.3 Historical integrity

- Users may record or undo an outcome only during the current local day.
- Past days are permanently locked after local midnight.
- Future dates cannot be recorded.
- Dates before a habit's start date cannot be recorded.
- Offline or late synchronization is outside the MVP.

These rules ensure that streaks and completion rates represent what the user recorded on the relevant day rather than a history reconstructed later.

## 4. Authentication

### 4.1 Required behavior

- Register with email and password.
- Log in with email and password.
- Log out.
- No email verification is required.
- Email addresses are normalized and unique.
- Passwords are securely hashed and never stored or logged in plaintext.
- Protected application and API routes require authentication.

## 5. Habit Building

### 5.1 Create a build habit

A build habit contains:

- Name
- Type: `BUILD`
- Start date
- Owner/user ID
- Status: active or archived
- Created and updated timestamps

Rules:

- The name is required and trimmed.
- Build habits are daily; custom schedules are outside the MVP.
- The start date is the first eligible tracking date.
- The habit type becomes immutable after creation.
- Duplicate names are allowed.
- A habit can be renamed or archived without losing its history.

### 5.2 Record daily completion

- An active build habit can be marked complete for the current local day.
- Today's completion can be undone before local midnight.
- There can be at most one completion record per habit and local date.
- Recording completion is idempotent.
- The database must enforce uniqueness for `(habit_id, completion_date)`.

Each completion stores at least:

- Habit ID
- Local completion date
- UTC creation timestamp

### 5.3 Current streak

A build streak is a sequence of consecutive completed eligible dates.

Calculation:

1. If today is complete, count backward starting from today.
2. If today is not yet complete, count backward starting from yesterday because today is not missed until it ends.
3. Stop at the first incomplete eligible date or the habit's start date.

Example:

```text
Monday    completed
Tuesday   completed
Wednesday missed
Thursday  completed

Current streak on Thursday: 1 day
```

The MVP requires the current streak. A longest-streak statistic is optional and not required for acceptance.

### 5.4 Weekly completion

- Calendar weeks run from Monday through Sunday.
- Only eligible elapsed days are included.
- Days before the habit's start date are excluded.
- Future days in the current week are excluded and must not appear as missed.

Calculations:

```text
missedDays = eligibleDays - completedDays
completionRate = completedDays / eligibleDays * 100
```

Example on Wednesday:

```text
Monday     completed
Tuesday    missed
Wednesday  completed
Thursday-Sunday excluded because they are in the future

Completed: 2 of 3
Missed: 1
Completion rate: 66.7%
```

### 5.5 Minimum build-habit interface

Each build-habit card displays:

- Habit name
- Current streak
- Current week's completed, eligible, and missed day counts
- Current week's completion percentage
- A control to mark today complete or undo today's completion

## 6. Habit Quitting

### 6.1 Create a quit habit

A quit habit contains:

- Name
- Type: `BREAK`
- Start date
- Owner/user ID
- Status: active or archived
- Created and updated timestamps

Rules:

- The start date is the first intended clean day.
- The habit type becomes immutable after creation.
- A habit can be renamed or archived without losing its history.

### 6.2 Record a relapse

- A clean streak advances automatically while no relapse is recorded.
- The user records a relapse only for the current local day.
- Today's relapse can be undone before local midnight.
- Recording a relapse immediately resets the current clean streak to zero.
- There can be at most one relapse record per habit and local date.
- Recording a relapse is idempotent.
- The database must enforce uniqueness for `(habit_id, relapse_date)`.

Each relapse stores at least:

- Habit ID
- Local relapse date
- UTC creation timestamp

All relapse events are preserved so that streaks can be derived from history rather than maintained as a mutable counter.

### 6.3 Clean-streak calculation

If no relapse has occurred:

```text
currentCleanStreak = today - startDate + 1
```

If a relapse has occurred:

```text
currentCleanStreak = today - mostRecentRelapseDate
```

Therefore:

- On the relapse date, the clean streak is `0`.
- On the following clean day, it is `1`.
- On the next clean day, it is `2`.

Example:

```text
Monday     clean day 1
Tuesday    clean day 2
Wednesday  relapse; streak 0
Thursday   clean day 1
Friday     clean day 2
```

### 6.4 Minimum quit-habit interface

Each quit-habit card displays:

- Habit name
- Current clean streak
- Start date
- A control to record today's relapse
- An undo control when today's relapse has been recorded

The interface should use neutral, supportive language. A relapse is treated as information rather than punishment.

## 7. Goal Management

### 7.1 Goal definition

An MVP goal is a consecutive-day target linked to exactly one build or quit habit.

Examples:

```text
Build habit: Read
Goal: Complete 30 consecutive days
Progress: 12 / 30 days
```

```text
Quit habit: Smoking
Goal: Remain smoke-free for 30 consecutive days
Progress: 12 / 30 clean days
```

Weekly, percentage-based, and custom-frequency goals are outside the MVP.

### 7.2 Goal data and rules

A goal contains:

- Owner/user ID
- Linked habit ID
- Positive integer target in days
- Status: active or completed
- Created and updated timestamps
- Completion timestamp when achieved

Rules:

- A user can add, edit, and remove a goal.
- Only one active goal is allowed per habit.
- Goal progress is derived automatically from the linked habit's current streak.
- Users cannot manually edit goal progress.
- Missing a build habit resets progress toward an unfinished build goal.
- Recording a relapse resets progress toward an unfinished quit goal.
- Reaching the target marks the goal completed and records its completion time.
- A completed goal remains completed even if the habit's current streak later resets.
- Only active goals can have their target edited.
- After completing a goal, the user can create a new goal for the same habit.

### 7.3 Minimum goal interface

- Create a goal by selecting one eligible habit and entering a target number of consecutive days.
- Show current progress as `current streak / target days`.
- Allow editing the target while the goal is active.
- Allow removal of an active goal.
- Clearly display completed goals as achievements.

## 8. Habit Lifecycle

- Active habits continue accumulating daily outcomes and streaks.
- Archiving a habit stops its streak from progressing and preserves its history.
- Restoring an archived habit starts a new tracking period from the restoration date while preserving earlier records.
- Hard deletion is not required for the MVP.
- When a habit is archived, its active goal is paused or hidden until the habit is restored.

## 9. Technical Constraints

- Frontend: React
- Backend: Node.js with TypeScript
- Database: MySQL
- Web-based and responsive
- Simple, clean, lightweight interface
- Entire stack starts from the repository root with:

```bash
docker compose up
```

- The root must contain `compose.yml`.
- Database schema bootstrap through migrations or seed files must run automatically on first boot.
- Running the application requires only Docker and Docker Compose.
- No local Node.js, package manager, or MySQL installation may be required.

## 10. Repository and Documentation Requirements

- Include source code, tests, documentation, configuration, migrations, and relevant development artifacts.
- Exclude `node_modules`, build output, and real secrets.
- Provide `.env.example` with placeholder values.
- Document every required environment variable in `README.md`.
- Document exact startup, shutdown, migration, seed, and test commands.
- Maintain meaningful commits that show how the application was developed.

Repository creation, collaborator invitations, publishing, and other external actions require explicit user authorization and are not performed merely because they appear in the source brief.

## 11. Out of Scope

- Email verification
- Password reset
- Social login
- Reminders and notifications
- Social or community features
- Badges and gamification beyond completed goals
- Native mobile applications
- Custom habit schedules or frequencies
- Retroactive outcome editing
- Offline or late synchronization
- Weekly or percentage-based goals
- Advanced analytics and longest-streak dashboards

## 12. MVP Acceptance Criteria

The MVP is complete when all of the following are true:

1. A user can register, log in, log out, and access only their own data.
2. A user can create and view daily build and quit habits.
3. A user can mark or undo today's build completion, but cannot rewrite a past or future date.
4. Build streaks remain active during an unchecked current day and break after a missed day closes.
5. Weekly build statistics correctly report eligible, completed, and missed days without counting future days.
6. A user can record or undo today's relapse, but cannot rewrite a past or future relapse date.
7. A relapse resets the clean streak to zero, and the next clean day begins at one.
8. Duplicate completion and relapse records are prevented at both application and database levels.
9. Date calculations remain correct around midnight in the user's timezone.
10. A user can add, edit, and remove an active consecutive-day goal linked to one habit.
11. Goal progress is derived from the linked habit's streak and cannot be manually manipulated.
12. Reaching a goal permanently records it as completed.
13. Archiving a habit preserves its outcomes and goal history.
14. The complete system starts successfully with one `docker compose up` command from the repository root.
15. Schema initialization occurs automatically on first boot.
16. The repository contains safe configuration examples and complete startup documentation without real secrets.
