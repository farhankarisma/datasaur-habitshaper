import { useState, type FormEvent } from 'react';

import { Button } from '../../shared/components/Button';
import { ProgressBar } from '../../shared/components/ProgressBar';
import type { Goal } from './goal.types';

interface GoalRowProps {
  goal: Goal;
  isPending: boolean;
  onRemove: (goalId: string) => Promise<void>;
  onUpdate: (goalId: string, targetDays: number) => Promise<boolean>;
}

export function GoalRow({ goal, isPending, onRemove, onUpdate }: GoalRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [targetDays, setTargetDays] = useState(String(goal.targetDays));

  async function submitUpdate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (await onUpdate(goal.id, Number(targetDays))) setIsEditing(false);
  }

  return (
    <li className="goal-row">
      {isEditing ? (
        <form className="row-edit-form" onSubmit={(event) => void submitUpdate(event)}>
          <input
            aria-label={`Target days for ${goal.habit.name}`}
            autoFocus
            min="1"
            required
            type="number"
            value={targetDays}
            onChange={(event) => setTargetDays(event.target.value)}
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
          <div className="goal-row__heading">
            <div>
              <strong>{goal.habit.name}</strong>
              <span>{goal.habit.type === 'BUILD' ? 'Build habit' : 'Quit habit'}</span>
            </div>
            <span className="goal-row__count">
              {goal.currentStreak} / {goal.targetDays}
            </span>
          </div>
          <ProgressBar
            current={goal.currentStreak}
            label={`${goal.habit.name}: ${goal.currentStreak} of ${goal.targetDays} consecutive days`}
            target={goal.targetDays}
          />
          <div className="row-actions">
            <Button
              disabled={isPending}
              type="button"
              variant="quiet"
              onClick={() => {
                setTargetDays(String(goal.targetDays));
                setIsEditing(true);
              }}
            >
              Edit target
            </Button>
            <Button
              disabled={isPending}
              type="button"
              variant="danger"
              onClick={() => void onRemove(goal.id)}
            >
              Remove
            </Button>
          </div>
        </>
      )}
    </li>
  );
}
