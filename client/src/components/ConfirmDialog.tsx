import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Native <dialog> shown as a modal: focus is trapped and Esc cancels. */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="w-[min(420px,100%-32px)] rounded-2xl border border-line bg-paper-raised p-0 text-ink shadow-lift backdrop:bg-ink/40"
    >
      <div className="p-6">
        <h2 className="font-serif text-2xl font-medium">{title}</h2>
        <p className="mt-2 text-ink-soft">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2 text-[14.5px] text-ink-soft hover:bg-paper-sunk">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="rounded-xl bg-rust px-4 py-2 text-[14.5px] font-semibold text-rust-ink hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
