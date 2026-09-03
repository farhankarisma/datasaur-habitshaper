import type { WeeklyProgress as WeeklyProgressValue } from './habit.types';

interface WeeklyProgressProps {
  progress: WeeklyProgressValue;
}

export function WeeklyProgress({ progress }: WeeklyProgressProps) {
  const remainingDays = Math.max(7 - progress.eligibleDays, 0);
  const markers = [
    ...Array<string>(progress.completedDays).fill('complete'),
    ...Array<string>(progress.missedDays).fill('missed'),
    ...Array<string>(remainingDays).fill('upcoming'),
  ].slice(0, 7);

  return (
    <div
      aria-label={`${progress.completedDays} of ${progress.eligibleDays} eligible days completed this week, ${progress.missedDays} missed`}
      className="weekly-progress"
    >
      <span aria-hidden="true" className="weekly-progress__markers">
        {markers.map((status, index) => (
          <span
            className={`weekly-progress__marker weekly-progress__marker--${status}`}
            key={index}
          />
        ))}
      </span>
      <span className="weekly-progress__copy">
        {progress.completedDays} of {progress.eligibleDays} this week · {progress.missedDays} missed
      </span>
    </div>
  );
}
