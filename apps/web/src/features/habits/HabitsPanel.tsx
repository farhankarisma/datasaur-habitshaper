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
            <span>
              {h.name}{' '}
              <small>
                {h.type === 'BUILD' ? `${h.streak}-day streak` : `${h.streak} clean days`}
              </small>
            </span>
            <button
              onClick={async () => {
                await fetch(`/api/habits/${h.id}/today`, { method: 'PUT', credentials: 'include' });
              }}
              type="button"
            >
              {h.type === 'BUILD' ? 'Complete today' : 'I relapsed today'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
