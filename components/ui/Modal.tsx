"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
};

export default function Modal({ open, onClose, title, subtitle, children, wide }: ModalProps) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div
        className={`relative z-[81] max-h-[92vh] w-full overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl ${
          wide ? "max-w-4xl" : "max-w-md"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {title || subtitle ? (
          <div className="flex items-start justify-between gap-3 border-b border-[var(--app-border)] px-5 py-4 sm:px-6">
            <div>
              {title ? <h3 className="text-lg font-semibold text-[var(--app-text-primary)] sm:text-xl">{title}</h3> : null}
              {subtitle ? <p className="mt-1 text-sm text-[var(--app-text-secondary)]">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-muted)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        <div className={title || subtitle ? "max-h-[calc(92vh-5rem)] overflow-y-auto p-5 sm:p-6" : "max-h-[92vh] overflow-y-auto p-5 sm:p-6"}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
