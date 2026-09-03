import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '../../shared/components/Button';
import { EmptyState } from '../../shared/components/EmptyState';
import { SectionHeader } from '../../shared/components/SectionHeader';
import { HabitRow } from './HabitRow';
import type { Habit, HabitType } from './habit.types';

type PanelStatus = 'error' | 'loading' | 'ready';

async function fetchHabits(signal?: AbortSignal): Promise<Habit[]> {
  const response = await fetch('/api/habits', { credentials: 'include', signal });
  if (!response.ok) throw new Error('Unable to load your habits.');
  return response.json();
}

interface HabitsPanelProps {
  onProgressChange: () => void;
}

export function HabitsPanel({ onProgressChange }: HabitsPanelProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [status, setStatus] = useState<PanelStatus>('loading');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingPending, setIsCreatingPending] = useState(false);
  const [pendingHabitId, setPendingHabitId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('BUILD');

  async function refreshHabits(): Promise<void> {
    try {
      setHabits(await fetchHabits());
      setStatus('ready');
      setError('');
    } catch {
      setStatus('error');
      setError('Your habits could not be loaded. Try again.');
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    void fetchHabits(controller.signal)
      .then((result) => {
        setHabits(result);
        setStatus('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStatus('error');
          setError('Your habits could not be loaded. Try again.');
        }
      });

    return () => controller.abort();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!name.trim()) return;

    setIsCreatingPending(true);
    setError('');

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type }),
      });
      if (!response.ok) throw new Error();

      const habit = await response.json();
      setHabits((current) => [
        ...current,
        {
          ...habit,
          streak: 0,
          completedToday: false,
          relapsedToday: false,
          weekly: null,
        },
      ]);
      setName('');
      setIsCreating(false);
    } catch {
      setError('The habit could not be created. Check the details and try again.');
    } finally {
      setIsCreatingPending(false);
    }
  }

  async function renameHabit(habitId: string, nextName: string): Promise<boolean> {
    if (!nextName.trim()) return false;
    setPendingHabitId(habitId);
    setError('');

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nextName }),
      });
      if (!response.ok) throw new Error();

      const habit = await response.json();
      setHabits((current) =>
        current.map((item) => (item.id === habitId ? { ...item, name: habit.name } : item)),
      );
      return true;
    } catch {
      setError('The habit could not be renamed. Try again.');
      return false;
    } finally {
      setPendingHabitId(null);
    }
  }

  async function archiveHabit(habitId: string): Promise<void> {
    setPendingHabitId(habitId);
    setError('');

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error();
      setHabits((current) => current.filter((item) => item.id !== habitId));
    } catch {
      setError('The habit could not be archived. Try again.');
    } finally {
      setPendingHabitId(null);
    }
  }

  async function toggleToday(habit: Habit): Promise<void> {
    setPendingHabitId(habit.id);
    setError('');

    try {
      const markedToday = habit.type === 'BUILD' ? habit.completedToday : habit.relapsedToday;
      const response = await fetch(`/api/habits/${habit.id}/today`, {
        method: markedToday ? 'DELETE' : 'PUT',
        credentials: 'include',
      });
      if (!response.ok) throw new Error();
      await refreshHabits();
      onProgressChange();
    } catch {
      setError('Today’s update could not be saved. Try again.');
    } finally {
      setPendingHabitId(null);
    }
  }

  return (
    <section className="habits-panel" aria-labelledby="habits-heading">
      <SectionHeader
        action={
          <Button
            type="button"
            variant="quiet"
            onClick={() => setIsCreating((current) => !current)}
          >
            {isCreating ? 'Close' : 'Add habit'}
          </Button>
        }
        description="Record today once. Your history stays truthful."
        headingId="habits-heading"
        title="Your habits"
      />

      {isCreating ? (
        <form className="create-form" onSubmit={(event) => void submit(event)}>
          <input
            aria-label="Habit name"
            autoFocus
            maxLength={100}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Read for 20 minutes"
          />
          <select
            aria-label="Habit type"
            value={type}
            onChange={(event) => setType(event.target.value as HabitType)}
          >
            <option value="BUILD">Build</option>
            <option value="QUIT">Quit</option>
          </select>
          <Button disabled={isCreatingPending} type="submit">
            {isCreatingPending ? 'Adding…' : 'Add habit'}
          </Button>
        </form>
      ) : null}

      {error ? (
        <p role="alert" className="section-alert">
          {error}
        </p>
      ) : null}

      {status === 'loading' ? <p className="section-feedback">Loading habits…</p> : null}
      {status === 'error' ? (
        <div className="section-feedback">
          <Button type="button" variant="quiet" onClick={() => void refreshHabits()}>
            Try again
          </Button>
        </div>
      ) : null}
      {status === 'ready' && habits.length === 0 ? (
        <EmptyState
          description="Add one small action you want to practise or leave behind."
          title="No habits yet"
        />
      ) : null}
      {status === 'ready' && habits.length > 0 ? (
        <ul className="habit-list">
          {habits.map((habit) => (
            <HabitRow
              habit={habit}
              isPending={pendingHabitId === habit.id}
              key={habit.id}
              onArchive={archiveHabit}
              onRename={renameHabit}
              onToggleToday={toggleToday}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
