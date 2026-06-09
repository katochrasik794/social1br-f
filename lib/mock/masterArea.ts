import type { CopierSummaryStats, CopierTradePoint } from "@/lib/mock/copierArea";

export type MasterAccountHeader = {
  title: string;
  country: string;
  countryCode: string;
  profit: number;
  floatingProfit: number;
  equity: number;
  gainPct: number;
  profitChangePct: number;
};

export type MasterOverviewInfo = {
  linkedMaster: string;
  copyStatus: string;
  copyDuration: string;
  joinedOn: string;
  suspicious: boolean;
  followerLabel: string;
  followerProfit: number;
  followerGainPct: number;
};

export type MasterCumulativePoint = {
  date: string;
  value: number;
};

export type MasterAttachedAccount = {
  id: number;
  login: string;
  platform: "MT4" | "MT5";
  status: "Active" | "Archived";
  profit: number;
  floatingProfit: number;
  gainPct: number;
  commissionPerLot: number;
  riskScore: number;
};

export const mockMasterAttachedAccounts: MasterAttachedAccount[] = [
  {
    id: 1,
    login: "88210450",
    platform: "MT5",
    status: "Active",
    profit: 12450.8,
    floatingProfit: 320.5,
    gainPct: 18.4,
    commissionPerLot: 15,
    riskScore: 4,
  },
  {
    id: 2,
    login: "88210451",
    platform: "MT5",
    status: "Active",
    profit: 8420.5,
    floatingProfit: 180.0,
    gainPct: 14.2,
    commissionPerLot: 12,
    riskScore: 5,
  },
  {
    id: 3,
    login: "4090876",
    platform: "MT4",
    status: "Archived",
    profit: -4902.99,
    floatingProfit: 0,
    gainPct: -59.79,
    commissionPerLot: 15,
    riskScore: 6,
  },
];

export const mockMasterAccountHeader: MasterAccountHeader = {
  title: "Master Trader Alex",
  country: "India",
  countryCode: "IN",
  profit: 12450.8,
  floatingProfit: 320.5,
  equity: 45280.0,
  gainPct: 18.4,
  profitChangePct: 12.3,
};

export const mockMasterOverview: MasterOverviewInfo = {
  linkedMaster: "MT5 · 88210450",
  copyStatus: "Active",
  copyDuration: "142 days",
  joinedOn: "Oct 12, 2025",
  suspicious: false,
  followerLabel: "Copiers",
  followerProfit: 8420.5,
  followerGainPct: 14.2,
};

const BASE_SUMMARY: CopierSummaryStats = {
  profitFactor: 2.14,
  grossProfit: 18420.5,
  grossLoss: 8600.2,
  winCount: 78,
  lossCount: 42,
  buyCount: 52,
  sellCount: 68,
  pairs: [
    { symbol: "EURUSD", count: 45, color: "#3b82f6" },
    { symbol: "GBPUSD", count: 35, color: "var(--app-primary-solid)" },
  ],
};

const BASE_CUMULATIVE: MasterCumulativePoint[] = [
  { date: "May 10", value: 1200 },
  { date: "May 11", value: 2450 },
  { date: "May 12", value: 3100 },
  { date: "May 13", value: 4200 },
  { date: "May 14", value: 5800 },
  { date: "May 15", value: 7200 },
  { date: "May 16", value: 9100 },
  { date: "May 17", value: 10800 },
  { date: "May 18", value: 12450.8 },
];

export type MasterSummaryPeriod = "day" | "week" | "month" | "year";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function getMasterSummaryForPeriod(period: MasterSummaryPeriod) {
  const factors: Record<MasterSummaryPeriod, number> = { day: 0.12, week: 0.3, month: 0.65, year: 1 };
  const slices: Record<MasterSummaryPeriod, number> = {
    day: 2,
    week: 4,
    month: 6,
    year: BASE_CUMULATIVE.length,
  };
  const f = factors[period];

  const summary: CopierSummaryStats = {
    ...BASE_SUMMARY,
    profitFactor: round2(Math.max(0.1, BASE_SUMMARY.profitFactor * (0.5 + f))),
    grossProfit: round2(BASE_SUMMARY.grossProfit * f),
    grossLoss: round2(BASE_SUMMARY.grossLoss * f),
    winCount: Math.max(1, Math.round(BASE_SUMMARY.winCount * f)),
    lossCount: Math.max(1, Math.round(BASE_SUMMARY.lossCount * f)),
    buyCount: Math.max(0, Math.round(BASE_SUMMARY.buyCount * f)),
    sellCount: Math.max(1, Math.round(BASE_SUMMARY.sellCount * f)),
    pairs: BASE_SUMMARY.pairs.map((p) => ({ ...p, count: Math.max(1, Math.round(p.count * f)) })),
  };

  const cumulative = BASE_CUMULATIVE.slice(-slices[period]);
  const tradePoints: CopierTradePoint[] = cumulative.map((p) => ({ date: p.date, profit: p.value }));

  return { summary, cumulative, tradePoints };
}

