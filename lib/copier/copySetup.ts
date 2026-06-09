import type { MasterMeResponse } from "@/lib/api/copier";
import type { TradingAccount } from "@/lib/api/trading";

export function getMasterLinkedAccountIds(masterMe: MasterMeResponse | null | undefined): Set<string> {
  if (!masterMe || masterMe.status === "none") return new Set();
  return new Set((masterMe.linkedAccounts ?? []).map((a) => a.id));
}

export function filterCopyEligibleAccounts(
  accounts: TradingAccount[],
  masterMe: MasterMeResponse | null | undefined
): TradingAccount[] {
  const blocked = getMasterLinkedAccountIds(masterMe);
  return accounts.filter((a) => a.accountStatus === "active" && !blocked.has(a.id));
}

export function fullAccountAllocation(account: TradingAccount | undefined): number {
  if (!account) return 0;
  return account.balance;
}

export function isOwnMasterProfile(
  masterMe: MasterMeResponse | null | undefined,
  targetMasterId: string
): boolean {
  return masterMe?.status === "approved" && masterMe.profile?.id === targetMasterId;
}
