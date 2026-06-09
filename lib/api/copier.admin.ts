import type { MasterAccountHistoryResponse, MasterHistoryTradeRow, TopRatedMaster } from "./copier";
import { apiRequest } from "./http";
import type { MasterAccountDetails } from "@/lib/mock/masterDetail";

export type AdminMasterRow = {
  id: string;
  masterId?: string;
  tradingAccountId?: string;
  kind: "application" | "account_change" | "linked_account";
  displayName: string;
  email: string;
  status: string;
  appliedAt: string;
  aum: number;
  equity?: number | null;
  followers: number;
  rejectReason: string | null;
  commissionPct: number;
  riskProfile: string;
  requestedAccount: string | null;
  currentAccount: string | null;
  platform?: string | null;
  isPrimary?: boolean;
  headline?: string | null;
  strategySummary?: string | null;
  minCopyAmount?: number;
};

export async function fetchAdminMasters() {
  return apiRequest<AdminMasterRow[]>("/admin/copier/masters", { tokenKey: "admin" });
}

export async function approveAdminMaster(id: string) {
  return apiRequest<unknown>(`/admin/copier/masters/${id}/approve`, {
    method: "POST",
    tokenKey: "admin",
  });
}

export async function rejectAdminMaster(id: string, reason: string) {
  return apiRequest<unknown>(`/admin/copier/masters/${id}/reject`, {
    method: "POST",
    body: { reason },
    tokenKey: "admin",
  });
}

export async function approveAdminChangeRequest(id: string) {
  return apiRequest<unknown>(`/admin/copier/change-requests/${id}/approve`, {
    method: "POST",
    tokenKey: "admin",
  });
}

export async function rejectAdminChangeRequest(id: string, reason: string) {
  return apiRequest<unknown>(`/admin/copier/change-requests/${id}/reject`, {
    method: "POST",
    body: { reason },
    tokenKey: "admin",
  });
}

export type AdminMasterFollower = {
  id: string;
  email: string;
  accountLogin: string;
  allocation: number;
  status: string;
  startedAt: string;
};

export type AdminMasterLinkedAccount = {
  id: string;
  login: string;
  platform: "MT4" | "MT5";
  balance: number;
  equity: number;
  status: string;
  profit: number;
  floatingProfit: number;
  gainPct: number;
  displayName?: string;
};

export type AdminMasterProfileResponse = {
  master: TopRatedMaster;
  accounts: AdminMasterLinkedAccount[];
  accountSummary: MasterAccountDetails;
  selectedAccountId: string;
  email: string;
  appliedAt: string;
  approvedAt: string | null;
  withUsDays: number;
  followers: AdminMasterFollower[];
};

export async function fetchAdminMasterProfile(masterId: string, tradingAccountId?: string) {
  const qs = tradingAccountId ? `?account=${encodeURIComponent(tradingAccountId)}` : "";
  return apiRequest<AdminMasterProfileResponse>(`/admin/copier/masters/${masterId}/profile${qs}`, {
    tokenKey: "admin",
  });
}

export async function fetchAdminMasterAccountHistory(tradingAccountId: string) {
  return apiRequest<MasterAccountHistoryResponse>(`/admin/copier/accounts/${tradingAccountId}/history`, {
    tokenKey: "admin",
  });
}

export type { MasterHistoryTradeRow };
