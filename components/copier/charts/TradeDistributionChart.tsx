"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import ChartTooltip from "@/components/copier/charts/ChartTooltip";
import {
  CHART,
  buildYTicks,
  computeDivergingYDomain,
  formatAxisMoney,
  formatTooltipMoney,
  indexToX,
  nearestIndex,
  valueToY,
} from "@/components/copier/charts/chartShared";
import { distributionSummary } from "@/lib/copier/tradeHistoryTransforms";
import type { ChartPeriod, TradeDistributionPoint } from "@/lib/mock/masterDetail";
import { money } from "@/lib/utils";

type TradeDistributionChartProps = {
  data: TradeDistributionPoint[];
  period: ChartPeriod;
};

const { viewW, viewH, pad } = CHART;

export default function TradeDistributionChart({ data, period }: TradeDistributionChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gradPosId = useId().replace(/:/g, "");
  const gradNegId = useId().replace(/:/g, "");

  const summary = useMemo(() => distributionSummary(data), [data]);

  const yDomain = useMemo(() => computeDivergingYDomain(data.map((d) => d.value)), [data]);
  const zeroY = valueToY(0, yDomain.min, yDomain.max, pad, viewH);
  const yTicks = useMemo(() => buildYTicks(yDomain.min, yDomain.max, yDomain.step), [yDomain]);

  const barWidth = useMemo(() => {
    const innerW = viewW - pad.left - pad.right;
    return Math.max(6, Math.min(22, (innerW / Math.max(data.length, 1)) * 0.72));
  }, [data.length]);

  const bars = useMemo(
    () =>
      data.map((d, i) => {
        const x = indexToX(i, data.length, pad, viewW);
        const y1 = valueToY(d.value, yDomain.min, yDomain.max, pad, viewH);
        const top = Math.min(zeroY, y1);
        const height = Math.max(Math.abs(y1 - zeroY), d.value === 0 ? 1 : 2);
        const positive = d.value >= 0;
        return { ...d, x, top, height, positive, index: i, y1 };
      }),
    [data, yDomain, zeroY]
  );

  const labelStep = Math.max(1, Math.floor(data.length / (period === "day" ? 8 : period === "year" ? 6 : 10)));
  const active = hoverIndex !== null ? bars[hoverIndex] : null;
  const innerH = viewH - pad.top - pad.bottom;

  const handlePointer = useCallback(
    (clientX: number) => {
      const svg = svgRef.current;
      if (!svg || !bars.length) return;
      setHoverIndex(nearestIndex(clientX, svg.getBoundingClientRect(), bars.length, pad.left, pad.right, viewW));
    },
    [bars.length]
  );

  const periodHint =
    period === "day"
      ? "Hourly P&L · last 24 hours"
      : period === "week"
        ? "Daily P&L · last 7 days"
        : period === "month"
          ? "Daily P&L · last 30 days"
          : "Monthly P&L · last 12 months";

  const tooltipDate = active?.timestamp ?? active?.label ?? "";

  return (
    <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold leading-tight text-[var(--app-text-primary)]">P&amp;L Distribution</h2>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">Growth &amp; decline by period · {periodHint}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_oklab,#6366f1_12%,var(--app-mix-base))] text-indigo-500">
          <BarChart3 className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-lg border border-[var(--app-border)] bg-[color-mix(in_oklab,var(--app-surface-muted)_60%,var(--app-mix-base))] px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Net P&amp;L</p>
          <p
            className={`mt-1 flex items-center gap-1 text-lg font-bold ${
              summary.net >= 0 ? "text-[color:var(--app-primary-solid)]" : "text-rose-500"
            }`}
          >
            {summary.net >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {money(summary.net)}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--app-border)] bg-[color-mix(in_oklab,var(--app-surface-muted)_60%,var(--app-mix-base))] px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Up periods</p>
          <p className="mt-1 text-lg font-bold text-[color:var(--app-primary-solid)]">{summary.wins}</p>
        </div>
        <div className="rounded-lg border border-[var(--app-border)] bg-[color-mix(in_oklab,var(--app-surface-muted)_60%,var(--app-mix-base))] px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Down periods</p>
          <p className="mt-1 text-lg font-bold text-rose-500">{summary.losses}</p>
        </div>
      </div>

      <div className="relative mt-4">
        {active && active.value !== 0 ? (
          <ChartTooltip
            leftPct={(active.x / viewW) * 100}
            topPct={(active.y1 / viewH) * 100}
            date={tooltipDate}
            value={formatTooltipMoney(active.value)}
            label={period === "day" ? "Hourly P&L" : "Period P&L"}
            valueClassName={active.positive ? "text-[color:var(--app-primary-solid)]" : "text-rose-500"}
          />
        ) : null}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewW} ${viewH}`}
          className="h-auto w-full cursor-crosshair touch-none select-none"
          onMouseMove={(e) => handlePointer(e.clientX)}
          onMouseLeave={() => setHoverIndex(null)}
          onTouchMove={(e) => e.touches[0] && handlePointer(e.touches[0].clientX)}
          onTouchEnd={() => setHoverIndex(null)}
          role="img"
          aria-label="P and L distribution chart"
        >
          <defs>
            <linearGradient id={gradPosId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="var(--app-primary-solid)" />
            </linearGradient>
            <linearGradient id={gradNegId} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
          </defs>

          {yTicks.map((val) => {
            const y = valueToY(val, yDomain.min, yDomain.max, pad, viewH);
            const isZero = val === 0;
            return (
              <g key={val}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={viewW - pad.right}
                  y2={y}
                  stroke={isZero ? "var(--app-text-muted)" : "var(--app-border)"}
                  strokeWidth={isZero ? 1.5 : 1}
                  strokeDasharray={isZero ? undefined : "3 4"}
                  opacity={isZero ? 0.55 : 0.85}
                />
                <text x={pad.left - 8} y={y + 4} textAnchor="end" className="fill-[var(--app-text-muted)] text-[11px]">
                  {formatAxisMoney(val)}
                </text>
              </g>
            );
          })}

          {bars.map((b, i) =>
            i % 2 === 0 ? (
              <rect
                key={`band-${i}`}
                x={b.x - barWidth}
                y={pad.top}
                width={barWidth * 2}
                height={innerH}
                fill="var(--app-text-muted)"
                opacity="0.03"
              />
            ) : null
          )}

          {bars.map((b) => (
            <g key={`${b.dealId}-${b.index}`}>
              <rect
                x={b.x - barWidth / 2}
                y={b.top}
                width={barWidth}
                height={b.height}
                rx={2}
                fill={b.positive ? `url(#${gradPosId})` : `url(#${gradNegId})`}
                opacity={hoverIndex === null || hoverIndex === b.index ? (b.value === 0 ? 0.15 : 0.95) : 0.3}
                stroke={b.positive ? "#16a34a" : "#dc2626"}
                strokeWidth={hoverIndex === b.index ? 1.5 : 0}
              />
              {hoverIndex === b.index && b.value !== 0 ? (
                <text
                  x={b.x}
                  y={b.positive ? b.top - 6 : b.top + b.height + 14}
                  textAnchor="middle"
                  className={`text-[10px] font-semibold ${b.positive ? "fill-[color:var(--app-primary-solid)]" : "fill-rose-500"}`}
                >
                  {formatAxisMoney(b.value)}
                </text>
              ) : null}
            </g>
          ))}

          {active ? (
            <line
              x1={active.x}
              y1={pad.top}
              x2={active.x}
              y2={viewH - pad.bottom}
              stroke="var(--app-text-muted)"
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.45"
            />
          ) : null}

          {bars.map((b, i) =>
            i % labelStep === 0 || i === bars.length - 1 ? (
              <text key={`${b.label}-${i}`} x={b.x} y={viewH - 8} textAnchor="middle" className="fill-[var(--app-text-muted)] text-[10px]">
                {b.label}
              </text>
            ) : null
          )}

          <rect x={pad.left} y={pad.top} width={viewW - pad.left - pad.right} height={innerH} fill="transparent" />
        </svg>
      </div>
    </div>
  );
}