export type MasterCommissionPayout = {
  id: string;
  weekLabel: string;
  amount: number;
};

export type MasterSummaryBottom = {
  equity: number;
  balance: number;
  leverage: string;
  avgDailyPct: number;
  monthPct: number;
};

export type MasterHistoryTrade = {
  id: string;
  orderId: string;
  volume: number;
  type: string;
  symbol?: string;
  openTime?: string;
  closeTime?: string;
  openPrice?: string;
  closePrice?: string;
  tpSl?: string;
  pips?: number;
  commission?: string;
  profit: number;
};

export type MasterSettings = {
  displayName: string;
  headline: string;
  strategy: string;
  commissionPct: number;
  minCopyAmount: number;
  riskLevel: string;
  publicProfile: boolean;
  acceptNewCopiers: boolean;
};

export const mockMasterCommissionPayouts: MasterCommissionPayout[] = [
  { id: "1", weekLabel: "10.05.2021 – 16.05.2021", amount: 1.5 },
  { id: "2", weekLabel: "03.05.2021 – 09.05.2021", amount: 0.3 },
  { id: "3", weekLabel: "26.04.2021 – 02.05.2021", amount: 1.2 },
];

export const mockMasterSummaryStats: CopierSummaryStats = {
  profitFactor: 0.45,
  grossProfit: 4195.21,
  grossLoss: 9289.69,
  winCount: 315,
  lossCount: 206,
  buyCount: 325,
  sellCount: 196,
  pairs: [
    { symbol: "EURUSD", count: 163, color: "#3b82f6" },
    { symbol: "GBPUSD", count: 64, color: "#f97316" },
    { symbol: "XAUUSD", count: 143, color: "var(--app-primary-solid)" },
    { symbol: "Other", count: 150, color: "#38bdf8" },
  ],
};

export const mockMasterSummaryBottom: MasterSummaryBottom = {
  equity: 45280,
  balance: 44800,
  leverage: "1:200",
  avgDailyPct: -0.05,
  monthPct: -1.46,
};

export const mockMasterClosedTrades: MasterHistoryTrade[] = [
  { id: "1", orderId: "#136084124", volume: 0, type: "Adjustment", profit: 0 },
  { id: "2", orderId: "#136084125", volume: 0, type: "Bonus", profit: 0.3 },
  { id: "3", orderId: "#136084126", volume: 0.3, type: "SELL", symbol: "GBPUSD", openTime: "2023-10-06 16:00", closeTime: "2023-10-06 16:24", openPrice: "1.21225", closePrice: "1.21656", tpSl: "—", pips: -43.1, commission: "—", profit: -84.15 },
  { id: "4", orderId: "#136084127", volume: 0.1, type: "SELL", symbol: "EURUSD", openTime: "2023-10-06 16:00", closeTime: "2023-10-06 16:24", openPrice: "1.21225", closePrice: "1.21656", tpSl: "—", pips: 9.6, commission: "—", profit: 3.08 },
  { id: "5", orderId: "#136084128", volume: 0.1, type: "SELL", symbol: "XAUUSD", openTime: "2023-10-06 16:00", closeTime: "2023-10-06 16:24", openPrice: "1.21225", closePrice: "1.21656", tpSl: "—", pips: -43.1, commission: "—", profit: -84.15 },
];

export const mockMasterOpenTrades: MasterHistoryTrade[] = [
  { id: "o1", orderId: "#136090001", volume: 0.05, type: "BUY", symbol: "EURUSD", openTime: "2026-06-08 09:15", openPrice: "1.08742", tpSl: "1.09200 / 1.08400", pips: 12.4, commission: "—", profit: 18.5 },
];

export type MasterAccountStatsBundle = {
  commissionPayouts: MasterCommissionPayout[];
  summaryStats: CopierSummaryStats;
  summaryBottom: MasterSummaryBottom;
  closedTrades: MasterHistoryTrade[];
  openTrades: MasterHistoryTrade[];
};

