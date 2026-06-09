"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import ChartTooltip from "@/components/copier/charts/ChartTooltip";
import {
  CHART,
  buildYTicks,
  computeYDomain,
  formatAxisMoney,
  formatTooltipMoney,
  indexToX,
  nearestIndex,
  stepLinePath,
  valueToY,
} from "@/components/copier/charts/chartShared";
import type { ChartPeriod, EquityGrowthPoint } from "@/lib/mock/masterDetail";

type EquityGrowthChartProps = {
  data: EquityGrowthPoint[];
  period: ChartPeriod;
};

const { viewW, viewH, pad } = CHART;

export default function EquityGrowthChart({ data, period }: EquityGrowthChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fillId = useId().replace(/:/g, "");

  const yDomain = useMemo(() => computeYDomain(data.map((d) => d.value)), [data]);
  const yTicks = useMemo(() => buildYTicks(yDomain.min, yDomain.max, yDomain.step), [yDomain]);

  const points = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        x: indexToX(i, data.length, pad, viewW),
        y: valueToY(d.value, yDomain.min, yDomain.max, pad, viewH),
      })),
    [data, yDomain]
  );

  const linePath = useMemo(() => stepLinePath(points), [points]);
  const baseY = valueToY(yDomain.min, yDomain.min, yDomain.max, pad, viewH);
  const areaPath = useMemo(() => {
    if (!points.length) return "";
    return `${linePath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;
  }, [linePath, points, baseY]);

  const labelStep = Math.max(1, Math.floor(data.length / (period === "day" ? 8 : 10)));
  const active = hoverIndex !== null ? points[hoverIndex] : null;

  const handlePointer = useCallback(
    (clientX: number) => {
      const svg = svgRef.current;
      if (!svg || !points.length) return;
      setHoverIndex(nearestIndex(clientX, svg.getBoundingClientRect(), points.length, pad.left, pad.right, viewW));
    },
    [points.length]
  );

  const innerH = viewH - pad.top - pad.bottom;
  const periodHint =
    period === "day" ? "Hourly" : period === "week" ? "Daily · last 7 days" : period === "month" ? "Daily · last 30 days" : "Monthly · last 12 months";

  return (
    <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold leading-tight text-[var(--app-text-primary)]">Equity Growth</h2>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">Cumulative performance over chosen period · {periodHint}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_oklab,var(--app-primary-solid)_12%,var(--app-mix-base))] text-[color:var(--app-primary-solid)]">
          <TrendingUp className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </div>
      </div>

      <div className="relative mt-4">
        {active ? (
          <ChartTooltip
            leftPct={(active.x / viewW) * 100}
            topPct={(active.y / viewH) * 100}
            date={active.timestamp}
            value={formatTooltipMoney(active.value)}
            label="Cumulative Equity"
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
          aria-label="Equity growth chart"
        >
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--app-primary-solid)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--app-primary-solid)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

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

          <path d={areaPath} fill={`url(#${fillId})`} />
          <path
            d={linePath}
            fill="none"
            stroke="var(--app-primary-solid)"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {active ? (
            <g>
              <line
                x1={active.x}
                y1={pad.top}
                x2={active.x}
                y2={pad.top + innerH}
                stroke="var(--app-text-muted)"
                strokeWidth="1"
                opacity="0.45"
              />
              <rect x={active.x - 14} y={pad.top} width={28} height={innerH} fill="var(--app-text-muted)" opacity="0.06" rx={4} />
              <circle cx={active.x} cy={active.y} r="4.5" fill="var(--app-primary-solid)" stroke="var(--app-surface)" strokeWidth="2" />
            </g>
          ) : null}

          {points.map((p, i) =>
            i % labelStep === 0 || i === points.length - 1 ? (
              <text key={`${p.label}-${i}`} x={p.x} y={viewH - 8} textAnchor="middle" className="fill-[var(--app-text-muted)] text-[11px]">
                {p.label}
              </text>
            ) : null
          )}

          <rect x={pad.left} y={pad.top} width={viewW - pad.left - pad.right} height={innerH} fill="transparent" />
        </svg>
      </div>
    </div>
  );
}
