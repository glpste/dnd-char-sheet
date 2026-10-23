import type { Proficiency } from '../../model/character';
import { cx } from '../ui/styles';

export interface ProficiencyDotProps {
  value: Proficiency;
  onChange: (next: Proficiency) => void;
  label: string;
  /** Saves only toggle between none and proficient. */
  allowExpertise?: boolean;
}

const NEXT: Record<Proficiency, Proficiency> = { none: 'proficient', proficient: 'expertise', expertise: 'none' };

/** Click cycles none → proficient → expertise (double ring) → none. */
export function ProficiencyDot({ value, onChange, label, allowExpertise = true }: ProficiencyDotProps) {
  const next = allowExpertise ? NEXT[value] : value === 'none' ? 'proficient' : 'none';
  return (
    <button
      type="button"
      aria-label={`${label} proficiency: ${value}`}
      title={`${label}: ${value} (click for ${next})`}
      onClick={() => onChange(next)}
      className={cx(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500',
        value === 'none' ? 'border-zinc-400 dark:border-zinc-600' : 'border-amber-500 bg-amber-500',
      )}
    >
      {value === 'expertise' && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-zinc-950" />}
    </button>
  );
}
