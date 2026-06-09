"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  Eye,
  Plus,
  BarChart3,
  Users,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from "lucide-react";
import PageContainer, { btnPrimary, btnSecondary } from "@/components/layout/user/PageContainer";
import Modal from "@/components/ui/Modal";
import MiniSparkline from "@/components/copier/MiniSparkline";
import ProfitLossBar from "@/components/copier/ProfitLossBar";
import ExpertiseBadge from "@/components/copier/ExpertiseBadge";
import TopRatedStatsBar from "@/components/copier/TopRatedStatsBar";
import {
  createCopierSubscription,
  fetchTopRatedMasters,
  type TopRatedMaster,
} from "@/lib/api/copier";
import {
  filterCopyEligibleAccounts,
  fullAccountAllocation,
  isOwnMasterProfile,
} from "@/lib/copier/copySetup";
import { useMasterProfile } from "@/providers/MasterProfileProvider";
import { fetchTradingAccounts, type TradingAccount } from "@/lib/api/trading";
import { money, pct } from "@/lib/utils";

function riskScoreColor(score: number) {
  if (score <= 3) return "bg-green-500";
  if (score <= 6) return "bg-amber-500";
  return "bg-red-500";
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center gap-1.5">
        <Trophy className="h-4 w-4 fill-amber-400 text-amber-500" />
        <span className="text-base font-bold text-amber-600">{rank}</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center gap-1.5">
        <Trophy className="h-4 w-4 fill-slate-300 text-slate-400" />
        <span className="text-base font-bold text-[var(--app-text-muted)]">{rank}</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center gap-1.5">
        <Trophy className="h-4 w-4 fill-orange-300 text-orange-400" />
        <span className="text-base font-bold text-orange-500">{rank}</span>
      </div>
    );
  }
  return <span className="text-base font-bold text-[var(--app-text-muted)]">{rank}</span>;
}

const avatarClass =
  "flex shrink-0 items-center justify-center rounded-full bg-sky-50 font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300";

