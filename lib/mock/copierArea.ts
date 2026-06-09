export type CopierMasterHistoryEntry = {
  id: string;
  masterId: string | number;
  masterName: string;
  expertise: string;
  profit: number;
  gainPct: number;
  isActive: boolean;
  suspicious?: boolean;
};

export type CopierAccountMetrics = {
  name: string;
  country: string;
  countryCode: string;
  profit: number;
  floatingProfit: number;
  equity: number;
  gainPct: number;
};

export type CopierSummaryStats = {
  profitFactor: number;
  grossProfit: number;
  grossLoss: number;
  winCount: number;
  lossCount: number;
  buyCount: number;
  sellCount: number;
  pairs: { symbol: string; count: number; color: string }[];
};

export type CopierTradePoint = {
  date: string;
  profit: number;
};

export type CopierHistoryTrade = {
  id: string;
  orderId: string;
  volume: number;
  type: "Withdrawal" | "Bonus" | "BUY" | "SELL";
  symbol?: string;
  openTime?: string;
  closeTime?: string;
  openPrice?: string;
  closePrice?: string;
  commission?: string;
  profit: number;
};

export type CopierMasterBundle = {
  master: CopierMasterHistoryEntry;
  summary: CopierSummaryStats;
  tradePoints: CopierTradePoint[];
  closedTrades: CopierHistoryTrade[];
  openTrades: CopierHistoryTrade[];
};

/** Logged-in copier — shown in the top card */
export const mockCopierAccount: CopierAccountMetrics = {
  name: "Master Trader Alex",
  country: "India",
  countryCode: "IN",
  profit: 107.86,
  floatingProfit: 12.4,
  equity: 5120.0,
  gainPct: 12.4,
};

/** Two different masters — one profitable, one losing */
export const mockCopierMasters: CopierMasterHistoryEntry[] = [
  {
    id: "m-alliance",
    masterId: 1,
    masterName: "ALLIANCE_Fx",
    expertise: "High achiever",
    profit: 124.5,
    gainPct: 18.4,
    isActive: true,
  },
  {
    id: "m-ujie",
    masterId: 2,
    masterName: "GoldPulse",
    expertise: "High achiever",
    profit: -16.64,
    gainPct: -32.61,
    isActive: true,
    suspicious: true,
  },
];

