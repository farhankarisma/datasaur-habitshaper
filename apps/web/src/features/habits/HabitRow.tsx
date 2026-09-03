import { useState, type FormEvent } from 'react';

import { Button } from '../../shared/components/Button';
import type { Habit } from './habit.types';
import { WeeklyProgress } from './WeeklyProgress';

interface HabitRowProps {
  habit: Habit;
  isPending: boolean;
  onArchive: (habitId: string) => Promise<void>;
  onRename: (habitId: string, name: string) => Promise<boolean>;
  onToggleToday: (habit: Habit) => Promise<void>;
}

export function HabitRow({ habit, isPending, onArchive, onRename, onToggleToday }: HabitRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(habit.name);

  async function submitRename(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (await onRename(habit.id, draftName)) setIsEditing(false);
  }

  return (
    <li className="habit-row">
      {isEditing ? (
        <form className="row-edit-form" onSubmit={(event) => void submitRename(event)}>
          <input
            aria-label={`Rename ${habit.name}`}
            autoFocus
            maxLength={100}
            required
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
          />
          <Button disabled={isPending} type="submit">
            Save
          </Button>
          <Button
            disabled={isPending}
            type="button"
            variant="quiet"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <>
          <div className="habit-row__primary">
            <div className="habit-row__identity">
              <strong>{habit.name}</strong>
              <span className="habit-row__meta">
                {habit.type === 'BUILD' ? 'Build' : 'Quit'} ·{' '}
                {habit.type === 'BUILD'
                  ? `${habit.streak}-day streak`
                  : `${habit.streak} clean days`}
              </span>
            </div>

            {habit.type === 'BUILD' ? (
              <button
                aria-label={
                  habit.completedToday
                    ? `Undo ${habit.name} for today`
                    : `Complete ${habit.name} for today`
                }
                aria-pressed={habit.completedToday}
                className={`habit-check${habit.completedToday ? ' habit-check--complete' : ''}`}
                disabled={isPending}
                onClick={() => void onToggleToday(habit)}
                type="button"
              >
                {habit.completedToday ? (
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="m6.5 12.5 3.5 3.5 7.5-8" />
                  </svg>
                ) : null}
              </button>
            ) : (
              <Button
                aria-pressed={habit.relapsedToday}
                className="relapse-action"
                disabled={isPending}
                onClick={() => void onToggleToday(habit)}
                type="button"
                variant="quiet"
              >
                {habit.relapsedToday ? 'Relapse recorded · Undo' : 'Record relapse'}
              </Button>
            )}
          </div>

          {habit.weekly ? <WeeklyProgress progress={habit.weekly} /> : null}

          <div className="row-actions">
            <Button
              disabled={isPending}
              type="button"
              variant="quiet"
              onClick={() => {
                setDraftName(habit.name);
                setIsEditing(true);
              }}
            >
              Rename
            </Button>
            <Button
              disabled={isPending}
              type="button"
              variant="danger"
              onClick={() => void onArchive(habit.id)}
            >
              Archive
            </Button>
          </div>
        </>
      )}
    </li>
  );
}
