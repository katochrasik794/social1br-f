"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, ArrowLeft, Bitcoin, Building2, CreditCard, Landmark, Users } from "lucide-react";
import StatusPill from "@/components/ui/StatusPill";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import PageContainer from "@/components/layout/user/PageContainer";
import PaymentMethodCard from "@/components/accounts/PaymentMethodCard";
import { fetchDeposits, type Deposit } from "@/lib/api/funds";
import {
  fetchPublicGateways,
  type GatewayCategory,
  type GatewayCategoryGroup,
  type ManualGateway,
} from "@/lib/api/gateways";
import { getApiUrl } from "@/lib/api/http";

const TAB_ICONS: Record<GatewayCategory, typeof CreditCard> = {
  gateway: CreditCard,
  cryptocurrency: Bitcoin,
  wire_transfer: Building2,
  upi: Landmark,
  local_depositor: Users,
};

function DepositPageInner() {
  const router = useRouter();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<GatewayCategoryGroup[]>([]);
  const [history, setHistory] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<GatewayCategory | "">("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gw, deps] = await Promise.all([fetchPublicGateways(), fetchDeposits()]);
      setCategories(gw.categories);
      setHistory(deps);
      setTab((prev) => prev || (gw.categories[0]?.category ?? ""));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const active = categories.find((c) => c.category === tab);
  const tone = (s: Deposit["status"]) =>
    s === "approved" ? "active" : s === "rejected" ? "stopped" : "pending";

  return (
    <PageContainer className="space-y-8">
      <div className="flex items-start gap-4">
        <Link
          href="/accounts"
          className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-muted)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-1 items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
            <ArrowDownToLine className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--app-text-primary)]">Make a deposit</h1>
            <p className="mt-1 text-sm font-bold text-[var(--app-text-secondary)]">
              Choose a tab, then select an active method.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-md sm:p-6">
        {loading ? (
          <p className="py-10 text-center text-sm font-bold text-[var(--app-text-muted)]">Loading methods...</p>
        ) : categories.length === 0 ? (
          <p className="py-10 text-center text-sm font-bold text-[var(--app-text-muted)]">
            No deposit methods available yet.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1 border-b border-[var(--app-border)]">
              {categories.map((c) => {
                const Icon = TAB_ICONS[c.category];
                const activeTab = tab === c.category;
                return (
                  <button
                    key={c.category}
                    type="button"
                    onClick={() => setTab(c.category)}
                    className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
                      activeTab
                        ? "border-[color:var(--app-primary-solid)] text-[color:var(--app-primary-solid)]"
                        : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {c.label} ({c.count})
                  </button>
                );
              })}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(active?.items ?? []).map((g: ManualGateway) => (
                <PaymentMethodCard
                  key={g.id}
                  gateway={g}
                  onSelect={() => router.push(`/accounts/deposit/${g.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-md">
        <div className="border-b border-[var(--app-border)] px-5 py-4">
          <h2 className="text-lg font-bold">Deposit history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="rating-table-head border-b">
                {["Date", "Account", "Amount", "Method", "Status", "Proof"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-bold uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center font-bold text-[var(--app-text-muted)]">
                    No deposits yet.
                  </td>
                </tr>
              ) : (
                history.map((d) => (
                  <tr key={d.id} className="border-b border-[var(--app-border)]">
                    <td className="px-4 py-3 font-bold">{new Date(d.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">{d.accountNumber}</td>
                    <td className="px-4 py-3">${d.amount}</td>
                    <td className="px-4 py-3">{d.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <StatusPill label={d.status} tone={tone(d.status)} />
                    </td>
                    <td className="px-4 py-3">
                      {d.proofUrl ? (
                        <a
                          href={`${getApiUrl()}${d.proofUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[color:var(--app-primary-solid)] hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
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

export default function DepositPage() {
  return (
    <ToastProvider>
      <DepositPageInner />
    </ToastProvider>
  );
}
