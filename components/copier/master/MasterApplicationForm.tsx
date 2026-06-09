"use client";

import { COMMISSION_FROM_COPIERS_LABEL } from "@/lib/api/copier";
import type { MasterApplyAccountOption } from "@/lib/api/copier";
import { btnPrimary, btnSecondary } from "@/components/layout/user/PageContainer";
import MasterAccountPicker from "@/components/copier/master/MasterAccountPicker";
import { money } from "@/lib/utils";

export type MasterFormValues = {
  displayName: string;
  headline: string;
  strategySummary: string;
  strategyDetail: string;
  riskProfile: "low" | "medium" | "high";
  commissionPct: number;
  minCopyAmount: number;
  tradingAccountId: string | null;
  termsAccepted: boolean;
};

const RISK_OPTIONS = [
  { key: "low" as const, label: "Low", desc: "Tight risk controls, slow growth." },
  { key: "medium" as const, label: "Medium", desc: "Balanced risk-reward." },
  { key: "high" as const, label: "High", desc: "High volatility, aggressive returns." },
];

type MasterApplicationFormProps = {
  accounts: MasterApplyAccountOption[];
  values: MasterFormValues;
  onChange: (values: MasterFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string;
  submitLabel: string;
  onCancel?: () => void;
  switchMode?: boolean;
};

export default function MasterApplicationForm({
  accounts,
  values,
  onChange,
  onSubmit,
  submitting,
  error,
  submitLabel,
  onCancel,
  switchMode,
}: MasterApplicationFormProps) {
  function set<K extends keyof MasterFormValues>(key: K, val: MasterFormValues[K]) {
    onChange({ ...values, [key]: val });
  }

  function selectAccount(account: MasterApplyAccountOption) {
    if (account.isRegisteredAsMaster || account.isCurrentMasterAccount || account.accountStatus !== "active") return;
    set("tradingAccountId", account.id);
  }

  return (
    <form onSubmit={onSubmit} className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
      {switchMode ? (
        <p className="text-xs text-[var(--app-text-muted)]">
          Set a unique display name and strategy for this MT5 account. Each approved account keeps its own profile.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-[var(--app-text-primary)]">Display name *</label>
          <input
            required
            value={values.displayName}
            onChange={(e) => set("displayName", e.target.value)}
            placeholder="e.g. Aiden Vega"
            className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-[var(--app-text-primary)]">Headline *</label>
          <input
            required
            value={values.headline}
            onChange={(e) => set("headline", e.target.value)}
            placeholder="One-line summary of your strategy"
            className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-[var(--app-text-primary)]">Strategy summary *</label>
        <textarea
          required
          rows={3}
          value={values.strategySummary}
          onChange={(e) => set("strategySummary", e.target.value)}
          placeholder="Briefly describe your edge, holding period and primary instruments."
          className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-[var(--app-text-primary)]">Strategy detail (optional)</label>
        <textarea
          rows={3}
          value={values.strategyDetail}
          onChange={(e) => set("strategyDetail", e.target.value)}
          placeholder="Expand on risk management, position sizing, drawdown handling, etc."
          className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-[var(--app-text-primary)]">Risk profile *</label>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {RISK_OPTIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => set("riskProfile", r.key)}
              className={`rounded-xl border p-3 text-left transition ${
                values.riskProfile === r.key
                  ? "border-[color:var(--app-primary-solid)] bg-[color-mix(in_oklab,var(--app-primary-solid)_8%,var(--app-mix-base))]"
                  : "border-[var(--app-border)] hover:border-[color:var(--app-primary-solid)]"
              }`}
            >
              <p className="text-sm font-bold text-[var(--app-text-primary)]">{r.label}</p>
              <p className="mt-1 text-xs text-[var(--app-text-muted)]">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-[var(--app-text-primary)]">{COMMISSION_FROM_COPIERS_LABEL} *</label>
          <span className="text-lg font-bold text-[color:var(--app-primary-solid)]">{values.commissionPct}%</span>
        </div>
        <p className="mt-1 text-xs text-[var(--app-text-muted)]">
          Deducted from copier profit and credited to you. If a copier makes {money(100)} profit, you earn{" "}
          {money((100 * values.commissionPct) / 100)} (5% – 50%).
        </p>
        <input
          type="range"
          min={5}
          max={50}
          step={1}
          value={values.commissionPct}
          onChange={(e) => set("commissionPct", Number(e.target.value))}
          className="mt-3 w-full accent-[color:var(--app-primary-solid)]"
        />
        <div className="mt-1 flex justify-between text-xs font-medium text-[var(--app-text-muted)]">
          <span>5%</span>
          <span>50%</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-[var(--app-text-primary)]">Minimum copy amount *</label>
        <p className="mt-1 text-xs text-[var(--app-text-muted)]">
          Minimum funds a copier must allocate to copy this account.
        </p>
        <input
          type="number"
          required
          min={25}
          step={25}
          value={values.minCopyAmount}
          onChange={(e) => set("minCopyAmount", Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-[var(--app-border)] px-3 py-2.5 text-sm sm:max-w-xs"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-[var(--app-text-primary)]">Select account to make a master *</label>
        <p className="mt-1 text-xs text-[var(--app-text-muted)]">
          Select one MT5 account per application. Already-linked accounts are disabled. Balance and equity shown below.
        </p>
        <div className="mt-3">
          <MasterAccountPicker accounts={accounts} selectedId={values.tradingAccountId} onSelect={selectAccount} />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-[var(--app-text-secondary)]">
        <input
          type="checkbox"
          checked={values.termsAccepted}
          onChange={(e) => set("termsAccepted", e.target.checked)}
          className="mt-0.5 rounded accent-[color:var(--app-primary-solid)]"
        />
        I confirm the information above is accurate and I accept the platform&apos;s master trader terms, including
        commission cycles and follower protection rules.
      </label>

      {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

      <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-border)] pt-4">
        {onCancel ? (
          <button type="button" onClick={onCancel} className={btnSecondary}>
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={submitting || !values.tradingAccountId}
          className={btnPrimary}
        >
          {submitting ? "Submitting…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function emptyMasterForm(): MasterFormValues {
  return {
    displayName: "",
    headline: "",
    strategySummary: "",
    strategyDetail: "",
    riskProfile: "medium",
    commissionPct: 20,
    minCopyAmount: 25,
    tradingAccountId: null,
    termsAccepted: false,
  };
}

export function masterFormFromProfile(
  profile: {
    displayName: string;
    headline: string;
    strategySummary: string;
    strategyDetail?: string | null;
    riskProfile: "low" | "medium" | "high";
    commissionPct: number;
    minCopyAmount?: number;
  },
  tradingAccountId: string | null = null
): MasterFormValues {
  return {
    displayName: profile.displayName,
    headline: profile.headline,
    strategySummary: profile.strategySummary,
    strategyDetail: profile.strategyDetail ?? "",
    riskProfile: profile.riskProfile,
    commissionPct: profile.commissionPct,
    minCopyAmount: profile.minCopyAmount ?? 25,
    tradingAccountId,
    termsAccepted: false,
  };
}
