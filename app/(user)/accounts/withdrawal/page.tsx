"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpFromLine, Loader2 } from "lucide-react";
import StatusPill from "@/components/ui/StatusPill";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import PageContainer from "@/components/layout/user/PageContainer";
import { createWithdrawal, fetchWithdrawals, type Withdrawal } from "@/lib/api/funds";
import { fetchTradingAccounts, type TradingAccount } from "@/lib/api/trading";

const PAYMENT_METHODS = ["Bank Transfer", "USDT (TRC20)", "USDT (ERC20)", "Other"];

function WithdrawalPageInner() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [history, setHistory] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [details, setDetails] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [accts, wds] = await Promise.all([fetchTradingAccounts(), fetchWithdrawals()]);
      setAccounts(accts);
      setHistory(wds);
      if (accts.length && !accountId) setAccountId(accts[0].id);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [accountId, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId || !amount || !details.trim()) return;
    setSubmitting(true);
    try {
      await createWithdrawal({
        tradingAccountId: accountId,
        amount: Number(amount),
        paymentMethod,
        paymentDetails: { note: details.trim() },
      });
      setAmount("");
      setDetails("");
      showToast("Withdrawal request submitted");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Submit failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm font-bold text-[var(--app-text-primary)]";

  const tone = (s: Withdrawal["status"]) =>
    s === "approved" ? "active" : s === "rejected" ? "stopped" : "pending";

  return (
    <PageContainer className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
          <ArrowUpFromLine className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--app-text-primary)]">Withdrawal</h1>
          <p className="mt-1 text-sm font-bold text-[var(--app-text-secondary)]">
            Request a withdrawal from your MT5 account. Admin approval is required.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-md"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">From MT5 account</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={fieldClass} required>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountNumber} — ${a.balance}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Amount (USD)</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="1" step="0.01" className={fieldClass} required />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Payment method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={fieldClass}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Payout details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className={fieldClass}
              placeholder="Bank account, wallet address, or other payout instructions"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting || accounts.length === 0}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[color:var(--app-primary-solid)] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Submitting..." : "Submit withdrawal"}
        </button>
      </form>

      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-md">
        <div className="border-b border-[var(--app-border)] px-5 py-4">
          <h2 className="text-lg font-bold">Withdrawal history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="rating-table-head border-b">
                {["Date", "Account", "Amount", "Method", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-bold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center font-bold text-[var(--app-text-muted)]">Loading...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center font-bold text-[var(--app-text-muted)]">No withdrawals yet.</td></tr>
              ) : (
                history.map((w) => (
                  <tr key={w.id} className="border-b border-[var(--app-border)]">
                    <td className="px-4 py-3 font-bold">{new Date(w.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">{w.accountNumber}</td>
                    <td className="px-4 py-3">${w.amount}</td>
                    <td className="px-4 py-3">{w.paymentMethod}</td>
                    <td className="px-4 py-3"><StatusPill label={w.status} tone={tone(w.status)} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}

export default function WithdrawalPage() {
  return (
    <ToastProvider>
      <WithdrawalPageInner />
    </ToastProvider>
  );
}
