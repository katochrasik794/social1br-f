"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import {
  openTradingAccount,
  type AvailableGroup,
  type OpenAccountResult,
} from "@/lib/api/trading";

const LEVERAGES = [50, 100, 200, 300, 400, 500];

const STEPS = [
  { n: 1, label: "Select Type" },
  { n: 2, label: "Configure" },
  { n: 3, label: "Ready" },
];

function formatMoney(n: number | null) {
  if (n == null) return "—";
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function groupTitle(g: AvailableGroup) {
  return g.dedicatedName || g.groupName;
}

type Props = {
  open: boolean;
  onClose: () => void;
  groups: AvailableGroup[];
  onSuccess: () => void;
  onError: (msg: string) => void;
};

export default function OpenAccountWizard({ open, onClose, groups, onSuccess, onError }: Props) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<AvailableGroup | null>(null);
  const [leverage, setLeverage] = useState(200);
  const [masterPassword, setMasterPassword] = useState("");
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<OpenAccountResult | null>(null);

  function reset() {
    setStep(1);
    setSelected(null);
    setLeverage(200);
    setMasterPassword("");
    setShowMasterPassword(false);
    setSubmitting(false);
    setResult(null);
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

  const masterPasswordValid =
    masterPassword.length >= 8 &&
    /[a-z]/.test(masterPassword) &&
    /[A-Z]/.test(masterPassword) &&
    /[0-9]/.test(masterPassword) &&
    /[^a-zA-Z0-9]/.test(masterPassword);

  async function handleOpen() {
    if (!selected || !masterPasswordValid) return;
    setSubmitting(true);
    try {
      const data = await openTradingAccount({
        group: selected.groupName,
        leverage,
        masterPassword,
      });
      setResult(data);
      setStep(3);
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to open account");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)]/50 px-4 py-3 text-sm font-bold text-[var(--app-text-primary)] focus:border-[color:var(--app-primary-solid)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--app-primary-solid)_25%,transparent)]";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Open New Account"
      subtitle="Create a real-time MT5 trading environment"
      wide
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    step >= s.n
                      ? "bg-[color:var(--app-primary-solid)] text-white"
                      : "border border-[var(--app-border)] text-[var(--app-text-muted)]"
                  }`}
                >
                  {step > s.n ? <Check className="h-4 w-4" /> : s.n}
                </span>
                <span
                  className={`hidden text-xs font-bold sm:inline ${
                    step === s.n ? "text-[var(--app-text-primary)]" : "text-[var(--app-text-muted)]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 ? (
                <div className="h-px flex-1 bg-[var(--app-border)]" />
              ) : null}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-bold text-[var(--app-text-primary)]">Select Account Type</h4>
              <p className="mt-1 text-xs font-medium text-[var(--app-text-secondary)]">
                Swipe or scroll horizontally to inspect our premium MT5 account plans.
              </p>
            </div>
            {groups.length === 0 ? (
              <p className="py-8 text-center text-sm font-bold text-[var(--app-text-muted)]">
                No active account types. Contact support.
              </p>
            ) : (
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
                {groups.map((g) => {
                  const title = groupTitle(g);
                  const isSelected = selected?.id === g.id;
                  const badge = g.badgeLabel || title.toUpperCase();
                  const rows = [
                    { label: "Minimum Deposit", value: formatMoney(g.minDeposit) },
                    { label: "Spread From", value: g.spreadFrom || "—" },
                    { label: "Max Leverage", value: `1:${g.maxLeverageDisplay ?? 500}` },
                    { label: "Commissions", value: g.commissionText || "Zero" },
                    { label: "Min Lot Size", value: g.minLotSize || "0.01 Lots" },
                  ];
                  return (
                    <div
                      key={g.id}
                      className={`w-[260px] min-w-[260px] flex-shrink-0 snap-start rounded-3xl border-2 p-5 shadow-md transition-all ${
                        isSelected
                          ? "border-[color:var(--app-primary-solid)] ring-2 ring-[color-mix(in_oklab,var(--app-primary-solid)_15%,transparent)]"
                          : "border-[var(--app-border)] hover:border-[color-mix(in_oklab,var(--app-primary-solid)_40%,transparent)]"
                      }`}
                    >
                      <span className="inline-flex rounded-full bg-[color-mix(in_oklab,var(--app-primary-solid)_12%,var(--app-mix-base))] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[color:var(--app-primary-solid)]">
                        {badge}
                      </span>
                      <h4 className="mt-4 truncate text-xl font-bold text-[var(--app-text-primary)]">{title}</h4>
                      <p className="mt-2 min-h-[48px] text-xs leading-relaxed text-[var(--app-text-secondary)]">
                        {g.planDescription || g.description || "Premium MT5 trading account."}
                      </p>
                      <div className="mt-4 space-y-2.5 border-t border-[var(--app-border)] pt-4">
                        {rows.map((r) => (
                          <div key={r.label} className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[var(--app-text-secondary)]">{r.label}</span>
                            <span className="font-bold text-[var(--app-text-primary)]">{r.value}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(g);
                          setStep(2);
                        }}
                        className="mt-6 w-full rounded-2xl bg-[color:var(--app-primary-solid)] py-3 text-xs font-bold uppercase tracking-wider text-white hover:brightness-105"
                      >
                        {isSelected ? "Selected" : "Choose Account"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-2xl bg-[var(--app-surface-muted)] py-3.5 text-xs font-bold uppercase tracking-wider text-[var(--app-text-secondary)]"
            >
              Cancel
            </button>
          </div>
        ) : null}

        {step === 2 && selected ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)]/50 p-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                  Account execution tier
                </div>
                <div className="mt-0.5 font-bold text-[var(--app-text-primary)]">{groupTitle(selected)}</div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[color:var(--app-primary-solid)] hover:underline"
              >
                Change
              </button>
            </div>
            <div>
              <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-[var(--app-text-secondary)]">
                Leverage multiplier
              </label>
              <select value={leverage} onChange={(e) => setLeverage(Number(e.target.value))} className={fieldClass}>
                {LEVERAGES.map((l) => (
                  <option key={l} value={l}>
                    1:{l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-[var(--app-text-secondary)]">
                Master password
              </label>
              <div className="relative">
                <input
                  type={showMasterPassword ? "text" : "password"}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="Create your MT5 master password"
                  className={`${fieldClass} pr-12`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowMasterPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]"
                  aria-label={showMasterPassword ? "Hide password" : "Show password"}
                >
                  {showMasterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs font-medium text-[var(--app-text-muted)]">
                Min 8 characters with upper, lower, number and symbol. Investor password will be generated automatically.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-2xl bg-[var(--app-surface-muted)] py-3.5 text-xs font-bold uppercase tracking-wider text-[var(--app-text-secondary)]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleOpen}
                disabled={submitting || !masterPasswordValid}
                className="flex-[2] inline-flex items-center justify-center gap-2 rounded-2xl bg-[color:var(--app-primary-solid)] py-3.5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? "Creating..." : "Confirm Open Account"}
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 && result ? (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50">
              <Check className="h-8 w-8" strokeWidth={3} />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-[var(--app-text-primary)]">Account created</h4>
              <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                Your passwords are saved and visible in My Accounts.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)]/50 p-4 text-left text-sm font-bold">
              <p>
                Login:{" "}
                <span className="text-[color:var(--app-primary-solid)]">{result.accountNumber}</span>
              </p>
              <p className="mt-2">
                Master password: <span className="font-mono">{result.masterPassword}</span>
              </p>
              <p className="mt-2">
                Investor password: <span className="font-mono">{result.investorPassword}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-2xl bg-[color:var(--app-primary-solid)] py-3.5 text-xs font-bold uppercase tracking-wider text-white"
            >
              Done
            </button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
