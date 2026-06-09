"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneMap = {
  success: {
    icon: CheckCircle2,
    bar: "bg-emerald-500",
    ring: "border-emerald-200 dark:border-emerald-500/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-white/95 dark:bg-[#111]/95",
  },
  error: {
    icon: AlertCircle,
    bar: "bg-rose-500",
    ring: "border-rose-200 dark:border-rose-500/30",
    iconColor: "text-rose-600 dark:text-rose-400",
    bg: "bg-white/95 dark:bg-[#111]/95",
  },
  info: {
    icon: Info,
    bar: "bg-sky-500",
    ring: "border-sky-200 dark:border-sky-500/30",
    iconColor: "text-sky-600 dark:text-sky-400",
    bg: "bg-white/95 dark:bg-[#111]/95",
  },
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const tone = toneMap[toast.type];
  const Icon = tone.icon;

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      className={cn(
        "toast-enter pointer-events-auto flex w-[min(360px,calc(100vw-2rem))] items-start gap-3 overflow-hidden rounded-xl border shadow-lg backdrop-blur-md",
        tone.ring,
        tone.bg
      )}
    >
      <div className={cn("w-1 shrink-0 self-stretch", tone.bar)} />
      <Icon className={cn("mt-3.5 h-5 w-5 shrink-0", tone.iconColor)} />
      <p className="flex-1 py-3.5 pr-2 text-sm font-bold text-[var(--app-text-primary)]">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="m-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)]"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {mounted
        ? createPortal(
            <div className="pointer-events-none fixed bottom-6 right-6 z-[120] flex flex-col gap-3">
              {toasts.map((toast) => (
                <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
              ))}
            </div>,
            document.body
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
