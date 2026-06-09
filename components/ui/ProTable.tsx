"use client";

import { useMemo, useState } from "react";
import { Inbox, ChevronLeft, ChevronRight } from "lucide-react";

export type ProColumn<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

type ProTableProps<T extends Record<string, unknown>> = {
  title?: string;
  kpis?: React.ReactNode[];
  rows?: T[];
  columns?: ProColumn<T>[];
  filters?: {
    searchKeys?: string[];
    selects?: { key: string; label: string; options: string[] }[];
    dateKey?: string;
  };
  pageSize?: number;
  searchPlaceholder?: string;
  loading?: boolean;
};

export default function ProTable<T extends Record<string, unknown>>({
  title,
  kpis = [],
  rows = [],
  columns = [],
  filters,
  pageSize = 10,
  searchPlaceholder = "Search...",
  loading = false,
}: ProTableProps<T>) {
  const [q, setQ] = useState("");
  const [selects, setSelects] = useState<Record<string, string>>(
    Object.fromEntries((filters?.selects || []).map((s) => [s.key, ""]))
  );
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let out = [...rows];
    if (q) {
      const lower = q.toLowerCase();
      out = out.filter((r) =>
        (filters?.searchKeys || Object.keys(r)).some((k) =>
          String(r[k] ?? "").toLowerCase().includes(lower)
        )
      );
    }
    for (const [k, v] of Object.entries(selects)) {
      if (v) out = out.filter((r) => String(r[k]) === v);
    }
    if (filters?.dateKey && (from || to)) {
      const fk = Date.parse(from || "1970-01-01");
      const tk = Date.parse(to || "2999-12-31");
      out = out.filter((r) => {
        const t = Date.parse(String(r[filters.dateKey!]));
        return t >= fk && t <= tk;
      });
    }
    return out;
  }, [rows, q, selects, from, to, filters]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      {kpis.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{kpis}</div>
      ) : null}

      <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
        {title ? (
          <div className="border-b border-[var(--app-border)] px-5 py-4">
            <h2 className="text-lg font-semibold text-[var(--app-text-primary)]">{title}</h2>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 border-b border-[var(--app-border)] bg-[var(--app-surface-muted)]/60 p-4">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="min-w-[180px] flex-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm"
          />
          {(filters?.selects || []).map((s) => (
            <select
              key={s.key}
              value={selects[s.key] || ""}
              onChange={(e) => {
                setSelects((prev) => ({ ...prev, [s.key]: e.target.value }));
                setPage(1);
              }}
              className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm"
            >
              <option value="">{s.label}</option>
              {s.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ))}
          {filters?.dateKey ? (
            <>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm" />
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm" />
            </>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-[var(--app-text-muted)]">Loading...</div>
          ) : slice.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-[var(--app-text-muted)]">
              <Inbox className="h-10 w-10" />
              <p>No records found</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--app-border)] bg-[var(--app-surface-muted)]">
                  {columns.map((col) => (
                    <th key={col.key} className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.map((row, i) => (
                  <tr key={i} className="border-b border-[var(--app-border)]/60 hover:bg-[var(--app-surface-muted)]/40">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm text-[var(--app-text-primary)]">
                        {col.render ? col.render(row) : String(row[col.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {total > 0 ? (
          <div className="flex items-center justify-between border-t border-[var(--app-border)] p-4">
            <p className="text-sm text-[var(--app-text-secondary)]">{total} records</p>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm">{page} / {pages}</span>
              <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] disabled:opacity-40">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
