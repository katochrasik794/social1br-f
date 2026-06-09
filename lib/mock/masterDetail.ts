export type MasterTradeDirection = "buy" | "sell";

export type MasterClosedOrder = {
  id: string;
  dateGroup: string;
  symbol: string;
  lots: number;
  direction: MasterTradeDirection;
  closeTime: string;
  duration: string;
  profit: number;
};

export type MasterOpenOrder = {
  id: string;
  dateGroup: string;
  symbol: string;
  lots: number;
  direction: MasterTradeDirection;
  openTime: string;
  duration: string;
  profit: number;
};

export type MasterBalanceOp = {
  id: string;
  dateGroup: string;
  type: "withdrawal" | "bonus";
  time: string;
  amount: number;
};

export type ChartPeriod = "day" | "week" | "month" | "year";

export type EquityGrowthPoint = {
  timestamp: string;
  label: string;
  value: number;
};

export type TradeDistributionPoint = {
  dealId: string;
  label: string;
  value: number;
  timestamp?: string;
};

export type MasterAccountDetails = {
  equity: number;
  withUsDays: number;
  floatingProfit: number;
  balance: number;
  bonus: number;
  leverage: string;
  maxUnrealisedLoss: number;
  maxDrawdownDuration: string;
  strategySegments: string[];
  telegramLink?: string;
};

export type TimeRange = "2W" | "1M" | "3M" | "6M" | "ALL";

const CLOSED_TEMPLATE: Omit<MasterClosedOrder, "id">[] = [
  { dateGroup: "Yesterday", symbol: "EURUSD", lots: 0.01, direction: "sell", closeTime: "21:49", duration: "01h 48m 37s", profit: 0.5 },
  { dateGroup: "Yesterday", symbol: "GBPUSD", lots: 0.01, direction: "buy", closeTime: "19:22", duration: "03h 12m 08s", profit: 1.24 },
  { dateGroup: "2026-06-05", symbol: "EURUSD", lots: 0.01, direction: "sell", closeTime: "16:10", duration: "2d 04h 41m 43s", profit: 0.5 },
  { dateGroup: "2026-06-05", symbol: "GBPUSD", lots: 0.01, direction: "buy", closeTime: "14:33", duration: "1d 08h 15m 22s", profit: 2.18 },
  { dateGroup: "2026-06-02", symbol: "EURUSD", lots: 0.02, direction: "buy", closeTime: "11:05", duration: "05h 30m 11s", profit: 3.42 },
  { dateGroup: "2026-06-02", symbol: "XAUUSD", lots: 0.01, direction: "sell", closeTime: "09:18", duration: "02h 44m 55s", profit: -1.12 },
];

const OPEN_TEMPLATE: Omit<MasterOpenOrder, "id">[] = [
  { dateGroup: "2026-06-05", symbol: "EURUSD", lots: 0.01, direction: "buy", openTime: "16:11", duration: "3d 07h 59m 52s", profit: -5.98 },
  { dateGroup: "2026-06-05", symbol: "GBPUSD", lots: 0.01, direction: "buy", openTime: "12:44", duration: "3d 11h 26m 18s", profit: -3.21 },
];

const BALANCE_TEMPLATE: Omit<MasterBalanceOp, "id">[] = [
  { dateGroup: "2026-04-13", type: "withdrawal", time: "12:47", amount: -9 },
  { dateGroup: "2026-04-13", type: "bonus", time: "10:15", amount: 8.41 },
  { dateGroup: "2026-04-10", type: "withdrawal", time: "18:22", amount: -25 },
  { dateGroup: "2026-04-10", type: "bonus", time: "09:00", amount: 15.5 },
];

