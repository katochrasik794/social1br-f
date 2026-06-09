import { apiRequest } from "./http";

export type Mt5ManagerConfig = {
  id: string;
  label: string;
  apiKey: string;
  mt5Login: number;
  mt5Password: string;
  mt5Server: string;
  isActive: boolean;
  lastTestedAt: string | null;
  createdAt: string;
  updatedAt: string;
  mt5ApiUrl: string;
};

export type Mt5Group = {
  id: string;
  groupName: string;
  dedicatedName: string | null;
  description: string | null;
  company: string | null;
  currency: string | null;
  server: string | null;
  marginCall: number | null;
  marginStopOut: number | null;
  minDeposit: number | null;
  maxDeposit: number | null;
  minWithdrawal: number | null;
  maxWithdrawal: number | null;
  isActive: boolean;
  rawJson: Record<string, unknown>;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type GroupsListResponse = {
  items: Mt5Group[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: { active: number; inactive: number };
};

export async function fetchManagerConfig() {
  return apiRequest<Mt5ManagerConfig | null>("/admin/mt5/manager-config", { tokenKey: "admin" });
}

export async function fetchManagerConfigs() {
  return apiRequest<Mt5ManagerConfig[]>("/admin/mt5/manager-configs", { tokenKey: "admin" });
}

export async function fetchManagerConfigById(id: string) {
  return apiRequest<Mt5ManagerConfig>(`/admin/mt5/manager-config/${id}`, { tokenKey: "admin" });
}

export async function saveManagerConfig(data: {
  id?: string;
  label?: string;
  apiKey: string;
  mt5Login: number;
  mt5Password?: string;
  mt5Server: string;
}) {
  return apiRequest<Mt5ManagerConfig>("/admin/mt5/manager-config", {
    method: "PUT",
    body: data,
    tokenKey: "admin",
  });
}

export async function deleteManagerConfig(id: string) {
  return apiRequest<{ deleted: boolean }>(`/admin/mt5/manager-config/${id}`, {
    method: "DELETE",
    tokenKey: "admin",
  });
}

export async function testManagerConnection(data?: {
  apiKey: string;
  mt5Login: number;
  mt5Password?: string;
  mt5Server: string;
}) {
  return apiRequest<{ ok: boolean; message: string }>("/admin/mt5/manager-config/test", {
    method: "POST",
    body: data ?? {},
    tokenKey: "admin",
  });
}

export async function fetchMt5Groups(params?: {
  status?: "active" | "inactive";
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.search) qs.set("search", params.search);
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiRequest<GroupsListResponse>(`/admin/mt5/groups${query ? `?${query}` : ""}`, { tokenKey: "admin" });
}

export async function syncMt5Groups(forceUpdate: boolean) {
  return apiRequest<{ inserted: number; updated: number; deleted: number; total: number }>(
    "/admin/mt5/groups/sync",
    { method: "POST", body: { forceUpdate }, tokenKey: "admin" }
  );
}

export async function updateMt5Group(
  id: string,
  patch: Partial<{
    dedicatedName: string | null;
    marginCall: number | null;
    marginStopOut: number | null;
    minDeposit: number | null;
    maxDeposit: number | null;
    minWithdrawal: number | null;
    maxWithdrawal: number | null;
    isActive: boolean;
  }>
) {
  return apiRequest<Mt5Group>(`/admin/mt5/groups/${id}`, {
    method: "PATCH",
    body: patch,
    tokenKey: "admin",
  });
}

export async function deleteMt5Group(id: string) {
  return apiRequest<{ deleted: boolean }>(`/admin/mt5/groups/${id}`, {
    method: "DELETE",
    tokenKey: "admin",
  });
}

export async function getMt5Group(id: string) {
  return apiRequest<Mt5Group>(`/admin/mt5/groups/${id}`, { tokenKey: "admin" });
}
