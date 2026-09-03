interface ProgressBarProps {
  current: number;
  label: string;
  target: number;
}

export function ProgressBar({ current, label, target }: ProgressBarProps) {
  const safeTarget = Math.max(target, 1);
  const safeCurrent = Math.max(current, 0);
  const percentage = Math.min((safeCurrent / safeTarget) * 100, 100);

  return (
    <div
      aria-label={label}
      aria-valuemax={safeTarget}
      aria-valuemin={0}
      aria-valuenow={Math.min(safeCurrent, safeTarget)}
      className="progress-bar"
      role="progressbar"
    >
      <span className="progress-bar__value" style={{ width: `${percentage}%` }} />
    </div>
  );
}