const MASTER_BUNDLES: Record<number, Omit<CopierMasterBundle, "master">> = {
  1: {
    summary: {
      profitFactor: 2.14,
      grossProfit: 186.4,
      grossLoss: 61.9,
      winCount: 12,
      lossCount: 4,
      buyCount: 6,
      sellCount: 10,
      pairs: [
        { symbol: "EURUSD", count: 8, color: "#3b82f6" },
        { symbol: "GBPUSD", count: 5, color: "var(--app-primary-solid)" },
      ],
    },
    tradePoints: [
      { date: "2026-05-28", profit: 12.4 },
      { date: "2026-05-29", profit: 28.6 },
      { date: "2026-05-30", profit: 45.2 },
      { date: "2026-05-31", profit: 62.8 },
      { date: "2026-06-01", profit: 78.4 },
      { date: "2026-06-02", profit: 96.1 },
      { date: "2026-06-03", profit: 108.5 },
      { date: "2026-06-04", profit: 124.5 },
    ],
    closedTrades: [
      { id: "a1", orderId: "#148001220", volume: 0, type: "Bonus", profit: 15.0 },
      { id: "a2", orderId: "#148001221", volume: 0.02, type: "BUY", symbol: "EURUSD", openTime: "2026-06-01 09:12:00", closeTime: "2026-06-01 14:30:00", openPrice: "1.08432", closePrice: "1.08610", commission: "—", profit: 42.8 },
      { id: "a3", orderId: "#148001222", volume: 0.01, type: "BUY", symbol: "GBPUSD", openTime: "2026-06-02 10:05:00", closeTime: "2026-06-02 16:22:00", openPrice: "1.27104", closePrice: "1.27388", commission: "—", profit: 38.6 },
      { id: "a4", orderId: "#148001223", volume: 0.02, type: "SELL", symbol: "EURUSD", openTime: "2026-06-03 11:40:00", closeTime: "2026-06-03 15:18:00", openPrice: "1.08750", closePrice: "1.08602", commission: "—", profit: 28.1 },
    ],
    openTrades: [
      { id: "ao1", orderId: "#148001300", volume: 0.01, type: "BUY", symbol: "EURUSD", openTime: "2026-06-05 08:20:00", openPrice: "1.08812", commission: "—", profit: 6.2 },
    ],
  },
  2: {
    summary: {
      profitFactor: 0.28,
      grossProfit: 6.44,
      grossLoss: 23.08,
      winCount: 3,
      lossCount: 5,
      buyCount: 0,
      sellCount: 8,
      pairs: [
        { symbol: "EURCHF", count: 5, color: "#3b82f6" },
        { symbol: "EURJPY", count: 3, color: "var(--app-primary-solid)" },
      ],
    },
    tradePoints: [
      { date: "2020-04-27", profit: -18.5 },
      { date: "2020-04-28", profit: -12.2 },
      { date: "2020-04-29", profit: -8.4 },
      { date: "2020-04-30", profit: -15.1 },
      { date: "2020-05-01", profit: -6.8 },
      { date: "2020-05-02", profit: -10.3 },
      { date: "2020-05-03", profit: -4.2 },
      { date: "2020-05-04", profit: -16.64 },
    ],
    closedTrades: [
      { id: "t1", orderId: "#132556815", volume: 0, type: "Withdrawal", profit: -34.38 },
      { id: "t2", orderId: "#132557088", volume: 0, type: "Bonus", profit: 4.54 },
      { id: "t3", orderId: "#132581452", volume: 0.02, type: "SELL", symbol: "EURCHF", openTime: "2020-04-27 09:15:22", closeTime: "2020-04-27 11:42:08", openPrice: "1.05632", closePrice: "1.05598", commission: "—", profit: -1.82 },
      { id: "t4", orderId: "#132581453", volume: 0.02, type: "SELL", symbol: "EURJPY", openTime: "2020-04-27 14:20:11", closeTime: "2020-04-27 16:05:44", openPrice: "117.452", closePrice: "117.518", commission: "—", profit: 2.14 },
    ],
    openTrades: [
      { id: "o1", orderId: "#132590001", volume: 0.01, type: "SELL", symbol: "EURCHF", openTime: "2020-05-04 09:12:00", openPrice: "1.05812", commission: "—", profit: -2.48 },
      { id: "o2", orderId: "#132590002", volume: 0.02, type: "SELL", symbol: "EURJPY", openTime: "2020-05-04 11:45:22", openPrice: "117.892", commission: "—", profit: 1.06 },
    ],
  },
};

export function getCopierMasterBundle(masterId: number): CopierMasterBundle {
  const master = mockCopierMasters.find((m) => m.masterId === masterId) ?? mockCopierMasters[0];
  const bundle = MASTER_BUNDLES[masterId] ?? MASTER_BUNDLES[1];
  return { master, ...bundle };
}

export type SummaryPeriod = "day" | "week" | "month" | "year";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function getCopierSummaryForPeriod(masterId: number, period: SummaryPeriod) {
  const bundle = getCopierMasterBundle(masterId);
  const factors: Record<SummaryPeriod, number> = { day: 0.1, week: 0.28, month: 0.62, year: 1 };
  const slices: Record<SummaryPeriod, number> = { day: 1, week: 2, month: 4, year: bundle.tradePoints.length };
  const f = factors[period];

  const summary: CopierSummaryStats = {
    ...bundle.summary,
    profitFactor: round2(Math.max(0.1, bundle.summary.profitFactor * (0.45 + f))),
    grossProfit: round2(bundle.summary.grossProfit * f),
    grossLoss: round2(bundle.summary.grossLoss * f),
    winCount: Math.max(1, Math.round(bundle.summary.winCount * f)),
    lossCount: Math.max(1, Math.round(bundle.summary.lossCount * f)),
    buyCount: Math.max(0, Math.round(bundle.summary.buyCount * f)),
    sellCount: Math.max(1, Math.round(bundle.summary.sellCount * f)),
    pairs: bundle.summary.pairs.map((p) => ({
      ...p,
      count: Math.max(1, Math.round(p.count * f)),
    })),
  };

  const tradePoints = bundle.tradePoints.slice(-slices[period]);

  return { summary, tradePoints };
}

/** @deprecated use getCopierMasterBundle */
export function getCopierSummaryForMaster(masterId: number): CopierSummaryStats {
  return getCopierMasterBundle(masterId).summary;
}
