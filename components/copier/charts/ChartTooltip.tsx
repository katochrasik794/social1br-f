type ChartTooltipProps = {
  leftPct: number;
  topPct: number;
  date: string;
  value: string;
  label: string;
  valueClassName?: string;
};

export default function ChartTooltip({ leftPct, topPct, date, value, label, valueClassName }: ChartTooltipProps) {
  return (
    <div
      className="pointer-events-none absolute z-20 min-w-[160px] rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3.5 shadow-lg"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        transform: "translate(-50%, calc(-100% - 16px))",
      }}
    >
      <p className="text-[13px] leading-tight text-[var(--app-text-muted)]">{date}</p>
      <p className={`mt-2 text-[24px] font-bold leading-none tracking-tight ${valueClassName ?? "text-[var(--app-text-primary)]"}`}>
        {value}
      </p>
      <p className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--app-text-muted)]">{label}</p>
    </div>
  );
}
