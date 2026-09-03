import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '../../shared/components/Button';
import { EmptyState } from '../../shared/components/EmptyState';

interface Habit {
  id: string;
  name: string;
  type: 'BUILD' | 'QUIT';
}

interface Goal {
  currentStreak: number;
  habit: Habit;
  id: string;
  targetDays: number;
}

export function GoalsPanel() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitId, setHabitId] = useState('');
  const [targetDays, setTargetDays] = useState('30');

  async function loadGoals(): Promise<void> {
    const [goalsResponse, habitsResponse] = await Promise.all([
      fetch('/api/goals', { credentials: 'include' }),
      fetch('/api/habits', { credentials: 'include' }),
    ]);

    setGoals(goalsResponse.ok ? await goalsResponse.json() : []);
    setHabits(habitsResponse.ok ? await habitsResponse.json() : []);
  }

  useEffect(() => {
    void loadGoals();
  }, []);

  const eligibleHabits = habits.filter(
    (habit) => !goals.some((goal) => goal.habit.id === habit.id),
  );

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const response = await fetch('/api/goals', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitId, targetDays: Number(targetDays) }),
    });

    if (response.ok) {
      setHabitId('');
      setTargetDays('30');
      await loadGoals();
    }
  }

  return (
    <section className="goals-panel">
      <h2>Goals</h2>
      {eligibleHabits.length > 0 ? (
        <form onSubmit={(event) => void submit(event)}>
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
          <Button type="submit">Set goal</Button>
        </form>
      ) : null}

      {goals.length === 0 ? (
        <EmptyState
          description="Choose a habit and set a consecutive-day target."
          title="No active goals"
        />
      ) : (
        <ul>
          {goals.map((goal) => (
            <li key={goal.id}>
              <strong>{goal.habit.name}</strong>
              <span>
                {goal.currentStreak} / {goal.targetDays} days
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
