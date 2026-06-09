import { apiRequest } from "./http";

export type CommissionModel = {
  id: string;
  label: string;
  description: string;
  minPct: number;
  maxPct: number;
};

export const COMMISSION_FROM_COPIERS_LABEL = "Commission from copiers";

export type CopierSettings = {
  enableCopier: boolean;
  enableMasterApplications: boolean;
  minAllocation: number;
  maxAllocation: number;
  platformFeePct: number;
  autoStopEquityDropPct: number;
  maxDrawdownAllowedPct: number;
  forceKyc: boolean;
  showOnDashboard: boolean;
  payoutCycle: string;
  commissionModel?: CommissionModel;
};

export type MasterCommissionSummary = {
  totalAccrued: number;
  totalPaid: number;
  pendingPayout: number;
  copierCount: number;
};

export type MasterCommissionDashboard = {
  model: CommissionModel;
  summary: MasterCommissionSummary;
  byCopier: {
    copierUserId: string;
    copierEmail: string;
    subscriptionId: string;
    commissionFromCopierPct: number;
    totalCopierProfit: number;
    totalCommissionEarned: number;
    pendingCommission: number;
  }[];
  recent: {
    id: string;
    copierEmail: string;
    copierAccountLogin: string;
    copierProfit: number;
    commissionPct: number;
    commissionAmount: number;
    status: string;
    createdAt: string;
  }[];
};

export type MasterStatus = "none" | "pending" | "approved" | "rejected";

export type MasterProfile = {
  id: string;
  userId: string;
  displayName: string;
  headline: string;
  strategySummary: string;
  strategyDetail: string | null;
  riskProfile: "low" | "medium" | "high";
  commissionPct: number;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  appliedAt: string;
  reviewedAt: string | null;
};

export type LinkedMasterAccount = {
  id: string;
  linkId: string;
  accountNumber: number;
  platform: string;
  balance: number;
  equity: number;
  accountStatus: string;
  isPrimary: boolean;
  displayName: string;
  headline: string;
  strategySummary: string;
  strategyDetail: string | null;
  riskProfile: "low" | "medium" | "high";
  commissionPct: number;
  minCopyAmount: number;
  publicProfile: boolean;
  acceptNewCopiers: boolean;
};

export type MasterMeResponse = {
  status: MasterStatus;
  profile?: MasterProfile & {
    commissionFromCopiersPct?: number;
    commissionModel?: CommissionModel;
    minCopyAmount?: number;
  };
  linkedAccounts?: LinkedMasterAccount[];
  rejectionReason?: string | null;
  followers?: {
    id: string;
    email: string;
    accountLogin: string;
    allocation: number;
    commissionFromCopierPct?: number;
    status: string;
    startedAt: string;
  }[];
  commissions?: MasterCommissionDashboard | null;
  pendingChangeRequest?: PendingChangeRequest | null;
};

export type TopRatedMaster = {
  id: string;
  linkId?: string;
  tradingAccountId?: string;
  accountLogin?: string;
  rank: number;
  handle: string;
  displayName: string;
  headline: string;
  strategy: string;
  expertise: string;
  riskScore: number;
  riskLabel: string;
  gainPct: number;
  sparkline: number[];
  profit: number;
  loss: number;
  copiers: number;
  copiersDelta: number;
  commissionPct: number;
  winRate: number;
  drawdownPct: number;
  tradeCount: number;
  minCopyAmount: number;
  aum?: number;
};

export type CopierSubscription = {
  id: string;
  copierUserId: string;
  masterId: string;
  tradingAccountId: string;
  allocation: number;
  copyMode: "proportional" | "fixed";
  lotMultiplier: number;
  dailyLossLimitPct: number;
  status: "active" | "paused" | "stopped";
  termsAcceptedAt: string;
  createdAt: string;
  updatedAt: string;
  masterName: string;
  masterCommissionPct: number;
  accountLogin: string;
  accountBalance: number;
  accountEquity: number;
};

export type MasterApplyPayload = {
  displayName: string;
  headline: string;
  strategySummary: string;
  strategyDetail?: string;
  riskProfile: "low" | "medium" | "high";
  commissionPct: number;
  minCopyAmount?: number;
  tradingAccountIds: string[];
  termsAccepted: true;
};

export type CreateSubscriptionPayload = {
  masterId: string;
  tradingAccountId: string;
  allocation: number;
  copyMode?: "proportional" | "fixed";
  lotMultiplier?: number;
  dailyLossLimitPct?: number;
  termsAccepted: true;
};

export async function fetchCopierSettings() {
  return apiRequest<CopierSettings>("/copier/settings");
}

