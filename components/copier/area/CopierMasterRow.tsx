import { ChevronRight, Star } from "lucide-react";
import type { CopierMasterHistoryEntry } from "@/lib/mock/copierArea";
import { money, pct } from "@/lib/utils";

type CopierMasterRowProps = {
  entry: CopierMasterHistoryEntry;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
};

export function CopierMasterRow({ entry, compact, selected, onClick }: CopierMasterRowProps) {
  const initials = entry.masterName.slice(0, 2).toUpperCase();
  const profitNegative = entry.profit < 0;
  const gainNegative = entry.gainPct < 0;
  const profitPositive = entry.profit > 0;
  const gainPositive = entry.gainPct > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-xl border text-left transition ${
        selected
          ? "border-green-200 border-l-4 border-l-green-500 bg-green-50/80 shadow-sm dark:border-green-900 dark:border-l-green-500 dark:bg-green-950/30"
          : "border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-surface-muted)]/50"
      } ${compact ? "px-4 py-3" : "px-5 py-5"}`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-700 dark:bg-green-950/60 dark:text-green-300">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold text-[var(--app-text-primary)]">{entry.masterName}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-[var(--app-text-muted)]">
          <Star className="h-3.5 w-3.5 fill-green-500 text-green-500 dark:fill-green-400 dark:text-green-400" />
          {entry.expertise}
        </p>
      </div>
      <div className="hidden items-center gap-8 sm:flex">
        <div className="text-right">
          <p className="text-xs font-bold text-[var(--app-text-muted)]">Profit</p>
          <p
            className={`mt-0.5 text-sm font-bold sm:text-base ${
              profitNegative
                ? "text-red-500 dark:text-red-400"
                : profitPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-[var(--app-text-primary)]"
            }`}
          >
            {money(entry.profit)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-[var(--app-text-muted)]">Gain</p>
          <p
            className={`mt-0.5 text-sm font-bold sm:text-base ${
              gainNegative
                ? "text-red-500 dark:text-red-400"
                : gainPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-[var(--app-text-primary)]"
            }`}
          >
            {pct(entry.gainPct)}
          </p>
        </div>
      </div>
      <ChevronRight
        className={`h-5 w-5 shrink-0 ${selected ? "text-green-600 dark:text-green-400" : "text-[var(--app-text-muted)]"}`}
      />
    </button>
  );
}
