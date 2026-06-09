import Link from "next/link";
import { Fragment } from "react";
import { AlertTriangle, ExternalLink, Settings, Link2, Activity, Calendar, UserCheck } from "lucide-react";
import type { MasterOverviewInfo } from "@/lib/mock/masterArea";
import { money, pct } from "@/lib/utils";

type MasterOverviewCardsProps = {
  info: MasterOverviewInfo;
};

const OVERVIEW_ITEMS = [
  {
    key: "linkedMaster" as const,
    label: "Linked Account",
    icon: Link2,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
  {
    key: "copyStatus" as const,
    label: "Master Status",
    icon: Activity,
    iconBg: "bg-[color-mix(in_oklab,var(--app-luxury-gold)_18%,var(--app-mix-base))]",
    iconColor: "text-[color:var(--app-luxury-gold)]",
  },
  {
    key: "copyDuration" as const,
    label: "Active Since",
    icon: Calendar,
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-600",
  },
  {
    key: "joinedOn" as const,
    label: "Approved On",
    icon: UserCheck,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600",
  },
];

export default function MasterOverviewCards({ info }: MasterOverviewCardsProps) {
  const followerLoss = info.followerProfit < 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Copier Overview Card */}
      <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
        <h2 className="text-base font-bold text-[var(--app-text-primary)]">Your Master Overview</h2>
        <p className="mt-1 text-sm text-[var(--app-text-muted)]">Track your connection and performance with this master.</p>

        <div className="mt-6 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)]/30 p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-y-5 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center sm:gap-0">
            {OVERVIEW_ITEMS.map(({ key, label, icon: Icon, iconBg, iconColor }, idx) => (
              <Fragment key={key}>
                {idx > 0 ? (
                  <span className="hidden self-center px-2 text-base font-light text-[var(--app-border)] sm:inline" aria-hidden>
                    |
                  </span>
                ) : null}
                <div className="flex flex-col items-center px-2 text-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-[10px] font-medium text-[var(--app-text-muted)]">{label}</p>
                  <p className="mt-0.5 text-xs font-bold text-[var(--app-text-primary)]">{info[key]}</p>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        <button type="button" className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--app-primary-solid)] py-3 text-sm font-bold text-white shadow-lg shadow-[color-mix(in_oklab,var(--app-primary-solid)_20%,transparent)] transition hover:brightness-110">
          <Settings className="h-4 w-4" />
          Manage Master Settings
        </button>
      </div>

      {/* Performance Card */}
      <div className="relative rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--app-text-primary)]">Copier Performance</h2>
          {info.suspicious ? (
            <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-500">
              <AlertTriangle className="h-3.5 w-3.5" />
              Review Required
            </span>
          ) : null}
        </div>

        <div className="mt-8 rounded-2xl bg-[var(--app-surface-muted)]/50 p-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--app-primary-solid)] text-lg font-bold text-white shadow-lg shadow-[color-mix(in_oklab,var(--app-primary-solid)_20%,transparent)]">
              {info.followerLabel.charAt(0)}
            </div>
            <div className="flex flex-1 items-center justify-around gap-4">
              <div className="text-center">
                <p className="text-[11px] font-medium text-[var(--app-text-muted)]">Total Copier P/L</p>
                <p className={`mt-1 text-lg font-bold ${followerLoss ? "text-rose-500" : "text-[color:var(--app-primary-solid)]"}`}>
                  {money(info.followerProfit)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-medium text-[var(--app-text-muted)]">Gain</p>
                <p className={`mt-1 text-lg font-bold ${info.followerGainPct < 0 ? "text-rose-500" : "text-[color:var(--app-primary-solid)]"}`}>
                  {pct(info.followerGainPct)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Link href="/copier/rating/1" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[color:var(--app-primary-solid)] py-3 text-sm font-bold text-[color:var(--app-primary-solid)] transition hover:bg-[color:var(--app-primary-solid)] hover:text-white">
          View Public Master Profile
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
