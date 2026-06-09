"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { BarChart3 } from "lucide-react";
import ChartTooltip from "@/components/copier/charts/ChartTooltip";
import {
  CHART,
  buildYTicks,
  computeYDomain,
  formatAxisMoney,
  formatTooltipMoney,
  indexToX,
  nearestIndex,
  valueToY,
} from "@/components/copier/charts/chartShared";
import type { ChartPeriod, TradeDistributionPoint } from "@/lib/mock/masterDetail";

type TradeDistributionChartProps = {
  data: TradeDistributionPoint[];
  period: ChartPeriod;
};

const { viewW, viewH, pad } = CHART;

export default function TradeDistributionChart({ data, period }: TradeDistributionChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const yDomain = useMemo(() => {
    const domain = computeYDomain(data.map((d) => d.value));
    if (domain.max < 3000) domain.max = Math.max(domain.max, 3000);
    if (domain.min > -9000) domain.min = Math.min(domain.min, -9000);
    return domain;
  }, [data]);

  const zeroY = valueToY(0, yDomain.min, yDomain.max, pad, viewH);
  const yTicks = useMemo(() => buildYTicks(yDomain.min, yDomain.max, yDomain.step), [yDomain]);

  const barWidth = useMemo(() => {
    const innerW = viewW - pad.left - pad.right;
    return Math.max(5, Math.min(14, (innerW / Math.max(data.length, 1)) * 0.6));
  }, [data.length]);

  const bars = useMemo(
    () =>
      data.map((d, i) => {
        const x = indexToX(i, data.length, pad, viewW);
        const y1 = valueToY(d.value, yDomain.min, yDomain.max, pad, viewH);
        const top = Math.min(zeroY, y1);
        const height = Math.max(Math.abs(y1 - zeroY), 2);
        const positive = d.value >= 0;
        return { ...d, x, top, height, positive, index: i };
      }),
    [data, yDomain, zeroY]
  );

  const labelStep = Math.max(1, Math.floor(data.length / (period === "day" ? 8 : 10)));
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
      ? "Individual trades · today"
      : period === "week"
        ? "Daily totals · last 7 days"
        : period === "month"
          ? "Daily totals · last 30 days"
          : "Monthly totals · last 12 months";

  const tooltipDate =
    active?.timestamp ?? (active && period === "day" ? `DEAL #${active.dealId}` : active?.label ?? "");

  return (
    <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold leading-tight text-[var(--app-text-primary)]">Trade Distribution</h2>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">Individual trade performance profile · {periodHint}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_oklab,#f87171_12%,var(--app-mix-base))] text-rose-500">
          <BarChart3 className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </div>
      </div>

      <div className="relative mt-4">
        {active ? (
          <ChartTooltip
            leftPct={(active.x / viewW) * 100}
            topPct={(active.top / viewH) * 100}
            date={tooltipDate}
            value={formatTooltipMoney(active.value)}
            label={period === "day" ? "Trade Result" : "Period Total"}
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
          aria-label="Trade distribution chart"
        >
          {yTicks.map((val) => {
            const y = valueToY(val, yDomain.min, yDomain.max, pad, viewH);
            return (
              <g key={val}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={viewW - pad.right}
                  y2={y}
                  stroke="var(--app-border)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  opacity="0.85"
                />
                <text x={pad.left - 8} y={y + 4} textAnchor="end" className="fill-[var(--app-text-muted)] text-[12px]">
                  {formatAxisMoney(val)}
                </text>
              </g>
            );
          })}

          <line x1={pad.left} y1={zeroY} x2={viewW - pad.right} y2={zeroY} stroke="var(--app-border)" strokeWidth="1" opacity="0.5" />

          {bars.map((b) => (
            <rect
              key={`${b.dealId}-${b.index}`}
              x={b.x - barWidth / 2}
              y={b.top}
              width={barWidth}
              height={b.height}
              rx={barWidth / 2}
              fill={b.positive ? "var(--app-primary-solid)" : "#f87171"}
              opacity={hoverIndex === null || hoverIndex === b.index ? 0.92 : 0.35}
            />
          ))}

          {active ? (
            <rect x={active.x - 16} y={pad.top} width={32} height={innerH} fill="var(--app-text-muted)" opacity="0.07" rx={4} />
          ) : null}

          {bars.map((b, i) =>
            i % labelStep === 0 || i === bars.length - 1 ? (
              <text key={`${b.label}-${i}`} x={b.x} y={viewH - 8} textAnchor="middle" className="fill-[var(--app-text-muted)] text-[11px]">
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
