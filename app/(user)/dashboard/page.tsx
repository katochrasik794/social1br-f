"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Layers, Network, ArrowRight, Activity } from "lucide-react";
import PageContainer, { HeroCard, InlineBreadcrumb } from "@/components/layout/user/PageContainer";
import { fetchDashboardActivity, type DashboardActivity } from "@/lib/api/dashboard";
import { fetchCopierSettings, fetchCopierSubscriptions } from "@/lib/api/copier";
import { fetchPammSettings, fetchPammInvestorDashboard } from "@/lib/api/pamm";
import { fetchMamSettings, fetchMamInvestorDashboard } from "@/lib/api/mam";
import { money, pct } from "@/lib/utils";

export default function DashboardPage() {
  const [copierStats, setCopierStats] = useState({ active: 0, allocated: 0, show: true });
  const [pammStats, setPammStats] = useState({ investments: 0, totalInvested: 0, show: true });
  const [mamStats, setMamStats] = useState({ linked: 0, avgPnl: 0, show: true });
  const [activity, setActivity] = useState<DashboardActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCopierSettings().catch(() => null),
      fetchCopierSubscriptions().catch(() => []),
      fetchPammSettings().catch(() => null),
      fetchPammInvestorDashboard().catch(() => null),
      fetchMamSettings().catch(() => null),
      fetchMamInvestorDashboard().catch(() => null),
      fetchDashboardActivity().catch(() => []),
    ])
      .then(([copierSettings, subs, pammSettings, pammDash, mamSettings, mamDash, feed]) => {
        if (copierSettings?.showOnDashboard) {
          setCopierStats({
            active: subs.filter((s) => s.status === "active").length,
            allocated: subs.reduce((sum, s) => sum + s.allocation, 0),
            show: true,
          });
        } else {
          setCopierStats({ active: 0, allocated: 0, show: false });
        }

        if (pammSettings?.showOnDashboard && pammSettings.enablePamm) {
          setPammStats({
            investments: pammDash?.summary.activeInvestments ?? 0,
            totalInvested: pammDash?.summary.totalInvested ?? 0,
            show: true,
          });
        } else {
          setPammStats({ investments: 0, totalInvested: 0, show: false });
        }

        if (mamSettings?.showOnDashboard && mamSettings.enableMam) {
          setMamStats({
            linked: mamDash?.summary.linkedAccounts ?? 0,
            avgPnl: mamDash?.summary.avgPnlPct ?? 0,
            show: true,
          });
        } else {
          setMamStats({ linked: 0, avgPnl: 0, show: false });
        }

        setActivity(feed);
      })
      .finally(() => setLoading(false));
  }, []);

  const modules = [
    {
      name: "Copier",
      icon: Copy,
      href: "/copier/area",
      stats: [
        { label: "Active Copies", value: copierStats.active },
        { label: "Total Allocated", value: money(copierStats.allocated) },
      ],
      hidden: !copierStats.show,
    },
    {
      name: "PAMM",
      icon: Layers,
      href: "/pamm/investor",
      stats: [
        { label: "Investments", value: pammStats.investments },
        { label: "Total Invested", value: money(pammStats.totalInvested) },
      ],
      hidden: !pammStats.show,
    },
    {
      name: "MAM",
      icon: Network,
      href: "/mam/investor",
      stats: [
        { label: "Linked Accounts", value: mamStats.linked },
        { label: "Avg P&L", value: pct(mamStats.avgPnl) },
      ],
      hidden: !mamStats.show,
    },
  ].filter((m) => !m.hidden);

  return (
    <PageContainer>
      <div className="w-full min-w-0 space-y-6">
        <InlineBreadcrumb items={[{ label: "Dashboard" }]} />
        <HeroCard icon={Activity} title="Social Trading Dashboard" subtitle="Overview of your Copier, PAMM, and MAM activity" />

        <div className="grid gap-4 lg:grid-cols-3">
          {modules.map((mod) => (
            <Link
              key={mod.name}
              href={mod.href}
              className="group rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[color-mix(in_oklab,var(--app-primary-solid)_10%,var(--app-mix-base))] text-[color:var(--app-primary-solid)]">
                    <mod.icon className="h-6 w-6" />
                  </span>
                  <h2 className="text-lg font-bold text-[var(--app-text-primary)]">{mod.name}</h2>
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--app-text-muted)] transition group-hover:text-[color:var(--app-primary-solid)]" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {mod.stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">{s.label}</p>
                    <p className="mt-1 font-bold text-[var(--app-text-primary)]">{s.value}</p>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
          <h2 className="text-lg font-bold text-[var(--app-text-primary)]">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-[var(--app-text-muted)]">Loading activity…</p>
            ) : activity.length === 0 ? (
              <p className="text-sm text-[var(--app-text-muted)]">No recent activity yet.</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-[var(--app-border)] pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-[var(--app-text-primary)]">{item.message}</p>
                    <p className="text-xs text-[var(--app-text-muted)]">{item.time}</p>
                  </div>
                  <span className="text-xs font-bold uppercase text-[var(--app-text-muted)]">{item.type}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
