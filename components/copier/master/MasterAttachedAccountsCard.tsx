"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MasterAttachedAccount } from "@/lib/mock/masterArea";
import { money, pct } from "@/lib/utils";

type MasterAttachedAccountsCardProps = {
  accounts: MasterAttachedAccount[];
  selectedId: number;
  onSelect: (id: number) => void;
};

function StatCell({
  label,
  value,
  valueClass = "text-[var(--app-text-primary)]",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center px-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">{label}</p>
      <p className={`mt-1 text-sm font-bold sm:text-base ${valueClass}`}>{value}</p>
    </div>
  );
}

export default function MasterAttachedAccountsCard({ accounts, selectedId, onSelect }: MasterAttachedAccountsCardProps) {
  const [open, setOpen] = useState(false);

  const account = accounts.find((a) => a.id === selectedId) ?? accounts[0];
  if (!account) return null;

  const profitNegative = account.profit < 0;
  const gainNegative = account.gainPct < 0;
  const archived = account.status === "Archived";

  const stats = [
    {
      label: "Profit",
      value: money(account.profit),
      valueClass: profitNegative ? "text-rose-500" : "text-[color:var(--app-primary-solid)]",
    },
    {
      label: "Floating Profit",
      value: money(account.floatingProfit),
      valueClass: account.floatingProfit < 0 ? "text-rose-500" : "text-[color:var(--app-primary-solid)]",
    },
    {
      label: "Gain",
      value: pct(account.gainPct),
      valueClass: gainNegative ? "text-rose-500" : "text-[color:var(--app-primary-solid)]",
    },
    {
      label: "Commission",
      value: `$${account.commissionPerLot} / lot`,
      valueClass: "text-[var(--app-text-primary)]",
    },
    {
      label: "Risk Score",
      value: String(account.riskScore),
      valueClass: account.riskScore >= 6 ? "text-rose-500" : "text-[var(--app-text-primary)]",
    },
  ];

  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-1 flex-wrap items-center gap-0 sm:flex-nowrap">
          {/* Account dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex flex-col items-start rounded-lg px-2 py-1 text-left transition hover:bg-[var(--app-surface-muted)]/60"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
                Account{" "}
                <span className="text-orange-500">{account.platform}</span>
              </p>
              <span className="mt-0.5 flex items-center gap-1 text-sm font-bold text-[var(--app-text-primary)]">
                {account.login}
                <ChevronDown className={`h-4 w-4 text-[var(--app-text-muted)] transition ${open ? "rotate-180" : ""}`} />
              </span>
            </button>

            {open ? (
              <>
                <button type="button" className="fixed inset-0 z-10" aria-label="Close account menu" onClick={() => setOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-1 min-w-[200px] rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-1 shadow-lg">
                  {accounts.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        onSelect(a.id);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-[var(--app-surface-muted)] ${
                        a.id === selectedId ? "font-bold text-[color:var(--app-primary-solid)]" : "text-[var(--app-text-primary)]"
                      }`}
                    >
                      <span>
                        {a.platform} · {a.login}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase ${a.status === "Archived" ? "text-rose-500" : "text-[color:var(--app-primary-solid)]"}`}>
                        {a.status}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <span className="mx-3 hidden text-lg font-light text-[var(--app-border)] sm:inline" aria-hidden>
            |
          </span>

          {/* Stats row */}
          <div className="mt-4 grid w-full grid-cols-2 gap-y-4 sm:mt-0 sm:flex sm:flex-1 sm:items-center sm:justify-around">
            {stats.map((stat, idx) => (
              <Fragment key={stat.label}>
                {idx > 0 ? (
                  <span className="hidden self-center text-lg font-light text-[var(--app-border)] sm:inline" aria-hidden>
                    |
                  </span>
                ) : null}
                <StatCell {...stat} />
              </Fragment>
            ))}
          </div>
        </div>

        {/* Status badge */}
        <div className="flex shrink-0 items-center justify-end gap-2 sm:pl-4">
          <span
            className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
              archived
                ? "border-rose-300 text-rose-500 dark:border-rose-500/40"
                : "border-[color:var(--app-primary-solid)]/40 text-[color:var(--app-primary-solid)]"
            }`}
          >
            {account.status}
          </span>
        </div>
      </div>
    </div>
  );
}
