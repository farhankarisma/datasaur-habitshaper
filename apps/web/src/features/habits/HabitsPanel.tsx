import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '../../shared/components/Button';
import { EmptyState } from '../../shared/components/EmptyState';
type HabitType = 'BUILD' | 'QUIT';
interface Habit {
  id: string;
  name: string;
  type: HabitType;
  streak: number;
  completedToday: boolean;
  relapsedToday: boolean;
  weekly: {
    eligibleDays: number;
    completedDays: number;
    missedDays: number;
    percent: number;
  } | null;
}
export function HabitsPanel() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('BUILD');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  async function loadHabits() {
    await fetch('/api/habits', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then(setHabits);
  }
  useEffect(() => {
    void loadHabits();
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    const r = await fetch('/api/habits', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type }),
    });
    if (r.ok) {
      const habit = await r.json();
      setHabits((x) => [
        ...x,
        {
          ...habit,
          streak: 0,
          completedToday: false,
          relapsedToday: false,
          weekly: null,
        },
      ]);
      setName('');
    }
  }
  async function renameHabit(habitId: string) {
    const response = await fetch(`/api/habits/${habitId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName }),
    });
    if (response.ok) {
      const habit = await response.json();
      setHabits((current) =>
        current.map((item) => (item.id === habitId ? { ...item, name: habit.name } : item)),
      );
      setEditingId(null);
    }
  }
  async function archiveHabit(habitId: string) {
    const response = await fetch(`/api/habits/${habitId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (response.ok) {
      setHabits((current) => current.filter((item) => item.id !== habitId));
    }
  }
  return (
    <section className="habits-panel">
      <h2>Your habits</h2>
      <form onSubmit={submit}>
        <input
          aria-label="Habit name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Read for 20 minutes"
        />
        <select
          aria-label="Habit type"
          value={type}
          onChange={(e) => setType(e.target.value as HabitType)}
        >
          <option value="BUILD">Build</option>
          <option value="QUIT">Quit</option>
        </select>
        <Button type="submit">Add habit</Button>
      </form>
      {habits.length === 0 ? (
        <EmptyState
          description="Add one small action you want to practise or leave behind."
          title="No habits yet"
        />
      ) : (
        <ul>
          {habits.map((h) => (
            <li key={h.id}>
              {editingId === h.id ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void renameHabit(h.id);
                  }}
                >
                  <input
                    aria-label={`Rename ${h.name}`}
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                  />
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="quiet" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </form>
              ) : (
                <span>
                  {h.name}{' '}
                  <small>
                    {h.type === 'BUILD' ? `${h.streak}-day streak` : `${h.streak} clean days`}
                  </small>
                  {h.weekly ? (
                    <small>
                      {' '}
                      This week: {h.weekly.completedDays}/{h.weekly.eligibleDays} complete ·{' '}
                      {h.weekly.missedDays} missed · {h.weekly.percent}%
                    </small>
                  ) : null}
                </span>
              )}
              <Button
                onClick={() => {
                  const markedToday = h.type === 'BUILD' ? h.completedToday : h.relapsedToday;
                  const method = markedToday ? 'DELETE' : 'PUT';
                  void fetch(`/api/habits/${h.id}/today`, {
                    method,
                    credentials: 'include',
                  }).then((response) => {
                    if (response.ok) void loadHabits();
                  });
                }}
                type="button"
              >
                {h.type === 'BUILD'
                  ? h.completedToday
                    ? 'Undo today'
                    : 'Complete today'
                  : h.relapsedToday
                    ? 'Undo relapse'
                    : 'I relapsed today'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setEditingId(h.id);
                  setEditingName(h.name);
                }}
              >
                Rename
              </Button>
              <Button type="button" variant="danger" onClick={() => void archiveHabit(h.id)}>
                Archive
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
