"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import type { MasterCumulativePoint } from "@/lib/mock/masterArea";
import { buildYTicks, computeYDomain, formatTooltipMoney } from "@/components/copier/charts/chartShared";

type MasterCumulativeChartProps = {
  data: MasterCumulativePoint[];
};

const VIEW_W = 820;
const VIEW_H = 260;
const PAD = { top: 14, right: 16, bottom: 32, left: 54 };

export default function MasterCumulativeChart({ data }: MasterCumulativeChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fillId = useId().replace(/:/g, "");

  const innerH = VIEW_H - PAD.top - PAD.bottom;
  const innerW = VIEW_W - PAD.left - PAD.right;

  const yDomain = useMemo(() => computeYDomain(data.map((d) => d.value), 5), [data]);
  const yTicks = useMemo(() => buildYTicks(yDomain.min, yDomain.max, yDomain.step), [yDomain]);

  const points = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        x: PAD.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
        y: PAD.top + ((yDomain.max - d.value) / (yDomain.max - yDomain.min || 1)) * innerH,
      })),
    [data, innerW, innerH, yDomain]
  );

  const linePath = useMemo(() => points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" "), [points]);
  const baseY = PAD.top + innerH;
  const areaPath = useMemo(() => {
    if (!points.length) return "";
    return `${linePath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;
  }, [linePath, points, baseY]);

  const active = hoverIndex !== null ? points[hoverIndex] : null;
  const isLoss = data[data.length - 1]?.value < 0;
  const strokeColor = isLoss ? "#f87171" : "var(--app-primary-solid)";

  const handlePointer = useCallback(
    (clientX: number) => {
      const svg = svgRef.current;
      if (!svg || !points.length) return;
      const rect = svg.getBoundingClientRect();
      const relX = ((clientX - rect.left) / rect.width) * VIEW_W - PAD.left;
      const ratio = Math.max(0, Math.min(1, relX / innerW));
      setHoverIndex(Math.round(ratio * Math.max(points.length - 1, 0)));
    },
    [points.length, innerW]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-[var(--app-text-primary)]">Performance Over Time</h3>
          <p className="mt-0.5 text-[11px] font-medium text-[var(--app-text-muted)]">Cumulative profit and loss from copied trades.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-xs font-bold text-[var(--app-text-primary)] shadow-sm outline-none transition focus:border-[color:var(--app-primary-solid)]">
            <option>Cumulative P/L</option>
          </select>
        </div>
      </div>

      <div className="relative">
        {active ? (
          <div
            className="pointer-events-none absolute z-20 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2.5 shadow-xl transition-all duration-200"
            style={{
              left: `${(active.x / VIEW_W) * 100}%`,
              top: `${(active.y / VIEW_H) * 100}%`,
              transform: "translate(-50%, calc(-100% - 20px))",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">{active.date}</p>
            <p className={`mt-1 text-base font-bold ${active.value < 0 ? "text-rose-500" : "text-[color:var(--app-primary-solid)]"}`}>
              {formatTooltipMoney(active.value)}
            </p>
          </div>
        ) : null}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full cursor-crosshair overflow-visible"
          onMouseMove={(e) => handlePointer(e.clientX)}
          onMouseLeave={() => setHoverIndex(null)}
          role="img"
          aria-label="Cumulative performance chart"
        >
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {yTicks.map((val) => {
            const y = PAD.top + ((yDomain.max - val) / (yDomain.max - yDomain.min || 1)) * innerH;
            return (
              <g key={val}>
                <line x1={PAD.left} y1={y} x2={VIEW_W - PAD.right} y2={y} stroke="var(--app-border)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                <text x={PAD.left - 12} y={y + 4} textAnchor="end" className="fill-[var(--app-text-muted)] text-[10px] font-medium">
                  {formatTooltipMoney(val)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#${fillId})`} />
          
          {/* Main Line */}
          <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Active State Line & Point */}
          {active ? (
            <>
              <line x1={active.x} y1={PAD.top} x2={active.x} y2={baseY} stroke="var(--app-text-muted)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
              <circle cx={active.x} cy={active.y} r="6" fill={strokeColor} stroke="white" strokeWidth="3" className="shadow-lg" />
            </>
          ) : null}

          {/* X Axis Labels */}
          {points.map((p, i) =>
            i % 2 === 0 || i === points.length - 1 ? (
              <text key={p.date} x={p.x} y={VIEW_H - 4} textAnchor="middle" className="fill-[var(--app-text-muted)] text-[10px] font-bold uppercase tracking-wider">
                {p.date}
              </text>
            ) : null
          )}

          <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} fill="transparent" />
        </svg>
      </div>
    </div>
  );
}
