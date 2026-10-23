import { useLayoutEffect, useRef } from 'react';
import { cx, input } from './styles';

export interface TextAreaProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  /** Grow with content (default). Set false to let the parent control height. */
  autoGrow?: boolean;
  minRows?: number;
  'aria-label': string;
}

export function TextArea({
  value,
  onChange,
  placeholder,
  className,
  autoGrow = true,
  minRows = 2,
  ...rest
}: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !autoGrow) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value, autoGrow]);

  return (
    <textarea
      ref={ref}
      aria-label={rest['aria-label']}
      rows={minRows}
      className={cx(
        input,
        'block w-full resize-none text-sm leading-snug placeholder:text-zinc-400 dark:placeholder:text-zinc-600',
        className,
      )}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
