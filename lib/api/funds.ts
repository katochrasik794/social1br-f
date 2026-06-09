import { apiRequest, apiUploadForm } from "./http";

export type FundRequest = {
  id: string;
  userId: string;
  tradingAccountId: string;
  accountNumber?: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
};

export type Deposit = FundRequest & {
  manualGatewayId?: string | null;
  gatewayName?: string | null;
  gatewayCategory?: string | null;
  transactionReference: string | null;
  proofUrl: string | null;
  adminComment: string | null;
  rejectionReason: string | null;
};

export type Withdrawal = FundRequest & {
  paymentDetails: Record<string, unknown>;
  externalTransactionId: string | null;
  rejectionReason: string | null;
};

export async function fetchDeposits() {
  return apiRequest<Deposit[]>("/deposits", { tokenKey: "user" });
}

export async function createDeposit(data: {
  tradingAccountId: string;
  amount: number;
  manualGatewayId: string;
  paymentMethod?: string;
  transactionReference?: string;
  proof?: File | null;
}) {
  const form = new FormData();
  form.append("tradingAccountId", data.tradingAccountId);
  form.append("amount", String(data.amount));
  form.append("manualGatewayId", data.manualGatewayId);
  if (data.paymentMethod) form.append("paymentMethod", data.paymentMethod);
  if (data.transactionReference) form.append("transactionReference", data.transactionReference);
  if (data.proof) form.append("proof", data.proof);
  return apiUploadForm<Deposit>("/deposits", form, "user");
}

export async function fetchWithdrawals() {
  return apiRequest<Withdrawal[]>("/withdrawals", { tokenKey: "user" });
}

export async function createWithdrawal(data: {
  tradingAccountId: string;
  amount: number;
  paymentMethod: string;
  paymentDetails: Record<string, unknown>;
}) {
  return apiRequest<Withdrawal>("/withdrawals", {
    method: "POST",
    body: data,
    tokenKey: "user",
  });
}
