import type { MasterHistoryTradeRow } from "@/lib/api/copier";
import type {
  ChartPeriod,
  EquityGrowthPoint,
  MasterClosedOrder,
  MasterTradeDirection,
  TimeRange,
  TradeDistributionPoint,
} from "@/lib/mock/masterDetail";

function parseTradeDate(value: string): Date | null {
  if (!value || value === "—") return null;
  const d = new Date(value.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDateGroup(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  if (day.getTime() === today.getTime()) return "Today";
  if (day.getTime() === yesterday.getTime()) return "Yesterday";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDuration(openTime: string, closeTime: string): string {
  const open = parseTradeDate(openTime);
  const close = parseTradeDate(closeTime);
  if (!open || !close) return "—";
  let secs = Math.max(0, Math.floor((close.getTime() - open.getTime()) / 1000));
  const days = Math.floor(secs / 86400);
  secs %= 86400;
  const hours = Math.floor(secs / 3600);
  secs %= 3600;
  const mins = Math.floor(secs / 60);
  secs %= 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${String(hours).padStart(2, "0")}h`);
  if (mins > 0) parts.push(`${String(mins).padStart(2, "0")}m`);
  parts.push(`${String(secs).padStart(2, "0")}s`);
  return parts.join(" ");
}

function toDirection(type: string): MasterTradeDirection {
  return type.toUpperCase() === "SELL" ? "sell" : "buy";
}

function sortedTrades(trades: MasterHistoryTradeRow[]) {
  return [...trades].sort((a, b) => {
    const da = parseTradeDate(a.closeTime)?.getTime() ?? 0;
    const db = parseTradeDate(b.closeTime)?.getTime() ?? 0;
    return da - db;
  });
}

function tradesInRange(trades: MasterHistoryTradeRow[], range: TimeRange) {
  if (range === "ALL") return trades;
  const days: Record<TimeRange, number> = { "2W": 14, "1M": 30, "3M": 90, "6M": 180, ALL: 99999 };
  const cutoff = Date.now() - days[range] * 86400000;
  return trades.filter((t) => {
    const d = parseTradeDate(t.closeTime);
    return d ? d.getTime() >= cutoff : false;
  });
}

function periodEnd(): Date {
  return new Date();
}

function periodStart(period: ChartPeriod): Date {
  const end = periodEnd();
  const start = new Date(end);
  if (period === "day") start.setHours(start.getHours() - 23);
  else if (period === "week") start.setDate(start.getDate() - 6);
  else if (period === "month") start.setDate(start.getDate() - 29);
  else start.setMonth(start.getMonth() - 11);
  start.setHours(0, 0, 0, 0);
  return start;
}

function generatePeriodBuckets(period: ChartPeriod): Array<{ key: string; date: Date; label: string; timestamp: string }> {
  const end = periodEnd();
  const buckets: Array<{ key: string; date: Date; label: string; timestamp: string }> = [];

  if (period === "day") {
    for (let i = 23; i >= 0; i--) {
      const d = new Date(end);
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() - i);
      buckets.push({
        key: bucketKey(d, period),
        date: d,
        label: bucketLabel(d, period),
        timestamp: formatTimestamp(d),
      });
    }
    return buckets;
  }

  const count = period === "week" ? 7 : period === "month" ? 30 : 12;
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setHours(12, 0, 0, 0);
    if (period === "year") d.setMonth(d.getMonth() - i, 1);
    else d.setDate(d.getDate() - i);
    buckets.push({
      key: bucketKey(d, period),
      date: d,
      label: bucketLabel(d, period),
      timestamp: formatTimestamp(d),
    });
  }
  return buckets;
}

function aggregateTradesByBucket(trades: MasterHistoryTradeRow[], period: ChartPeriod) {
  const start = periodStart(period);
  const bucketTotals = new Map<string, number>();

  for (const trade of sortedTrades(trades)) {
    const d = parseTradeDate(trade.closeTime);
    if (!d || d < start) continue;
    const key = bucketKey(d, period);
    bucketTotals.set(key, (bucketTotals.get(key) ?? 0) + trade.profit);
  }

  return generatePeriodBuckets(period).map((b, i) => ({
    dealId: String(i + 1),
    label: b.label,
    timestamp: b.timestamp,
    value: Math.round((bucketTotals.get(b.key) ?? 0) * 100) / 100,
  }));
}

function bucketKey(d: Date, period: ChartPeriod): string {
  if (period === "day") {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
  }
  if (period === "year") {
    return `${d.getFullYear()}-${d.getMonth()}`;
  }
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function bucketLabel(d: Date, period: ChartPeriod): string {
  if (period === "day") {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  if (period === "week") {
    return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
  }
  if (period === "year") {
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function formatTimestamp(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const sec = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}, ${hh}:${min}:${sec}`;
}

export function tradesToClosedOrders(trades: MasterHistoryTradeRow[]): MasterClosedOrder[] {
  return sortedTrades(trades)
    .map((t) => {
      const closed = parseTradeDate(t.closeTime);
      if (!closed) return null;
      return {
        id: t.id,
        dateGroup: formatDateGroup(closed),
        symbol: t.symbol || "—",
        lots: t.volume,
        direction: toDirection(t.type),
        closeTime: formatTime(closed),
        duration: formatDuration(t.openTime, t.closeTime),
        profit: t.profit,
      };
    })
    .filter((r): r is MasterClosedOrder => r != null)
    .reverse();
}

export function tradesToEquityGrowth(trades: MasterHistoryTradeRow[], period: ChartPeriod): EquityGrowthPoint[] {
  const distribution = aggregateTradesByBucket(trades, period);
  let cumulative = 0;
  return distribution.map((b) => {
    cumulative += b.value;
    return {
      label: b.label,
      timestamp: b.timestamp,
      value: Math.round(cumulative * 100) / 100,
    };
  });
}

export function tradesToTradeDistribution(
  trades: MasterHistoryTradeRow[],
  period: ChartPeriod
): TradeDistributionPoint[] {
  return aggregateTradesByBucket(trades, period);
}

export function distributionSummary(data: TradeDistributionPoint[]) {
  let net = 0;
  let wins = 0;
  let losses = 0;
  for (const d of data) {
    net += d.value;
    if (d.value > 0) wins += 1;
    else if (d.value < 0) losses += 1;
  }
  return {
    net: Math.round(net * 100) / 100,
    wins,
    losses,
    periods: data.length,
  };
}

export function tradesToPerformance(
  trades: MasterHistoryTradeRow[],
  range: TimeRange,
  balance: number,
  copiers: number,
  copiersDelta: number
) {
  const scoped = tradesInRange(trades, range);
  let profit = 0;
  let loss = 0;
  for (const t of scoped) {
    if (t.profit > 0) profit += t.profit;
    else if (t.profit < 0) loss += Math.abs(t.profit);
  }
  const net = profit - loss;
  const gainPct = balance > 0 ? (net / balance) * 100 : 0;
  return {
    gainPct: Math.round(gainPct * 10) / 10,
    copiers,
    copiersDelta,
    profit: Math.round(profit * 100) / 100,
    loss: Math.round(loss * 100) / 100,
  };
}

export function tradesToProfitLoss(trades: MasterHistoryTradeRow[]) {
  let profit = 0;
  let loss = 0;
  for (const t of trades) {
    if (t.profit > 0) profit += t.profit;
    else if (t.profit < 0) loss += Math.abs(t.profit);
  }
  return { profit: Math.round(profit * 100) / 100, loss: Math.round(loss * 100) / 100 };
}
