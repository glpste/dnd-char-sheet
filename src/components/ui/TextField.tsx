import { cx, input } from './styles';

export interface TextFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  'aria-label': string;
}

export function TextField({ value, onChange, placeholder, className, ...rest }: TextFieldProps) {
  return (
    <input
      type="text"
      aria-label={rest['aria-label']}
      className={cx(input, 'w-full placeholder:text-zinc-400 dark:placeholder:text-zinc-600', className)}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
