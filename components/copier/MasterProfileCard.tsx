"use client";

import { HelpCircle, Star } from "lucide-react";
import { btnPrimary } from "@/components/layout/user/PageContainer";
import type { TopRatedMaster } from "@/lib/api/copier";
import type { MasterAccountDetails } from "@/lib/mock/masterDetail";
import { money } from "@/lib/utils";

type MasterProfileCardProps = {
  master: TopRatedMaster;
  details: MasterAccountDetails;
  onCopyClick?: () => void;
  readOnly?: boolean;
  copyDisabledMessage?: string;
  email?: string;
  accountLogin?: string;
};

function riskLabel(score: number) {
  return `${score} risk`;
}

export default function MasterProfileCard({
  master,
  details,
  onCopyClick,
  readOnly,
  copyDisabledMessage,
  email,
  accountLogin,
}: MasterProfileCardProps) {
  const initials = master.displayName.slice(0, 2).toUpperCase();

  return (
    <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Left — avatar + CTA */}
        <div className="flex shrink-0 flex-col items-center text-center lg:w-[220px]">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--app-primary-solid)_15%,var(--app-mix-base))] text-3xl font-bold text-[color:var(--app-primary-solid)]">
            {initials}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[var(--app-text-primary)]">{master.displayName}</h1>
          <p className="mt-1 flex items-center justify-center gap-1 text-[15px] text-[var(--app-text-muted)]">
            <Star className="h-3.5 w-3.5 fill-[color:var(--app-primary-solid)] text-[color:var(--app-primary-solid)]" />
            {master.expertise}
          </p>
          {readOnly ? (
            <div className="mt-5 w-full space-y-2 text-left text-sm">
              {email ? (
                <p className="text-[var(--app-text-muted)]">
                  Email: <span className="font-medium text-[var(--app-text-primary)]">{email}</span>
                </p>
              ) : null}
              {accountLogin ? (
                <p className="text-[var(--app-text-muted)]">
                  MT5: <span className="font-medium text-[var(--app-text-primary)]">{accountLogin}</span>
                </p>
              ) : null}
            </div>
          ) : copyDisabledMessage ? (
            <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              {copyDisabledMessage}
            </p>
          ) : onCopyClick ? (
            <>
              <button
                type="button"
                onClick={onCopyClick}
                className={`${btnPrimary} mt-5 w-full rounded-full py-3 text-[15px] uppercase tracking-wide`}
              >
                Set up copying
              </button>
              <p className="mt-2 text-sm text-[var(--app-text-muted)]">
                Minimum investment {money(master.minCopyAmount)}
              </p>
            </>
          ) : null}
        </div>

        {/* Right — stats + strategy */}
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            <div>
              <p className="flex items-center gap-1 text-sm text-[var(--app-text-muted)]">
                Risk score
                <HelpCircle className="h-3.5 w-3.5" aria-hidden />
              </p>
              <span className="mt-1.5 inline-flex rounded-full bg-[color-mix(in_oklab,var(--app-primary-solid)_15%,var(--app-mix-base))] px-2.5 py-0.5 text-[15px] font-semibold text-[color:var(--app-primary-solid)]">
                {riskLabel(master.riskScore)}
              </span>
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Equity</p>
              <p className="mt-1.5 text-lg font-bold text-[var(--app-text-primary)]">{money(details.equity)}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">Commission</p>
              <p className="mt-1.5 text-lg font-bold text-[var(--app-text-primary)]">{master.commissionPct}% from copiers</p>
            </div>
            <div>
              <p className="text-sm text-[var(--app-text-muted)]">With Us</p>
              <p className="mt-1.5 text-lg font-bold text-[var(--app-text-primary)]">{details.withUsDays}d</p>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--app-border)] pt-5">
            <p className="text-sm text-[var(--app-text-muted)]">Strategy Description</p>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--app-text-secondary)]">
              {details.strategySegments.join(" | ")}
            </p>
            {details.telegramLink ? (
              <p className="mt-3 text-[15px] text-[var(--app-text-secondary)]">
                Join chat:{" "}
                <a
                  href={details.telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[color:var(--app-primary-solid)] hover:underline"
                >
                  {details.telegramLink}
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
