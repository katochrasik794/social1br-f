"use client";

import { Fragment } from "react";

type Column<T> = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  render: (row: T) => React.ReactNode;
};

type DateGroup<T> = {
  dateLabel: string;
  items: T[];
};

type GroupedHistoryTableProps<T> = {
  groups: DateGroup<T>[];
  columns: Column<T>[];
  emptyMessage?: string;
};

export default function GroupedHistoryTable<T>({
  groups,
  columns,
  emptyMessage = "No records found",
}: GroupedHistoryTableProps<T>) {
  if (!groups.length) {
    return (
      <div className="py-12 text-center text-[15px] text-[var(--app-text-muted)]">{emptyMessage}</div>
    );
  }

  const alignClass = (align?: "left" | "center" | "right") =>
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-[15px]">
        <thead>
          <tr className="border-b border-[var(--app-border)] text-xs font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 ${alignClass(col.align)}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.dateLabel}>
              <tr>
                <td colSpan={columns.length} className="px-4 pb-1 pt-4 text-[15px] font-bold text-[var(--app-text-primary)]">
                  {group.dateLabel}
                </td>
              </tr>
              {group.items.map((row, i) => (
                <tr
                  key={`${group.dateLabel}-${i}`}
                  className="border-b border-[var(--app-border)]/40 transition hover:bg-[var(--app-surface-muted)]/40"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 ${alignClass(col.align)}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
