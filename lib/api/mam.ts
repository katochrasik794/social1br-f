import { apiRequest } from "./http";

export type MamSettings = {
  enableMam: boolean;
  showOnDashboard: boolean;
  minAccountBalance: number;
  platformFeePct: number;
  forceKyc: boolean;
};

export type MamManager = {
  id: string;
  displayName: string;
  headline: string;
  winRate: number;
  followersCount: number;
  feePct: number;
  lotScaling: string;
  aum: number;
  monthlyReturnPct: number;
  riskLevel: "Low" | "Medium" | "High";
  status: string;
};

export type MamLink = {
  id: string;
  managerId: string | null;
  managerName: string;
  accountLogin: string;
  lotMultiplier: number;
  maxLot: number;
  pnlPct: number;
  status: string;
  linkedAt: string;
};

export type MamInvestorDashboard = {
  settings: MamSettings;
  managers: MamManager[];
  links: MamLink[];
  summary: {
    linkedAccounts: number;
    totalAum: number;
    avgPnlPct: number;
    activeManagers: number;
  };
};

export async function fetchMamSettings() {
  return apiRequest<MamSettings>("/mam/settings", { tokenKey: "user" });
}

export async function fetchMamInvestorDashboard() {
  return apiRequest<MamInvestorDashboard>("/mam/investor", { tokenKey: "user" });
}
