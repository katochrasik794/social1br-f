import { apiRequest } from "./http";

export type AdminDashboardStats = {
  users: { total: number; active: number; emailUnverified: number };
  mt5: { total: number; active: number };
  masters: { approved: number; pending: number; linkedAccounts: number };
  deposits: {
    totalApproved: number;
    fromMasterAccounts: number;
    fromCopierAccounts: number;
    pending: number;
    rejected: number;
    mtd: number;
    today: number;
    sevenDayAvg: number;
  };
  withdrawals: {
    totalApproved: number;
    pending: number;
    rejected: number;
    mtd: number;
    today: number;
    sevenDayAvg: number;
  };
  aum: { platformTotal: number; copierAllocated: number; masterBalances: number };
  copier: { activeCopies: number; activeCopiers: number; approvedMasters: number };
  pamm: { activeInvestments: number; pools: number; totalInvested: number; nav: number };
  mam: { activeLinks: number; managers: number; aum: number };
};

export type AdminRecentLog = {
  id: string;
  time: string;
  userName?: string;
  userEmail?: string;
  user?: string;
  mt5?: string;
  amount?: number | null;
  status: string;
  details?: string;
};

export type AdminActivityLog = {
  id: string;
  time: string;
  type: string;
  user: string;
  userEmail: string;
  mt5: string;
  amount: number | null;
  status: string;
  details: string;
};

export type AdminDashboardOverview = {
  stats: AdminDashboardStats | null;
  recent: {
    deposits: AdminRecentLog[];
    withdrawals: AdminRecentLog[];
    accountsOpened: AdminRecentLog[];
  };
  activityLogs: AdminActivityLog[];
  activityPagination: { total: number; page: number; limit: number; totalPages: number };
};

export async function fetchAdminDashboardOverview() {
  return apiRequest<AdminDashboardOverview>("/admin/dashboard/overview", { tokenKey: "admin" });
}

export async function fetchAdminActivityLogs(params?: { search?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const q = qs.toString();
  return apiRequest<{
    items: AdminActivityLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/admin/dashboard/activity${q ? `?${q}` : ""}`, { tokenKey: "admin" });
}
