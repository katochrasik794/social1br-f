import type { MasterHistoryTradeRow } from "@/lib/api/copier";
import type { CopierSummaryStats } from "@/lib/mock/copierArea";
import type { MasterSummaryBottom } from "@/lib/mock/masterArea";

const PAIR_COLORS = ["#3b82f6", "var(--app-primary-solid)", "#8b5cf6", "#f59e0b"];

function parseCloseDate(closeTime: string): Date | null {
  if (!closeTime || closeTime === "—") return null;
  const d = new Date(closeTime.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function computeSummaryFromTrades(
  trades: MasterHistoryTradeRow[],
  opts: { balance: number; equity: number; leverage?: string }
): { summaryStats: CopierSummaryStats; summaryBottom: MasterSummaryBottom } {
  let grossProfit = 0;
  let grossLoss = 0;
  let winCount = 0;
  let lossCount = 0;
  let buyCount = 0;
  let sellCount = 0;
  const symbolCounts = new Map<string, number>();

  const dailyProfit = new Map<string, number>();
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  let monthProfit = 0;

  for (const trade of trades) {
    const profit = Number(trade.profit) || 0;
    const type = trade.type.toUpperCase();

    if (profit > 0) {
      grossProfit += profit;
      winCount += 1;
    } else if (profit < 0) {
      grossLoss += Math.abs(profit);
      lossCount += 1;
    }

    if (type === "BUY") buyCount += 1;
    else if (type === "SELL") sellCount += 1;

    const symbol = trade.symbol?.trim();
    if (symbol && symbol !== "—") {
      symbolCounts.set(symbol, (symbolCounts.get(symbol) ?? 0) + 1);
    }

    const closed = parseCloseDate(trade.closeTime);
    if (closed) {
      const key = dateKey(closed);
      dailyProfit.set(key, (dailyProfit.get(key) ?? 0) + profit);
      if (key.startsWith(monthKey)) {
        monthProfit += profit;
      }
    }
  }

  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;

  const topSymbols = [...symbolCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([symbol, count], i) => ({
      symbol,
      count,
      color: PAIR_COLORS[i] ?? PAIR_COLORS[0],
    }));

  const balance = opts.balance > 0 ? opts.balance : 1;
  const dailyPcts = [...dailyProfit.values()].map((p) => (p / balance) * 100);
  const avgDailyPct =
    dailyPcts.length > 0 ? dailyPcts.reduce((s, v) => s + v, 0) / dailyPcts.length : 0;
  const monthPct = (monthProfit / balance) * 100;

  return {
    summaryStats: {
      profitFactor: Math.round(profitFactor * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossLoss: Math.round(grossLoss * 100) / 100,
      winCount,
      lossCount,
      buyCount,
      sellCount,
      pairs: topSymbols,
    },
    summaryBottom: {
      equity: opts.equity,
      balance: opts.balance,
      leverage: opts.leverage ?? "—",
      avgDailyPct: Math.round(avgDailyPct * 10) / 10,
      monthPct: Math.round(monthPct * 10) / 10,
    },
  };
}
