"use client";

import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { btnPrimary } from "@/components/layout/user/PageContainer";
import { CopierMasterRow } from "@/components/copier/area/CopierMasterRow";
import type { CopierMasterHistoryEntry } from "@/lib/mock/copierArea";

type CopierProgressSectionProps = {
  masters: CopierMasterHistoryEntry[];
  selected: CopierMasterHistoryEntry;
  onSelect: (entry: CopierMasterHistoryEntry) => void;
};

const cardClass = "rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-md";

export default function CopierProgressSection({ masters, selected, onSelect }: CopierProgressSectionProps) {
  const suspicious = selected.suspicious;

  return (
    <div className={`p-5 sm:p-6 ${cardClass}`}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-bold text-[var(--app-text-primary)] sm:text-lg">
          Your progress with particular Master
        </h2>
        {suspicious ? (
          <span className="flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wide text-red-500 dark:text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Suspicious activity
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-3">
        {masters.map((master) => (
          <CopierMasterRow
            key={master.id}
            entry={master}
            selected={selected.id === master.id}
            onClick={() => onSelect(master)}
          />
        ))}
      </div>

      <Link
        href="/copier/rating"
        className={`${btnPrimary} mt-5 block w-full rounded-xl py-3.5 text-center text-sm font-bold uppercase tracking-wide sm:hidden`}
      >
        Add new master
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-6 border-t border-[var(--app-border)] pt-5">
        <Link
          href="/copier/rating"
          className="text-sm font-bold uppercase tracking-wide text-green-600 hover:underline dark:text-green-400"
        >
          Set up copying
        </Link>
        <Link
          href={`/copier/rating/${selected.masterId}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-[var(--app-text-primary)] hover:text-green-600 dark:hover:text-green-400"
        >
          Master&apos;s performance
          <ExternalLink className="h-4 w-4" />
        </Link>
        <Link
          href="/copier/rating"
          className="ml-auto hidden text-sm font-bold uppercase tracking-wide text-green-600 hover:underline dark:text-green-400 sm:inline"
        >
          Add new
        </Link>
      </div>
    </div>
  );
}
