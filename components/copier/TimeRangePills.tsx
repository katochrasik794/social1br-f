export type TimeRange = "2W" | "1M" | "3M" | "6M" | "ALL";

const RANGES: TimeRange[] = ["2W", "1M", "3M", "6M", "ALL"];

type TimeRangePillsProps = {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
};

export default function TimeRangePills({ value, onChange }: TimeRangePillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
            value === r
              ? "bg-[var(--app-text-primary)] text-[var(--app-surface)]"
              : "bg-[var(--app-surface-muted)] text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