export type MasterApplyAccountOption = {
  id: string;
  accountNumber: number;
  platform: string;
  balance: number;
  equity: number;
  accountStatus: string;
  isRegisteredAsMaster: boolean;
  isCurrentMasterAccount?: boolean;
  isPendingChangeAccount?: boolean;
};

export type PendingChangeRequest = {
  id: string;
  masterId: string;
  displayName: string;
  headline: string;
  strategySummary: string;
  strategyDetail: string | null;
  riskProfile: "low" | "medium" | "high";
  commissionPct: number;
  accountNumber: number;
  balance: number;
  equity: number;
  appliedAt: string;
};

export async function fetchMasterApplyAccountOptions(forApproved = false) {
  const qs = forApproved ? "?for=approved" : "";
  return apiRequest<MasterApplyAccountOption[]>(`/copier/master/account-options${qs}`, { tokenKey: "user" });
}

export type MasterProfileUpdatePayload = {
  tradingAccountId: string;
  displayName: string;
  headline: string;
  strategySummary: string;
  strategyDetail?: string;
  riskProfile: "low" | "medium" | "high";
  commissionPct: number;
  minCopyAmount?: number;
  termsAccepted: true;
};

export async function submitMasterChangeRequest(payload: MasterProfileUpdatePayload) {
  return apiRequest<MasterMeResponse>("/copier/master/change-request", {
    method: "POST",
    body: payload,
    tokenKey: "user",
  });
}

export async function fetchMasterMe() {
  return apiRequest<MasterMeResponse>("/copier/master/me", { tokenKey: "user" });
}

export type MasterAccountSettingsPayload = {
  displayName: string;
  headline: string;
  strategySummary: string;
  strategyDetail?: string;
  riskProfile: "low" | "medium" | "high";
  commissionPct: number;
  minCopyAmount: number;
  publicProfile: boolean;
  acceptNewCopiers: boolean;
};

export type MasterHistoryTradeRow = {
  id: string;
  orderId: string;
  volume: number;
  type: string;
  symbol: string;
  openTime: string;
  closeTime: string;
  openPrice: string;
  closePrice: string;
  tpSl: string;
  pips: number | null;
  commission: string;
  profit: number;
};

export type MasterAccountHistoryResponse = {
  closedTrades: MasterHistoryTradeRow[];
  openTrades: [];
};

export async function fetchMasterAccountHistory(tradingAccountId: string) {
  return apiRequest<MasterAccountHistoryResponse>(
    `/copier/master/accounts/${tradingAccountId}/history`,
    { tokenKey: "user" }
  );
}

export async function fetchPublicMasterAccountHistory(masterId: string, tradingAccountId: string) {
  return apiRequest<MasterAccountHistoryResponse>(
    `/copier/masters/${masterId}/accounts/${tradingAccountId}/history`,
    { tokenKey: "user" }
  );
}

export async function updateMasterAccountSettings(tradingAccountId: string, payload: MasterAccountSettingsPayload) {
  return apiRequest<MasterMeResponse>(`/copier/master/accounts/${tradingAccountId}`, {
    method: "PUT",
    body: payload,
    tokenKey: "user",
  });
}

export async function fetchMasterCommissions() {
  return apiRequest<MasterCommissionDashboard>("/copier/master/commissions", { tokenKey: "user" });
}

export async function applyForMaster(payload: MasterApplyPayload) {
  return apiRequest<MasterMeResponse>("/copier/master/apply", {
    method: "POST",
    body: payload,
    tokenKey: "user",
  });
}

export async function fetchTopRatedMasters() {
  return apiRequest<TopRatedMaster[]>("/copier/masters", { tokenKey: "user" });
}

export async function fetchMasterDetail(id: string, accountId?: string) {
  const qs = accountId ? `?account=${encodeURIComponent(accountId)}` : "";
  return apiRequest<{
    master: TopRatedMaster & { strategyDetail?: string | null; riskProfile?: string };
    accountDetails: {
      accounts: {
        id: string;
        login: string;
        platform: string;
        balance: number;
        equity: number;
        status: string;
        profit: number;
        floatingProfit: number;
        gainPct: number;
      }[];
      equityChart: { date: string; value: number }[];
      tradeDistribution: { label: string; value: number }[];
      tradeHistory: unknown[];
    };
  }>(`/copier/masters/${id}${qs}`, { tokenKey: "user" });
}

export async function fetchCopierSubscriptions() {
  return apiRequest<CopierSubscription[]>("/copier/subscriptions", { tokenKey: "user" });
}

export async function createCopierSubscription(payload: CreateSubscriptionPayload) {
  return apiRequest<CopierSubscription>("/copier/subscriptions", {
    method: "POST",
    body: payload,
    tokenKey: "user",
  });
}
