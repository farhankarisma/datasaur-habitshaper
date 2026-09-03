import type { ReactNode } from 'react';

interface SectionHeaderProps {
  action?: ReactNode;
  description: string;
  headingId: string;
  title: string;
}

export function SectionHeader({ action, description, headingId, title }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        <h2 id={headingId}>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
