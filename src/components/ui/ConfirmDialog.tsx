import { useEffect, useRef, type ReactNode } from 'react';
import { btn, btnDanger, btnPrimary, cx } from './styles';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  danger?: boolean;
}

/**
 * Modal confirmation. Rendered as a plain overlay (not <dialog>) so it behaves the
 * same in jsdom and browsers; Escape cancels, focus lands on the confirm button.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
  secondaryLabel,
  onSecondary,
  danger = false,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-lg border border-zinc-300 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <h2 id="confirm-title" className="text-base font-medium">
          {title}
        </h2>
        {children && <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{children}</div>}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className={btn} onClick={onCancel}>
            Cancel
          </button>
          {secondaryLabel && onSecondary && (
            <button type="button" className={btn} onClick={onSecondary}>
              {secondaryLabel}
            </button>
          )}
          <button ref={confirmRef} type="button" className={cx(danger ? btnDanger : btnPrimary)} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
