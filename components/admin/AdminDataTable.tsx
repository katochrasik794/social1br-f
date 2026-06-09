"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export type AdminColumn<T> = {
  key: string;
  label: string;
  render?: (row: T, index: number) => React.ReactNode;
};

type AdminDataTableProps<T extends Record<string, unknown>> = {
  rows: T[];
  columns: AdminColumn<T>[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  dateKey?: string;
  pageSize?: number;
  onReset?: () => void;
  exportFileName?: string;
};

export default function AdminDataTable<T extends Record<string, unknown>>({
  rows,
  columns,
  loading = false,
  searchPlaceholder = "Search...",
  searchKeys = [],
  dateKey,
  pageSize = 10,
  onReset,
  exportFileName = "export",
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let out = [...rows];
    if (search.trim()) {
      const q = search.toLowerCase();
      const keys = searchKeys.length ? searchKeys : Object.keys(rows[0] ?? {});
      out = out.filter((row) => keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)));
    }
    if (dateKey && (from || to)) {
      const start = from ? new Date(from).getTime() : 0;
      const end = to ? new Date(to).getTime() : Number.MAX_SAFE_INTEGER;
      out = out.filter((row) => {
        const t = new Date(String(row[dateKey])).getTime();
        return t >= start && t <= end;
      });
    }
    return out;
  }, [rows, search, searchKeys, dateKey, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const fromRow = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
  const toRow = Math.min(safePage * pageSize, filtered.length);

  function clearFilters() {
    setSearch("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  function exportCsv() {
    const header = columns.map((c) => c.label).join(",");
    const body = filtered
      .map((row, i) =>
        columns
          .map((col) => {
            const val = col.render ? String(col.render(row, i) ?? "") : String(row[col.key] ?? "");
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const pageNumbers = useMemo(() => {
    const nums: number[] = [];
    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [safePage, totalPages]);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-md">
      <div className="flex flex-col gap-3 border-b border-[var(--app-border)] bg-[var(--app-surface-muted)]/60 p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-muted)]" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-2.5 pl-9 pr-3 text-sm font-bold text-[var(--app-text-primary)] outline-none"
          />
        </div>
        {dateKey ? (
          <>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5 text-sm font-bold"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2.5 text-sm font-bold"
            />
          </>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2.5 text-sm font-bold text-[var(--app-text-primary)]"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              clearFilters();
              onReset?.();
            }}
            className="rounded-xl bg-[color:var(--app-primary-solid)] px-4 py-2.5 text-sm font-bold text-white"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2.5 text-sm font-bold text-red-600"
          >
            Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-sm font-bold text-[var(--app-text-muted)]">Loading...</div>
        ) : slice.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-[var(--app-text-muted)]">No records found</div>
        ) : (
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead>
              <tr className="rating-table-head border-b text-xs font-bold uppercase tracking-wider">
                {columns.map((col) => (
                  <th key={col.key} className="whitespace-nowrap px-4 py-4 sm:px-5">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((row, i) => (
                <tr
                  key={String(row.id ?? i)}
                  className={`border-b border-[var(--app-border)] hover:bg-[var(--app-surface-muted)]/50 ${
                    i % 2 === 1 ? "bg-[var(--app-surface-muted)]/30" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4 font-bold text-[var(--app-text-primary)] sm:px-5 sm:py-5">
                      {col.render ? col.render(row, (safePage - 1) * pageSize + i) : String(row[col.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--app-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-[var(--app-text-muted)]">
          Showing {fromRow}-{toRow} of {filtered.length}
        </p>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage(1)}
            className="rounded-xl border border-[var(--app-border)] px-3 py-2 text-xs font-bold disabled:opacity-40"
          >
            « First
          </button>
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`min-w-9 rounded-xl border px-3 py-2 text-sm font-bold ${
                n === safePage
                  ? "border-[color:var(--app-primary-solid)] bg-[color-mix(in_oklab,var(--app-primary-solid)_12%,var(--app-mix-base))] text-[color:var(--app-primary-solid)]"
                  : "border-[var(--app-border)] text-[var(--app-text-secondary)]"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-border)] disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage(totalPages)}
            className="rounded-xl border border-[var(--app-border)] px-3 py-2 text-xs font-bold disabled:opacity-40"
          >
            Last »
          </button>
        </div>
      </div>
    </div>
  );
}
