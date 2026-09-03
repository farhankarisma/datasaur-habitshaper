import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '../../shared/components/Button';
import { EmptyState } from '../../shared/components/EmptyState';
import { SectionHeader } from '../../shared/components/SectionHeader';
import type { GoalHabit, GoalsOverview } from './goal.types';
import { GoalRow } from './GoalRow';

type PanelStatus = 'error' | 'loading' | 'ready';

interface GoalsData {
  habits: GoalHabit[];
  overview: GoalsOverview;
}

async function fetchGoalsData(signal?: AbortSignal): Promise<GoalsData> {
  const [goalsResponse, habitsResponse] = await Promise.all([
    fetch('/api/goals', { credentials: 'include', signal }),
    fetch('/api/habits', { credentials: 'include', signal }),
  ]);

  if (!goalsResponse.ok || !habitsResponse.ok) throw new Error();

  return {
    overview: await goalsResponse.json(),
    habits: await habitsResponse.json(),
  };
}

interface GoalsPanelProps {
  refreshKey: number;
}

export function GoalsPanel({ refreshKey }: GoalsPanelProps) {
  const [overview, setOverview] = useState<GoalsOverview>({ active: [], achievements: [] });
  const [habits, setHabits] = useState<GoalHabit[]>([]);
  const [status, setStatus] = useState<PanelStatus>('loading');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [pendingGoalId, setPendingGoalId] = useState<string | null>(null);
  const [isCreatingPending, setIsCreatingPending] = useState(false);
  const [habitId, setHabitId] = useState('');
  const [targetDays, setTargetDays] = useState('30');

  async function refreshGoals(): Promise<void> {
    try {
      const result = await fetchGoalsData();
      setOverview(result.overview);
      setHabits(result.habits);
      setStatus('ready');
      setError('');
    } catch {
      setStatus('error');
      setError('Your goals could not be loaded. Try again.');
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    void fetchGoalsData(controller.signal)
      .then((result) => {
        setOverview(result.overview);
        setHabits(result.habits);
        setStatus('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStatus('error');
          setError('Your goals could not be loaded. Try again.');
        }
      });

    return () => controller.abort();
  }, [refreshKey]);

  const eligibleHabits = habits.filter(
    (habit) => !overview.active.some((goal) => goal.habit.id === habit.id),
  );

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsCreatingPending(true);
    setError('');

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, targetDays: Number(targetDays) }),
      });
      if (!response.ok) throw new Error();

      setHabitId('');
      setTargetDays('30');
      setIsCreating(false);
      await refreshGoals();
    } catch {
      setError('The goal could not be created. Check the details and try again.');
    } finally {
      setIsCreatingPending(false);
    }
  }

  async function updateGoal(goalId: string, nextTargetDays: number): Promise<boolean> {
    setPendingGoalId(goalId);
    setError('');

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDays: nextTargetDays }),
      });
      if (!response.ok) throw new Error();

      await refreshGoals();
      return true;
    } catch {
      setError('The goal could not be updated. Try again.');
      return false;
    } finally {
      setPendingGoalId(null);
    }
  }

  async function removeGoal(goalId: string): Promise<void> {
    setPendingGoalId(goalId);
    setError('');

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error();
      await refreshGoals();
    } catch {
      setError('The goal could not be removed. Try again.');
    } finally {
      setPendingGoalId(null);
    }
  }

  return (
    <section className="goals-panel" aria-labelledby="goals-heading">
      <SectionHeader
        action={
          eligibleHabits.length > 0 ? (
            <Button
              type="button"
              variant="quiet"
              onClick={() => setIsCreating((current) => !current)}
            >
              {isCreating ? 'Close' : 'New goal'}
            </Button>
          ) : undefined
        }
        description="Consecutive days turn a daily practice into an achievement."
        headingId="goals-heading"
        title="Active goals"
      />

      {isCreating && eligibleHabits.length > 0 ? (
        <form className="create-form" onSubmit={(event) => void submit(event)}>
          <select
            aria-label="Habit for goal"
            required
            value={habitId}
            onChange={(event) => setHabitId(event.target.value)}
          >
            <option value="" disabled>
              Choose a habit
            </option>
            {eligibleHabits.map((habit) => (
              <option key={habit.id} value={habit.id}>
                {habit.name}
              </option>
            ))}
          </select>
          <input
            aria-label="Target days"
            min="1"
            required
            type="number"
            value={targetDays}
            onChange={(event) => setTargetDays(event.target.value)}
          />
          <Button disabled={isCreatingPending} type="submit">
            {isCreatingPending ? 'Saving…' : 'Set goal'}
          </Button>
        </form>
      ) : null}

      {error ? (
        <p role="alert" className="section-alert">
          {error}
        </p>
      ) : null}

      {status === 'loading' ? <p className="section-feedback">Loading goals…</p> : null}
      {status === 'error' ? (
        <div className="section-feedback">
          <Button type="button" variant="quiet" onClick={() => void refreshGoals()}>
            Try again
          </Button>
        </div>
      ) : null}
      {status === 'ready' && overview.active.length === 0 ? (
        <EmptyState
          description={
            habits.length === 0
              ? 'Create a habit first, then give its streak a destination.'
              : 'Choose a habit and set a consecutive-day target.'
          }
          title="No active goals"
        />
      ) : null}
      {status === 'ready' && overview.active.length > 0 ? (
        <ul className="goal-list">
          {overview.active.map((goal) => (
            <GoalRow
              goal={goal}
              isPending={pendingGoalId === goal.id}
              key={goal.id}
              onRemove={removeGoal}
              onUpdate={updateGoal}
            />
          ))}
        </ul>
      ) : null}

      {overview.achievements.length > 0 ? (
        <section className="achievements-panel" aria-labelledby="achievements-heading">
          <h3 id="achievements-heading">Achievements</h3>
          <ul>
            {overview.achievements.map((achievement) => (
              <li key={achievement.id}>
                <div>
                  <strong>{achievement.habit.name}</strong>
                  <span>{achievement.targetDays} consecutive days</span>
                </div>
                <time dateTime={achievement.achievedAt}>
                  {new Intl.DateTimeFormat('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }).format(new Date(achievement.achievedAt))}
                </time>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