const ACCOUNT_STATS: Record<number, MasterAccountStatsBundle> = {
  1: {
    commissionPayouts: [
      { id: "1a", weekLabel: "10.05.2021 – 16.05.2021", amount: 2.4 },
      { id: "2a", weekLabel: "03.05.2021 – 09.05.2021", amount: 1.8 },
      { id: "3a", weekLabel: "26.04.2021 – 02.05.2021", amount: 3.1 },
      { id: "4a", weekLabel: "19.04.2021 – 25.04.2021", amount: 2.2 },
    ],
    summaryStats: {
      profitFactor: 2.14,
      grossProfit: 18420.5,
      grossLoss: 8600.2,
      winCount: 78,
      lossCount: 42,
      buyCount: 52,
      sellCount: 68,
      pairs: [
        { symbol: "EURUSD", count: 45, color: "#3b82f6" },
        { symbol: "GBPUSD", count: 35, color: "var(--app-primary-solid)" },
      ],
    },
    summaryBottom: { equity: 45280, balance: 44800, leverage: "1:200", avgDailyPct: 0.42, monthPct: 12.3 },
    closedTrades: [
      { id: "1", orderId: "#148001220", volume: 0.02, type: "BUY", symbol: "EURUSD", openTime: "2026-06-01 09:12", closeTime: "2026-06-01 14:30", openPrice: "1.08432", closePrice: "1.08610", tpSl: "—", pips: 17.8, commission: "—", profit: 42.8 },
      { id: "2", orderId: "#148001221", volume: 0.01, type: "BUY", symbol: "GBPUSD", openTime: "2026-06-02 10:05", closeTime: "2026-06-02 16:22", openPrice: "1.27104", closePrice: "1.27388", tpSl: "—", pips: 28.4, commission: "—", profit: 38.6 },
      { id: "3", orderId: "#148001222", volume: 0, type: "Bonus", profit: 15.0 },
    ],
    openTrades: [
      { id: "o1", orderId: "#148090001", volume: 0.05, type: "BUY", symbol: "EURUSD", openTime: "2026-06-08 09:15", openPrice: "1.08742", tpSl: "1.09200 / 1.08400", pips: 12.4, commission: "—", profit: 18.5 },
    ],
  },
  2: {
    commissionPayouts: mockMasterCommissionPayouts,
    summaryStats: mockMasterSummaryStats,
    summaryBottom: mockMasterSummaryBottom,
    closedTrades: mockMasterClosedTrades,
    openTrades: mockMasterOpenTrades,
  },
  3: {
    commissionPayouts: [
      { id: "1c", weekLabel: "10.05.2021 – 16.05.2021", amount: 0.1 },
      { id: "2c", weekLabel: "03.05.2021 – 09.05.2021", amount: 0.05 },
    ],
    summaryStats: {
      profitFactor: 0.28,
      grossProfit: 1200.0,
      grossLoss: 6102.99,
      winCount: 12,
      lossCount: 28,
      buyCount: 8,
      sellCount: 32,
      pairs: [
        { symbol: "EURCHF", count: 18, color: "#3b82f6" },
        { symbol: "EURJPY", count: 22, color: "var(--app-primary-solid)" },
      ],
    },
    summaryBottom: { equity: 0, balance: 0, leverage: "1:200", avgDailyPct: -2.1, monthPct: -59.79 },
    closedTrades: [
      { id: "1", orderId: "#136084124", volume: 0, type: "Adjustment", profit: 0 },
      { id: "2", orderId: "#136084125", volume: 0, type: "Bonus", profit: 0.3 },
      { id: "3", orderId: "#136084126", volume: 0.3, type: "SELL", symbol: "GBPUSD", openTime: "2023-10-06 16:00", closeTime: "2023-10-06 16:24", openPrice: "1.21225", closePrice: "1.21656", tpSl: "—", pips: -43.1, commission: "—", profit: -84.15 },
      { id: "4", orderId: "#136084127", volume: 0.1, type: "SELL", symbol: "EURUSD", openTime: "2023-10-06 16:00", closeTime: "2023-10-06 16:24", openPrice: "1.21225", closePrice: "1.21656", tpSl: "—", pips: -43.1, commission: "—", profit: -84.15 },
    ],
    openTrades: [],
  },
};

export function getMasterAccountStats(accountId: number): MasterAccountStatsBundle {
  return ACCOUNT_STATS[accountId] ?? ACCOUNT_STATS[1];
}

export const mockMasterSettings: MasterSettings = {
  displayName: "Master Trader Alex",
  headline: "Multi-asset swing trader",
  strategy: "Focus on EUR/USD and GBP/USD with 1:2 RR minimum",
  commissionPct: 20,
  minCopyAmount: 500,
  riskLevel: "Medium",
  publicProfile: true,
  acceptNewCopiers: true,
};
