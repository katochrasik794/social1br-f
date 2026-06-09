import { apiRequest } from "./http";

export type AvailableGroup = {
  id: string;
  groupName: string;
  dedicatedName: string | null;
  description?: string | null;
  currency: string;
  minDeposit: number | null;
  maxDeposit: number | null;
  minWithdrawal: number | null;
  maxWithdrawal: number | null;
  badgeLabel?: string | null;
  planDescription?: string | null;
  spreadFrom?: string | null;
  maxLeverageDisplay?: number;
  commissionText?: string | null;
  minLotSize?: string | null;
};

export type TradingAccount = {
  id: string;
  userId: string;
  accountNumber: number;
  platform: string;
  mt5Group: string;
  leverage: number;
  currency: string;
  accountStatus: string;
  name: string;
  email: string;
  balance: number;
  equity: number;
  masterPassword?: string;
  investorPassword?: string;
  createdAt: string;
  updatedAt: string;
};

export type OpenAccountResult = TradingAccount & {
  masterPassword: string;
  investorPassword: string;
};

export async function fetchAvailableGroups() {
  return apiRequest<AvailableGroup[]>("/trading-accounts/available-groups", { tokenKey: "user" });
}

export async function fetchTradingAccounts() {
  return apiRequest<TradingAccount[]>("/trading-accounts", { tokenKey: "user" });
}

export async function openTradingAccount(data: {
  group: string;
  leverage: number;
  masterPassword: string;
}) {
  return apiRequest<OpenAccountResult>("/trading-accounts", {
    method: "POST",
    body: data,
    tokenKey: "user",
  });
}
