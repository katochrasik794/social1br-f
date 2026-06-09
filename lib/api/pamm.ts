import { apiRequest } from "./http";

export type PammSettings = {
  enablePamm: boolean;
  showOnDashboard: boolean;
  minInvestment: number;
  platformFeePct: number;
  forceKyc: boolean;
};

export type PammPool = {
  id: string;
  name: string;
  managerName: string;
  minDeposit: number;
  feePct: number;
  managementFeePct: number;
  riskProfile: "Low" | "Medium" | "High";
  nav: number;
  monthlyReturnPct: number;
  investorsCount: number;
  status: string;
};

export type PammInvestment = {
  id: string;
  poolId: string | null;
  poolName: string;
  amount: number;
  sharePct: number;
  pnlPct: number;
  status: string;
  investedAt: string;
};

export type PammInvestorDashboard = {
  settings: PammSettings;
  pools: PammPool[];
  investments: PammInvestment[];
  summary: {
    totalInvested: number;
    activePools: number;
    avgReturnPct: number;
    pendingWithdrawals: number;
    activeInvestments: number;
  };
};

export async function fetchPammSettings() {
  return apiRequest<PammSettings>("/pamm/settings", { tokenKey: "user" });
}

export async function fetchPammInvestorDashboard() {
  return apiRequest<PammInvestorDashboard>("/pamm/investor", { tokenKey: "user" });
}
