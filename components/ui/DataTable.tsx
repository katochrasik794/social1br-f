"use client";

import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  title?: string;
  isLoading?: boolean;
  dateColumn?: string;
  statusColumn?: string;
  searchableColumns?: string[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
  className?: string;
};

export default function DataTable<T extends Record<string, unknown>>({
  columns = [],
  data = [],
  title = "Table",
  isLoading = false,
  dateColumn = "created_at",
  statusColumn = "status",
  searchableColumns = [],
  searchPlaceholder = "Search records...",
  showSearch = true,
  emptyMessage = "No records found",
  emptySubMessage = "Try adjusting your filters",
  className = "",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        !showSearch || !searchTerm
          ? true
          : searchableColumns.length > 0
            ? searchableColumns.some((key) => {
                const val = String(item[key] ?? "").toLowerCase();
                return val.includes(searchTerm.toLowerCase());
              })
            : Object.values(item).some((val) =>
                String(val ?? "").toLowerCase().includes(searchTerm.toLowerCase())
              );

      const matchesStatus =
        !statusColumn || statusFilter === "All"
          ? true
          : String(item[statusColumn] ?? "").toLowerCase() === statusFilter.toLowerCase();

      let matchesDate = true;
      if (dateColumn && item[dateColumn]) {
        const itemDate = new Date(String(item[dateColumn]));
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && end) matchesDate = itemDate >= start && itemDate <= end;
        else if (start) matchesDate = itemDate >= start;
        else if (end) matchesDate = itemDate <= end;
      }
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [data, searchTerm, statusFilter, startDate, endDate, searchableColumns, dateColumn, statusColumn, showSearch]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const safePage = currentPage > totalPages && totalPages > 0 ? 1 : currentPage;
  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, safePage, rowsPerPage]);

  const uniqueStatuses = useMemo(() => {
    if (!statusColumn) return [];
    const statuses = new Set(data.map((item) => item[statusColumn]).filter(Boolean));
    return ["All", ...Array.from(statuses).map(String)];
  }, [data, statusColumn]);

  const showDateFilter = Boolean(dateColumn);
  const showStatusFilter = Boolean(statusColumn) && uniqueStatuses.length > 1;

  return (
    <div className={`flex w-full min-w-0 flex-col gap-3 ${className}`}>
      {showSearch || showStatusFilter || showDateFilter ? (
      <div className="flex flex-col gap-3 rounded-md border border-[var(--app-border)] bg-[var(--app-surface-muted)]/60 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        {showSearch ? (
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-muted)]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] py-2 pl-9 pr-3 text-sm text-[var(--app-text-primary)] outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--app-primary-solid)_35%,transparent)]"
            />
          </div>
        ) : null}
        {showStatusFilter ? (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text-primary)]"
          >
            {uniqueStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : null}
        {showDateFilter ? (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm"
            />
          </>
        ) : null}
      </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
        <div className="border-b border-[var(--app-border)] bg-[var(--app-surface-muted)]/80 p-4 md:p-5">
          <h2 className="text-lg font-semibold text-[var(--app-text-primary)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--app-text-secondary)]">Showing {filteredData.length} records</p>
        </div>

        <div className="relative min-h-[200px] flex-1 overflow-x-auto overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-[var(--app-text-muted)]">Loading...</div>
          ) : paginatedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="font-semibold text-[var(--app-text-primary)]">{emptyMessage}</p>
              <p className="mt-1 text-sm text-[var(--app-text-secondary)]">{emptySubMessage}</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--app-border)] bg-[var(--app-surface-muted)]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, i) => (
                  <tr key={i} className="border-b border-[var(--app-border)]/60 transition hover:bg-[var(--app-surface-muted)]/50">
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

        {filteredData.length > 0 ? (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--app-border)] p-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-[var(--app-text-secondary)]">
              <span>Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1"
              >
                {[5, 10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-[var(--app-text-secondary)]">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
