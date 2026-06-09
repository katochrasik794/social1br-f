"use client";

import { Wallet } from "lucide-react";
import type { MasterApplyAccountOption } from "@/lib/api/copier";
import { money } from "@/lib/utils";

type MasterAccountPickerProps = {
  accounts: MasterApplyAccountOption[];
  selectedId: string | null;
  onSelect: (account: MasterApplyAccountOption) => void;
};

function accountTooltip(account: MasterApplyAccountOption) {
  if (account.isCurrentMasterAccount) return "This account is already linked to your master profile";
  if (account.isPendingChangeAccount) return "This account is pending admin approval";
  if (account.isRegisteredAsMaster) return "This account is already registered as the master";
  if (account.accountStatus !== "active") return "Account must be active";
  return undefined;
}

function isDisabled(account: MasterApplyAccountOption) {
  return (
    account.isRegisteredAsMaster ||
    account.isCurrentMasterAccount ||
    account.isPendingChangeAccount ||
    account.accountStatus !== "active"
  );
}

export default function MasterAccountPicker({ accounts, selectedId, onSelect }: MasterAccountPickerProps) {
  if (accounts.length === 0) {
    return (
      <p className="text-sm text-amber-600">
        No MT5 accounts found.{" "}
        <a href="/accounts" className="font-semibold underline">
          Open an account
        </a>{" "}
        first.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {accounts.map((a) => {
        const selected = selectedId === a.id;
        const disabled = isDisabled(a);
        return (
          <button
            key={a.id}
            type="button"
            disabled={disabled}
            title={accountTooltip(a)}
            onClick={() => onSelect(a)}
            className={`flex min-w-[200px] flex-col rounded-xl border px-4 py-3 text-left transition ${
              disabled
                ? "cursor-not-allowed border-[var(--app-border)] bg-[var(--app-surface-muted)] opacity-60"
                : selected
                  ? "border-[color:var(--app-primary-solid)] bg-[color-mix(in_oklab,var(--app-primary-solid)_10%,var(--app-mix-base))]"
                  : "border-[var(--app-border)] hover:border-[color:var(--app-primary-solid)]"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-bold text-[var(--app-text-primary)]">
              <Wallet className="h-4 w-4 shrink-0 text-[color:var(--app-primary-solid)]" />
              {a.accountNumber}
              {a.isCurrentMasterAccount ? (
                <span className="rounded bg-[var(--app-surface-muted)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--app-text-muted)]">
                  Linked
                </span>
              ) : null}
              {a.isPendingChangeAccount ? (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                  Pending
                </span>
              ) : null}
            </span>
            <span className="mt-2 text-xs text-[var(--app-text-muted)]">
              Balance: <span className="font-semibold text-[var(--app-text-secondary)]">{money(a.balance)}</span>
            </span>
            <span className="text-xs text-[var(--app-text-muted)]">
              Equity: <span className="font-semibold text-[var(--app-text-secondary)]">{money(a.equity)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
