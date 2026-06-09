export const CHART = {
  viewW: 820,
  viewH: 290,
  pad: { top: 14, right: 16, bottom: 32, left: 54 },
} as const;

export type ChartPad = typeof CHART.pad;

export function nearestIndex(clientX: number, rect: DOMRect, count: number, padLeft: number, padRight: number, viewW: number) {
  const innerW = viewW - padLeft - padRight;
  const relX = ((clientX - rect.left) / rect.width) * viewW - padLeft;
  const ratio = Math.max(0, Math.min(1, relX / innerW));
  return Math.round(ratio * Math.max(count - 1, 0));
}

export function valueToY(value: number, min: number, max: number, pad: ChartPad, viewH: number) {
  const innerH = viewH - pad.top - pad.bottom;
  const range = max - min || 1;
  return pad.top + ((max - value) / range) * innerH;
}

export function indexToX(index: number, count: number, pad: ChartPad, viewW: number) {
  const innerW = viewW - pad.left - pad.right;
  if (count <= 1) return pad.left + innerW / 2;
  return pad.left + (index / (count - 1)) * innerW;
}

export function formatAxisMoney(v: number) {
  if (v < 0) return `$${v}`;
  const abs = Math.abs(v);
  if (abs >= 10000) return `$${Math.round(v / 1000)}k`;
  if (abs >= 1000) return `$${(v / 1000).toFixed(abs >= 5000 ? 0 : 1)}k`;
  return `$${v}`;
}

export function formatTooltipMoney(v: number) {
  const formatted = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v < 0) return `$-${formatted}`;
  return `$${formatted}`;
}

export function computeYDomain(values: number[], steps = 5) {
  if (!values.length) return { min: -1000, max: 1000, step: 500 };
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values, 0);
  const span = Math.max(dataMax - dataMin, 100);
  const rawStep = span / steps;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = Math.ceil(rawStep / magnitude) * magnitude;
  const min = Math.floor(dataMin / step) * step;
  const max = Math.ceil(dataMax / step) * step || step;
  return { min, max, step: step || 1 };
}

export function buildYTicks(min: number, max: number, step: number) {
  const ticks: number[] = [];
  for (let v = max; v >= min - step * 0.01; v -= step) ticks.push(v);
  return ticks;
}

export function stepLinePath(points: { x: number; y: number }[]) {
  if (!points.length) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` H ${points[i].x} V ${points[i].y}`;
  }
  return d;
}

export function smoothLinePath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}