function MasterCard({
  master,
  onCopy,
  onView,
}: {
  master: TopRatedMaster;
  onCopy: () => void;
  onView: () => void;
}) {
  const initials = master.displayName.slice(0, 2).toUpperCase();

  return (
    <article className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <RankBadge rank={master.rank} />
        <div className={`h-11 w-11 text-sm ${avatarClass}`}>{initials}</div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-[var(--app-text-primary)]">{master.displayName}</h3>
          <div className="mt-1.5">
            <ExpertiseBadge label={master.expertise} />
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-lg font-bold text-green-600 dark:text-green-400">{pct(master.gainPct)}</span>
        <MiniSparkline data={master.sparkline} />
      </div>
      <div className="mt-4">
        <ProfitLossBar profit={master.profit} loss={master.loss} />
      </div>
      <div className="mt-5 flex items-center justify-between text-sm font-bold">
        <span className="text-[var(--app-text-muted)]">{master.copiers} copiers</span>
        <span className="text-[var(--app-text-secondary)]">{master.commissionPct}% from copier profit</span>
      </div>
      <div className="mt-5 flex gap-2">
        <button type="button" onClick={onCopy} className={`${btnPrimary} flex-1`}>
          Copy
        </button>
        <button type="button" onClick={onView} className={btnSecondary}>
          <Eye className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

const cardClass = "rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-md";
const selectClass =
  "rating-field w-full rounded-lg border px-3 py-2.5 text-sm font-bold outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:focus:border-green-400 dark:focus:ring-green-900";
const viewBtnActive = "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400";
const viewBtnIdle = "text-[var(--app-text-muted)]";

export default function TopRatedPage() {
  const router = useRouter();
  const { data: masterMe } = useMasterProfile();
  const tableRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"grid" | "table">("table");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("gain");
  const [timeRange, setTimeRange] = useState("all");
  const [minInvestment, setMinInvestment] = useState("25");
  const [minExpertise, setMinExpertise] = useState("any");
  const [freeTrialOnly, setFreeTrialOnly] = useState(false);
  const [masters, setMasters] = useState<TopRatedMaster[]>([]);
  const [tradingAccounts, setTradingAccounts] = useState<TradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyMaster, setCopyMaster] = useState<TopRatedMaster | null>(null);
  const [copySubmitting, setCopySubmitting] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [copyForm, setCopyForm] = useState({
    accountId: "",
    allocation: 5000,
    copyMode: "proportional" as "proportional" | "fixed",
    lotMultiplier: 1,
    dailyLossLimit: 5,
  });

  useEffect(() => {
    Promise.all([fetchTopRatedMasters(), fetchTradingAccounts()])
      .then(([mastersList, accounts]) => {
        setMasters(mastersList);
        setTradingAccounts(accounts);
      })
      .catch(() => {
        setMasters([]);
        setTradingAccounts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  function goToMaster(master: TopRatedMaster) {
    const qs = master.tradingAccountId ? `?account=${encodeURIComponent(master.tradingAccountId)}` : "";
    router.push(`/copier/rating/${master.id}${qs}`);
  }

  const eligibleAccounts = useMemo(
    () => filterCopyEligibleAccounts(tradingAccounts, masterMe),
    [tradingAccounts, masterMe]
  );

  const copyingOwnMaster = copyMaster ? isOwnMasterProfile(masterMe, copyMaster.id) : false;

  useEffect(() => {
    if (!eligibleAccounts.length) {
      setCopyForm((f) => ({ ...f, accountId: "", allocation: 0 }));
      return;
    }
    setCopyForm((f) => {
      const keep = eligibleAccounts.find((a) => a.id === f.accountId);
      const pick = keep ?? eligibleAccounts[0];
      return { ...f, accountId: pick.id, allocation: fullAccountAllocation(pick) };
    });
  }, [eligibleAccounts]);

  function handleCopyAccountChange(accountId: string) {
    const acc = eligibleAccounts.find((a) => a.id === accountId);
    setCopyForm((f) => ({
      ...f,
      accountId,
      allocation: fullAccountAllocation(acc),
    }));
  }

  async function handleStartCopying() {
    if (!copyMaster || !copyForm.accountId) return;
    if (copyingOwnMaster) {
      setCopyError("You cannot copy your own master account.");
      return;
    }
    if (!termsAccepted) {
      setCopyError("Please accept the copy trading terms.");
      return;
    }
    setCopySubmitting(true);
    setCopyError("");
    try {
      await createCopierSubscription({
        masterId: copyMaster.id,
        tradingAccountId: copyForm.accountId,
        allocation: copyForm.allocation,
        copyMode: copyForm.copyMode,
        lotMultiplier: copyForm.lotMultiplier,
        dailyLossLimitPct: copyForm.dailyLossLimit,
        termsAccepted: true,
      });
      setCopyMaster(null);
      router.push("/copier/area");
    } catch (err) {
      setCopyError(err instanceof Error ? err.message : "Failed to start copying");
    } finally {
      setCopySubmitting(false);
    }
  }

  const filtered = useMemo(() => {
    let rows = [...masters];

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          m.handle.toLowerCase().includes(q) ||
          m.headline.toLowerCase().includes(q)
      );
    }

    if (minInvestment !== "any") {
      const min = Number(minInvestment);
      rows = rows.filter((m) => m.minCopyAmount >= min);
    }

    if (minExpertise === "high") {
      rows = rows.filter((m) => m.expertise === "High achiever");
    } else if (minExpertise === "experienced") {
      rows = rows.filter((m) => m.expertise === "High achiever" || m.expertise === "Experienced");
    }

    if (freeTrialOnly) {
      rows = rows.filter((m) => m.minCopyAmount <= 100);
    }

    if (sortBy === "risk") {
      rows.sort((a, b) => a.riskScore - b.riskScore);
    } else if (sortBy === "copiers") {
      rows.sort((a, b) => b.copiers - a.copiers);
    } else {
      rows.sort((a, b) => b.gainPct - a.gainPct);
    }

    return rows;
  }, [masters, search, minInvestment, minExpertise, freeTrialOnly, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) {
    return (
      <PageContainer>
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-12 text-center text-sm font-medium text-[var(--app-text-muted)]">
          Loading masters…
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--app-text-primary)] sm:text-4xl">Master Rating</h1>
              <p className="mt-1.5 text-sm font-bold text-[var(--app-text-secondary)]">
                Discover and copy top-performing traders based on real performance
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[220px] flex-1 sm:flex-none sm:min-w-[300px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-muted)]" />
                <input
                  type="text"
                  placeholder="Search by nickname or name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-3 pl-10 pr-4 text-sm font-bold text-[var(--app-text-primary)] shadow-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/40"
                />
              </div>
              <div className="flex overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={`p-3 ${view === "grid" ? viewBtnActive : viewBtnIdle}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("table")}
                  className={`p-3 ${view === "table" ? viewBtnActive : viewBtnIdle}`}
                >
                  <ListIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={`flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:flex-wrap lg:items-end ${cardClass}`}>
            <div className="min-w-[160px] flex-1">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--app-text-muted)]">
                Whom to show first
              </label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass}>
                <option value="gain">Highest gain</option>
                <option value="risk">Lowest risk</option>
                <option value="copiers">Most copiers</option>
              </select>
            </div>
            <div className="min-w-[140px] flex-1">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--app-text-muted)]">
                For what time
              </label>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className={selectClass}>
                <option value="all">All time</option>
                <option value="1y">Last 12 months</option>
                <option value="6m">Last 6 months</option>
                <option value="3m">Last 3 months</option>
              </select>
            </div>
            <div className="min-w-[160px] flex-1">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--app-text-muted)]">
                Minimum copied funds
              </label>
              <select value={minInvestment} onChange={(e) => setMinInvestment(e.target.value)} className={selectClass}>
                <option value="any">Any</option>
                <option value="25">$25 or more</option>
                <option value="100">$100 or more</option>
                <option value="500">$500 or more</option>
              </select>
            </div>
            <div className="min-w-[140px] flex-1">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--app-text-muted)]">
                Minimum expertise
              </label>
              <select value={minExpertise} onChange={(e) => setMinExpertise(e.target.value)} className={selectClass}>
                <option value="any">Any</option>
                <option value="experienced">Experienced+</option>
                <option value="high">High achiever only</option>
              </select>
            </div>
            <label className="flex cursor-pointer items-center gap-2.5 pb-1 text-sm font-bold text-[var(--app-text-primary)]">
              <input
                type="checkbox"
                checked={freeTrialOnly}
                onChange={(e) => setFreeTrialOnly(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--app-border)] accent-green-600"
              />
              Free 7-day trial
            </label>
          </div>

          {/* Stats row */}
          <TopRatedStatsBar masters={masters} />

          {/* Table / Grid */}
          <div ref={tableRef} className={`overflow-hidden ${cardClass}`}>
            <div className="flex items-center justify-between border-b border-[var(--app-border)] px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-lg font-bold text-[var(--app-text-primary)] sm:text-xl">Top Master Traders</h2>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSortBy("gain");
                  setMinInvestment("any");
                  setMinExpertise("any");
                  setFreeTrialOnly(false);
                  setPage(1);
                }}
                className="text-sm font-bold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                Reset all
              </button>
            </div>

            {view === "grid" ? (
              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
                {paginated.map((m) => (
                  <MasterCard
                    key={m.linkId ?? `${m.id}-${m.tradingAccountId ?? m.rank}`}
                    master={m}
                    onCopy={() => setCopyMaster(m)}
                    onView={() => goToMaster(m)}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-sm">
                  <thead>
                    <tr className="rating-table-head border-b text-left text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-5 py-4 sm:px-6">#</th>
                      <th className="px-5 py-4 sm:px-6">Master / Expertise</th>
                      <th className="px-5 py-4 sm:px-6">Risk Score</th>
                      <th className="px-5 py-4 sm:px-6">Gain</th>
                      <th className="px-5 py-4 sm:px-6">Profit & Loss</th>
                      <th className="px-5 py-4 sm:px-6">Copiers</th>
                      <th className="px-5 py-4 sm:px-6">Commission</th>
                      <th className="px-5 py-4 sm:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((m, i) => (
                      <tr
                        key={m.linkId ?? `${m.id}-${m.tradingAccountId ?? m.rank}`}
                        onClick={() => goToMaster(m)}
                        className={`cursor-pointer border-b border-[var(--app-border)] last:border-0 hover:bg-[var(--app-surface-muted)]/60 ${i % 2 === 1 ? "bg-[var(--app-surface-muted)]/40" : "bg-[var(--app-surface)]"}`}
                      >
                        <td className="px-5 py-5 sm:px-6 sm:py-6">
                          <RankBadge rank={m.rank} />
                        </td>
                        <td className="px-5 py-5 sm:px-6 sm:py-6">
                          <div className="flex items-center gap-3.5">
                            <div className={`h-10 w-10 text-xs ${avatarClass}`}>
                              {m.displayName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[var(--app-text-primary)]">{m.displayName}</p>
                              <div className="mt-1.5">
                                <ExpertiseBadge label={m.expertise} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5 sm:px-6 sm:py-6">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold text-white ${riskScoreColor(m.riskScore)}`}
                            >
                              {m.riskScore}
                            </span>
                            <span className="text-xs font-bold text-[var(--app-text-muted)]">{m.riskLabel}</span>
                          </div>
                        </td>
                        <td className="px-5 py-5 sm:px-6 sm:py-6">
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-green-600 dark:text-green-400">{pct(m.gainPct)}</span>
                            <MiniSparkline data={m.sparkline} />
                          </div>
                        </td>
                        <td className="px-5 py-5 sm:px-6 sm:py-6">
                          <ProfitLossBar profit={m.profit} loss={m.loss} />
                        </td>
                        <td className="px-5 py-5 sm:px-6 sm:py-6">
                          <div>
                            <p className="font-bold text-[var(--app-text-primary)]">{m.copiers}</p>
                            <p className="text-xs font-bold text-green-600 dark:text-green-400">↑ {m.copiersDelta}</p>
                          </div>
                        </td>
                        <td className="px-5 py-5 font-bold text-[var(--app-text-secondary)] sm:px-6 sm:py-6">{m.commissionPct}%</td>
                        <td className="px-5 py-5 sm:px-6 sm:py-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCopyMaster(m)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] shadow-sm hover:border-green-400 hover:text-green-600"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => goToMaster(m)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] shadow-sm hover:border-green-400 hover:text-green-600"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-2.5 text-sm font-bold ${
                    page === n
                      ? "border-green-400 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                      : "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] shadow-sm"
                  }`}
                >
                  {n}
                </button>
              ))}
              {totalPages > 5 ? <span className="px-2 font-bold text-[var(--app-text-muted)]">… {totalPages}</span> : null}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--app-text-muted)]">
              <span>Show</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className={selectClass}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span>per page</span>
            </div>
          </div>

          {/* CTA footer */}
          <div className={`p-6 sm:p-8 ${cardClass}`}>
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  { icon: Shield, title: "Trade with Confidence", desc: "Verified master traders with transparent track records." },
                  { icon: Clock, title: "Real Performance", desc: "Live results updated in real time — no hidden metrics." },
                  { icon: Users, title: "Smart Copying", desc: "Grow your portfolio by following proven strategies." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--app-text-primary)]">{item.title}</p>
                      <p className="mt-0.5 text-xs font-bold text-[var(--app-text-muted)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center lg:text-right">
                <button
                  type="button"
                  onClick={() => {
                    tableRef.current?.scrollIntoView({ behavior: "smooth" });
                    if (filtered[0]) setCopyMaster(filtered[0]);
                  }}
                  className={`${btnPrimary} px-8 py-3.5`}
                >
                  Start Copying Now
                </button>
                <p className="mt-2 text-xs font-bold text-[var(--app-text-muted)]">7-day free trial · cancel anytime</p>
              </div>
            </div>
          </div>

          {/* Copy modal */}
          <Modal open={!!copyMaster} onClose={() => setCopyMaster(null)} title={`Copy ${copyMaster?.displayName}`} subtitle="Configure your copy settings">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[var(--app-text-primary)]">Trading Account</label>
                <select
                  value={copyForm.accountId}
                  onChange={(e) => handleCopyAccountChange(e.target.value)}
                  className="rating-field mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-bold"
                >
                  {eligibleAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountNumber} — {money(a.balance)}
                    </option>
                  ))}
                </select>
                {eligibleAccounts.length === 0 ? (
                  <p className="mt-2 text-xs text-amber-600">
                    Master trading accounts cannot be used for copying. Use a separate MT5 account.
                  </p>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-bold text-[var(--app-text-primary)]">Allocation ($)</label>
                <input
                  type="number"
                  readOnly
                  disabled
                  value={copyForm.allocation}
                  className="rating-field mt-1 w-full cursor-not-allowed rounded-xl border bg-[var(--app-surface-muted)] px-3 py-2.5 text-sm font-bold opacity-90"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-[var(--app-text-primary)]">Copy Mode</label>
                <select
                  value={copyForm.copyMode}
                  onChange={(e) => setCopyForm({ ...copyForm, copyMode: e.target.value as "proportional" | "fixed" })}
                  className="rating-field mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-bold"
                >
                  <option value="proportional">Proportional</option>
                  <option value="fixed">Fixed Lot</option>
                </select>
              </div>
              {copyForm.copyMode === "fixed" ? (
                <div>
                  <label className="text-sm font-bold text-[var(--app-text-primary)]">Lot Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    value={copyForm.lotMultiplier}
                    onChange={(e) => setCopyForm({ ...copyForm, lotMultiplier: Number(e.target.value) })}
                    className="rating-field mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-bold"
                  />
                </div>
              ) : null}
              <div>
                <label className="text-sm font-bold text-[var(--app-text-primary)]">Daily Loss Limit (%)</label>
                <input
                  type="number"
                  value={copyForm.dailyLossLimit}
                  onChange={(e) => setCopyForm({ ...copyForm, dailyLossLimit: Number(e.target.value) })}
                  className="rating-field mt-1 w-full rounded-xl border px-3 py-2.5 text-sm font-bold"
                />
              </div>
              <p className="text-xs text-[var(--app-text-muted)]">
                Full account balance is allocated for copy trading.
              </p>
              {copyingOwnMaster ? (
                <p className="text-sm font-medium text-amber-600">You cannot copy your own master account.</p>
              ) : null}
              {copyError ? <p className="text-sm font-medium text-red-500">{copyError}</p> : null}
              <label className="flex items-center gap-2 text-sm font-bold text-[var(--app-text-primary)]">
                <input
                  type="checkbox"
                  className="rounded accent-green-600"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                I agree to the copy trading terms
              </label>
              <button
                type="button"
                disabled={copySubmitting || eligibleAccounts.length === 0 || copyingOwnMaster}
                onClick={handleStartCopying}
                className={`${btnPrimary} w-full`}
              >
                {copySubmitting ? "Starting…" : "Start Copying"}
              </button>
            </div>
          </Modal>
      </div>
    </PageContainer>
  );
}