function withIds<T extends { dateGroup: string }>(rows: T[], prefix: string): (T & { id: string })[] {
  return rows.map((r, i) => ({ ...r, id: `${prefix}-${i}` }));
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

function equityCurveValue(masterId: number, progress: number, index: number) {
  const t = progress;
  if (t < 0.18) return -120 - (masterId % 7) * 40 - index * 35;
  if (t < 0.32) return -800 - (t - 0.18) * 6000;
  if (t < 0.48) return -1821 - (masterId % 5) * 90;
  if (t < 0.62) return -3200 - (t - 0.48) * 14000;
  return -12000 + Math.sin(index * 0.6 + masterId) * 120;
}

export function getEquityGrowth(masterId: number, period: ChartPeriod = "month"): EquityGrowthPoint[] {
  const end = new Date("2026-06-09T16:00:00");
  const points: EquityGrowthPoint[] = [];

  const configs: Record<ChartPeriod, { count: number; step: (d: Date, i: number) => Date; label: (d: Date) => string }> = {
    day: {
      count: 24,
      step: (d, i) => {
        const next = new Date(d);
        next.setHours(next.getHours() - (23 - i));
        return next;
      },
      label: (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    },
    week: {
      count: 7,
      step: (d, i) => {
        const next = new Date(d);
        next.setDate(next.getDate() - (6 - i));
        return next;
      },
      label: (d) => d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
    },
    month: {
      count: 30,
      step: (d, i) => {
        const next = new Date(d);
        next.setDate(next.getDate() - (29 - i));
        return next;
      },
      label: (d) => d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    },
    year: {
      count: 12,
      step: (d, i) => {
        const next = new Date(d);
        next.setMonth(next.getMonth() - (11 - i));
        return next;
      },
      label: (d) => d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    },
  };

  const cfg = configs[period];
  for (let i = 0; i < cfg.count; i++) {
    const d = cfg.step(end, i);
    const progress = cfg.count <= 1 ? 0 : i / (cfg.count - 1);
    points.push({
      timestamp: formatTimestamp(d),
      label: cfg.label(d),
      value: Math.round(equityCurveValue(masterId, progress, i) * 100) / 100,
    });
  }

  return points;
}

export function getTradeDistribution(masterId: number, period: ChartPeriod = "month"): TradeDistributionPoint[] {
  const end = new Date("2026-06-09T16:00:00");
  const baseDeal = 14794700 + masterId * 113;
  const points: TradeDistributionPoint[] = [];

  if (period === "day") {
    for (let i = 0; i < 20; i++) {
      const d = new Date(end);
      d.setMinutes(d.getMinutes() - (19 - i) * 45);
      const wave = Math.sin(i * 0.55 + masterId) * 700;
      const value = Math.round((-1400 + wave + (i % 4) * -380) * 100) / 100;
      points.push({
        dealId: String(baseDeal + i * 7),
        label: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        timestamp: formatTimestamp(d),
        value: i % 9 === 0 ? Math.abs(value) * 0.4 : value,
      });
    }
    return points;
  }

  const bucketConfigs: Record<Exclude<ChartPeriod, "day">, { count: number; step: (d: Date, i: number) => Date; label: (d: Date) => string }> = {
    week: {
      count: 7,
      step: (d, i) => {
        const next = new Date(d);
        next.setDate(next.getDate() - (6 - i));
        return next;
      },
      label: (d) => d.toLocaleDateString("en-US", { weekday: "short" }),
    },
    month: {
      count: 30,
      step: (d, i) => {
        const next = new Date(d);
        next.setDate(next.getDate() - (29 - i));
        return next;
      },
      label: (d) => d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    },
    year: {
      count: 12,
      step: (d, i) => {
        const next = new Date(d);
        next.setMonth(next.getMonth() - (11 - i));
        return next;
      },
      label: (d) => d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    },
  };

  const cfg = bucketConfigs[period];
  for (let i = 0; i < cfg.count; i++) {
    const d = cfg.step(end, i);
    const wave = Math.sin(i * 0.45 + masterId) * 900;
    const bias = i > cfg.count * 0.55 ? -6800 : -1200;
    const tradesInBucket = period === "year" ? 18 : period === "week" ? 4 : 2;
    const value = Math.round((bias + wave + (i % 5) * -420) * tradesInBucket * 100) / 100;

    points.push({
      dealId: String(baseDeal + i * 31),
      label: cfg.label(d),
      timestamp: formatTimestamp(d),
      value: i % 11 === 0 ? Math.abs(value) * 0.35 : value,
    });
  }

  return points;
}

export function getMasterClosedOrders(masterId: number): MasterClosedOrder[] {
  const mult = 1 + (masterId % 3) * 0.15;
  return withIds(
    CLOSED_TEMPLATE.map((r) => ({ ...r, profit: Math.round(r.profit * mult * 100) / 100 })),
    `closed-${masterId}`
  );
}

export function getMasterOpenOrders(masterId: number): MasterOpenOrder[] {
  const mult = 1 + (masterId % 4) * 0.1;
  return withIds(
    OPEN_TEMPLATE.map((r) => ({ ...r, profit: Math.round(r.profit * mult * 100) / 100 })),
    `open-${masterId}`
  );
}

export function getMasterBalanceOps(masterId: number): MasterBalanceOp[] {
  const mult = 1 + (masterId % 3) * 0.2;
  return withIds(
    BALANCE_TEMPLATE.map((r) => ({ ...r, amount: Math.round(r.amount * mult * 100) / 100 })),
    `bal-${masterId}`
  );
}

export function groupByDate<T extends { dateGroup: string }>(rows: T[]) {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const list = map.get(row.dateGroup) ?? [];
    list.push(row);
    map.set(row.dateGroup, list);
  }
  return Array.from(map.entries()).map(([dateLabel, items]) => ({ dateLabel, items }));
}

const STRATEGY_SEGMENTS: Record<number, string[]> = {
  1: [
    "Experienced forex scalp traders",
    "High-precision trade ➡️ Fixed target🎯",
    "💸Small equity ➡️ high profit🤑",
    "🛡️ Minimal risk strategy",
    "24 hours customer support on Telegram",
  ],
};

export function getMasterAccountDetails(masterId: number, master: { displayName: string; strategy: string; minCopyAmount: number; riskScore: number }): MasterAccountDetails {
  const seed = masterId * 17 + master.riskScore * 3;
  const equity = 40 + (seed % 80);
  const balance = equity + (seed % 20) - 10;
  const floatingProfit = -((seed % 40) + 5);
  const bonus = 5 + (seed % 15);

  return {
    equity: Math.round(equity * 100) / 100,
    withUsDays: 200 + (masterId * 47) % 400,
    floatingProfit: Math.round(floatingProfit * 100) / 100,
    balance: Math.round(balance * 100) / 100,
    bonus: Math.round(bonus * 100) / 100,
    leverage: "1:1000",
    maxUnrealisedLoss: Math.round(-(120 + (seed % 80)) * 100) / 100,
    maxDrawdownDuration: `${80 + (masterId * 13) % 120}d`,
    strategySegments:
      STRATEGY_SEGMENTS[masterId] ?? [
        master.strategy,
        "Strict risk management",
        "Transparent trade history",
      ],
    telegramLink:
      masterId === 1
        ? "https://t.me/Alliance4fixedIncome"
        : masterId <= 5
          ? `https://t.me/${master.displayName.replace(/\s/g, "")}`
          : undefined,
  };
}

export function getPerformanceForRange(
  master: { gainPct: number; copiers: number; copiersDelta: number; profit: number; loss: number },
  range: TimeRange
) {
  const factors: Record<TimeRange, number> = { "2W": 0.08, "1M": 0.22, "3M": 0.59, "6M": 0.82, ALL: 1 };
  const f = factors[range];
  const displayProfit = Math.round((45 + master.gainPct * 0.5) * f * 100) / 100;
  const displayLoss = Math.round(Math.max(0, 12 - master.gainPct * 0.08) * (1 - f) * 100) / 100;
  return {
    gainPct: Math.round(master.gainPct * f * 100) / 100,
    copiers: master.copiers,
    copiersDelta: Math.max(1, Math.round(master.copiersDelta * f)),
    profit: displayProfit,
    loss: displayLoss,
  };
}
