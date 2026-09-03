import { useEffect, useState, type FormEvent } from 'react';
type HabitType = 'BUILD' | 'QUIT';
interface Habit {
  id: string;
  name: string;
  type: HabitType;
  streak: number;
}
export function HabitsPanel() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('BUILD');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  useEffect(() => {
    void fetch('/api/habits', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then(setHabits);
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
      setHabits((x) => [...x, { ...habit, streak: 0 }]);
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
        <button type="submit">Add habit</button>
      </form>
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
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <span>
                {h.name}{' '}
                <small>
                  {h.type === 'BUILD' ? `${h.streak}-day streak` : `${h.streak} clean days`}
                </small>
              </span>
            )}
            <button
              onClick={async () => {
                await fetch(`/api/habits/${h.id}/today`, { method: 'PUT', credentials: 'include' });
              }}
              type="button"
            >
              {h.type === 'BUILD' ? 'Complete today' : 'I relapsed today'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId(h.id);
                setEditingName(h.name);
              }}
            >
              Rename
            </button>
            <button type="button" onClick={() => void archiveHabit(h.id)}>
              Archive
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
