import { apiRequest } from "./http";
import type { Deposit, Withdrawal } from "./funds";
import type { TradingAccount } from "./trading";

export type AdminTradingAccount = TradingAccount & {
  userEmail: string;
  userName: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AdminDeposit = Deposit & {
  userEmail?: string;
  userName?: string;
};

export type AdminWithdrawal = Withdrawal & {
  userEmail?: string;
  userName?: string;
};

export async function fetchAdminTradingAccounts(params?: { page?: number; limit?: number; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  const q = qs.toString();
  return apiRequest<Paginated<AdminTradingAccount>>(`/admin/mt5/accounts${q ? `?${q}` : ""}`, {
    tokenKey: "admin",
  });
}

export async function fetchAdminDeposits(params?: {
  status?: "pending" | "approved" | "rejected";
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  return apiRequest<Paginated<AdminDeposit> & { counts: { pending: number; approved: number; rejected: number } }>(
    `/admin/deposits${q ? `?${q}` : ""}`,
    { tokenKey: "admin" }
  );
}

export async function approveDeposit(id: string, comment?: string) {
  return apiRequest<AdminDeposit>(`/admin/deposits/${id}/approve`, {
    method: "POST",
    body: { comment },
    tokenKey: "admin",
  });
}

export async function rejectDeposit(id: string, reason: string) {
  return apiRequest<AdminDeposit>(`/admin/deposits/${id}/reject`, {
    method: "POST",
    body: { reason },
    tokenKey: "admin",
  });
}

export async function fetchAdminWithdrawals(params?: {
  status?: "pending" | "approved" | "rejected";
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  return apiRequest<
    Paginated<AdminWithdrawal> & { counts: { pending: number; approved: number; rejected: number } }
  >(`/admin/withdrawals${q ? `?${q}` : ""}`, { tokenKey: "admin" });
}

export async function approveWithdrawal(id: string, data?: { externalTransactionId?: string; comment?: string }) {
  return apiRequest<AdminWithdrawal>(`/admin/withdrawals/${id}/approve`, {
    method: "POST",
    body: data ?? {},
    tokenKey: "admin",
  });
}

export async function rejectWithdrawal(id: string, reason: string) {
  return apiRequest<AdminWithdrawal>(`/admin/withdrawals/${id}/reject`, {
    method: "POST",
    body: { reason },
    tokenKey: "admin",
  });
}
