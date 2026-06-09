"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import PageContainer from "@/components/layout/user/PageContainer";
import { createDeposit } from "@/lib/api/funds";
import { fetchPublicGateway, resolveAssetUrl, type ManualGateway } from "@/lib/api/gateways";
import { fetchTradingAccounts, type TradingAccount } from "@/lib/api/trading";

function DepositDetailInner() {
  const params = useParams();
  const router = useRouter();
  const gatewayId = String(params.gatewayId ?? "");
  const { showToast } = useToast();

  const [gateway, setGateway] = useState<ManualGateway | null>(null);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [txRef, setTxRef] = useState("");
  const [proof, setProof] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gw, accts] = await Promise.all([fetchPublicGateway(gatewayId), fetchTradingAccounts()]);
      setGateway(gw);
      setAccounts(accts);
      if (accts.length) setAccountId(accts[0].id);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load", "error");
      router.push("/accounts/deposit");
    } finally {
      setLoading(false);
    }
  }, [gatewayId, router, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const depositAddress =
    gateway?.cryptoAddress || gateway?.vpaAddress || gateway?.accountNumber || "";
  const qrUrl = resolveAssetUrl(gateway?.qrCodeUrl);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gateway || !accountId || !amount) return;
    setSubmitting(true);
    try {
      await createDeposit({
        tradingAccountId: accountId,
        amount: Number(amount),
        manualGatewayId: gateway.id,
        paymentMethod: gateway.name,
        transactionReference: txRef || undefined,
        proof,
      });
      showToast("Deposit request submitted");
      router.push("/accounts/deposit");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Submit failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm font-bold text-[var(--app-text-primary)]";

  if (loading || !gateway) {
    return (
      <PageContainer className="py-20 text-center text-sm font-bold text-[var(--app-text-muted)]">
        Loading...
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/accounts/deposit"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--app-text-primary)]">{gateway.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-md"
        >
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">MT5 account</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={fieldClass} required>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountNumber} — {a.mt5Group}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Amount (USD)</label>
            <div className="relative">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min={gateway.minAmount}
                max={gateway.maxAmount}
                step="0.01"
                placeholder="0.00"
                className={fieldClass}
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--app-text-muted)]">
                USD
              </span>
            </div>
          </div>

          {gateway.warningText ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              {gateway.warningText}
            </div>
          ) : null}

          {depositAddress ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[var(--app-text-secondary)]">
                To deposit funds, make a transfer to the address below. Copy the address or scan the QR code.
              </p>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                Your {gateway.network || gateway.name} deposit address
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input readOnly value={depositAddress} className={`${fieldClass} font-mono text-xs`} />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(depositAddress);
                    showToast("Address copied");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-amber-950"
                >
                  <Copy className="h-4 w-4" />
                  Copy address
                </button>
              </div>
              <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)]">
                {qrUrl ? (
                  <Image src={qrUrl} alt="QR Code" width={140} height={140} className="h-36 w-36 object-contain" unoptimized />
                ) : (
                  <span className="text-xs font-bold text-[var(--app-text-muted)]">QR Code</span>
                )}
              </div>
            </div>
          ) : null}

          <hr className="border-[var(--app-border)]" />

          <div>
            <h3 className="text-sm font-bold">Upload Payment Proof</h3>
            <div className="mt-3">
              <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">
                Transaction Hash (TxID)
              </label>
              <input
                value={txRef}
                onChange={(e) => setTxRef(e.target.value)}
                className={fieldClass}
                placeholder="Enter transaction hash"
              />
            </div>
            <div className="mt-4">
              <label className="text-xs font-bold uppercase text-[var(--app-text-muted)]">Proof screenshot</label>
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--app-border)] bg-[var(--app-surface-muted)]/50 px-6 py-10 text-center">
                <Upload className="h-8 w-8 text-[var(--app-text-muted)]" />
                <span className="mt-2 text-sm font-bold text-[var(--app-text-secondary)]">
                  {proof ? proof.name : "Click to upload image"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                  required
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || accounts.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--app-primary-solid)] py-3.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Submitting..." : "Submit Deposit Request"}
          </button>
        </form>

        <aside className="space-y-4">
          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
            <h3 className="text-sm font-bold">Terms</h3>
            <div className="mt-3 space-y-2 text-xs font-semibold text-[var(--app-text-secondary)]">
              <p>Average payment time: {gateway.processingTimeText}</p>
              <p>Fee: {gateway.feeDisplay}</p>
              <p>
                Limits: {gateway.minAmount} - {gateway.maxAmount} {gateway.limitsCurrency}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm">
            <h3 className="text-sm font-bold">FAQ</h3>
            <ul className="mt-3 space-y-2 text-xs font-semibold text-[color:var(--app-primary-solid)]">
              <li>How do I deposit with {gateway.name}?</li>
              <li>Learn more about crypto</li>
              <li>How do I verify my crypto address?</li>
            </ul>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}

export default function DepositDetailPage() {
  return (
    <ToastProvider>
      <DepositDetailInner />
    </ToastProvider>
  );
}
