export type ChartPeriod = "day" | "week" | "month" | "year";

const PERIODS: { id: ChartPeriod; label: string; short: string }[] = [
  { id: "day", label: "Day", short: "D" },
  { id: "week", label: "Week", short: "W" },
  { id: "month", label: "Month", short: "M" },
  { id: "year", label: "Year", short: "Y" },
];

type ChartPeriodPillsProps = {
  value: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
  compact?: boolean;
};

export default function ChartPeriodPills({ value, onChange, compact }: ChartPeriodPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PERIODS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition sm:h-9 sm:w-9 sm:text-sm ${
            value === p.id
              ? "bg-green-500 text-white shadow-sm dark:bg-green-600"
              : "border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]"
          }`}
        >
          {compact ? p.short : p.label}
        </button>
      ))}
    </div>
  );
}
