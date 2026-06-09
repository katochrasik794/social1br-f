import PageContainer from "@/components/layout/user/PageContainer";

export default function CopierTermsPage() {
  return (
    <PageContainer>
      <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-[var(--app-text-primary)]">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
          Copy trading terms, risk disclosures, and platform policies.
        </p>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--app-text-secondary)]">
          <p>
            By using the Social Trading copier service, you agree to follow all platform rules regarding master
            trader selection, allocation limits, commission structures, and risk management settings.
          </p>
          <p>
            Copy trading involves substantial risk. Past performance of master traders is not indicative of future
            results. You may lose some or all of your invested capital. Please read our full risk disclosure before
            copying any master.
          </p>
          <p className="text-[var(--app-text-muted)]">
            Full terms content will be added here.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
