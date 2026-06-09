import { HelpCircle } from "lucide-react";
import type { MasterAccountDetails } from "@/lib/mock/masterDetail";
import { money } from "@/lib/utils";

type MasterAccountCardsProps = {
  details: MasterAccountDetails;
};

function InfoLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1 text-[15px] text-[var(--app-text-muted)]">
      {children}
      <HelpCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
    </p>
  );
}

export default function MasterAccountCards({ details }: MasterAccountCardsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-[var(--app-text-primary)]">Account details</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <InfoLabel>Floating Profit</InfoLabel>
            <p className={`mt-1.5 text-lg font-bold ${details.floatingProfit >= 0 ? "text-[var(--app-text-primary)]" : "text-rose-500"}`}>
              {money(details.floatingProfit)}
            </p>
          </div>
          <div>
            <InfoLabel>Balance</InfoLabel>
            <p className="mt-1.5 text-lg font-bold text-[var(--app-text-primary)]">{money(details.balance)}</p>
          </div>
          <div>
            <InfoLabel>Master Trader&apos;s Bonus</InfoLabel>
            <p className="mt-1.5 text-lg font-bold text-[var(--app-text-primary)]">{money(details.bonus)}</p>
          </div>
          <div>
            <InfoLabel>Leverage</InfoLabel>
            <p className="mt-1.5 text-lg font-bold text-[var(--app-text-primary)]">{details.leverage}</p>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-[var(--app-text-primary)]">Risk management</h2>
        <div className="mt-5 space-y-6">
          <div>
            <InfoLabel>Maximum Unrealised Loss</InfoLabel>
            <p className="mt-1.5 text-lg font-bold text-rose-500">{money(details.maxUnrealisedLoss)}</p>
          </div>
          <div>
            <InfoLabel>Maximum Drawdown Duration</InfoLabel>
            <p className="mt-1.5 text-lg font-bold text-[var(--app-text-primary)]">{details.maxDrawdownDuration}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
