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

interface Achievement {
  achievedAt: string;
  habit: Habit;
  id: string;
  targetDays: number;
}

interface GoalsOverview {
  achievements: Achievement[];
  active: Goal[];
}

export function GoalsPanel() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitId, setHabitId] = useState('');
  const [targetDays, setTargetDays] = useState('30');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingTargetDays, setEditingTargetDays] = useState('');

  async function loadGoals(): Promise<void> {
    const [goalsResponse, habitsResponse] = await Promise.all([
      fetch('/api/goals', { credentials: 'include' }),
      fetch('/api/habits', { credentials: 'include' }),
    ]);

    const overview: GoalsOverview = goalsResponse.ok
      ? await goalsResponse.json()
      : { active: [], achievements: [] };
    setGoals(overview.active);
    setAchievements(overview.achievements);
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

  async function updateGoal(goalId: string): Promise<void> {
    const response = await fetch(`/api/goals/${goalId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetDays: Number(editingTargetDays) }),
    });

    if (response.ok) {
      setEditingGoalId(null);
      await loadGoals();
    }
  }

  async function removeGoal(goalId: string): Promise<void> {
    const response = await fetch(`/api/goals/${goalId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (response.ok) {
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
              {editingGoalId === goal.id ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void updateGoal(goal.id);
                  }}
                >
                  <input
                    aria-label={`Target days for ${goal.habit.name}`}
                    min="1"
                    required
                    type="number"
                    value={editingTargetDays}
                    onChange={(event) => setEditingTargetDays(event.target.value)}
                  />
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="quiet" onClick={() => setEditingGoalId(null)}>
                    Cancel
                  </Button>
                </form>
              ) : (
                <>
                  <strong>{goal.habit.name}</strong>
                  <span>
                    {goal.currentStreak} / {goal.targetDays} days
                  </span>
                  <Button
                    type="button"
                    variant="quiet"
                    onClick={() => {
                      setEditingGoalId(goal.id);
                      setEditingTargetDays(String(goal.targetDays));
                    }}
                  >
                    Edit
                  </Button>
                  <Button type="button" variant="danger" onClick={() => void removeGoal(goal.id)}>
                    Remove
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {achievements.length > 0 ? (
        <section className="achievements-panel" aria-labelledby="achievements-heading">
          <h3 id="achievements-heading">Achievements</h3>
          <ul>
            {achievements.map((achievement) => (
              <li key={achievement.id}>
                <strong>{achievement.habit.name}</strong>
                <span>{achievement.targetDays} days completed</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
