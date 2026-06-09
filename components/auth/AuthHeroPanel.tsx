"use client";

import Image from "next/image";

type AuthHeroPanelProps = {
  variant?: "user" | "admin";
};

export default function AuthHeroPanel({ variant = "user" }: AuthHeroPanelProps) {
  const tag = variant === "admin" ? "ADMIN CONSOLE / V1" : "SOCIAL TRADING / V1";

  return (
    <div className="auth-hero-panel relative flex min-h-screen flex-col overflow-hidden bg-[var(--auth-hero-bg)] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-10 xl:px-14">
      {/* Grid + glow */}
      <div className="auth-hero-grid pointer-events-none absolute inset-0 opacity-60" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 38%, var(--auth-hero-glow) 0%, transparent 68%)",
        }}
      />

      <p className="relative z-10 shrink-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--auth-muted)] sm:text-xs">
        {tag}
      </p>

      {/* Centered headline + platform preview */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-6 text-center lg:py-4">
        <h1 className="text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[0.92] tracking-tight text-[var(--app-text-primary)]">
          SOCIAL
        </h1>
        <h1 className="mt-1 text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[0.92] tracking-tight text-[var(--app-text-primary)]">
          trading
        </h1>
        <h1 className="mt-1 text-[clamp(1.65rem,4vw,3rem)] font-bold leading-[0.92] tracking-tight text-[var(--app-luxury-gold)]">
          made easy
        </h1>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--app-primary-solid)_40%,transparent)] bg-[color-mix(in_oklab,var(--app-primary-solid)_12%,transparent)] px-3.5 py-1.5 text-sm font-semibold text-[color:var(--app-primary-solid)]">
            <span className="h-2 w-2 rounded-full bg-[color:var(--app-primary-solid)]" />
            LIVE
          </span>
          <span className="text-sm text-[var(--auth-muted)] sm:text-base">
            {variant === "admin" ? "Administration portal" : "Copy · PAMM · MAM"}
          </span>
        </div>

        <div className="mt-5 flex w-full justify-center px-1 sm:mt-7">
          <Image
            src="/remm.png"
            alt="Social trading platform on desktop and mobile"
            width={594}
            height={420}
            priority
            quality={100}
            className="h-auto w-full max-w-[min(100%,640px)] object-contain brightness-105 contrast-[1.02] xl:max-w-[720px] 2xl:max-w-[780px]"
          />
        </div>
      </div>

      {/* Risk disclaimer footer */}
      <div className="relative z-10 shrink-0 border-t border-[var(--app-border)]/40 pt-4 sm:pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--auth-muted)] sm:text-[11px]">
          Risk Warning
        </p>
        <p className="mt-2 max-w-2xl text-[10px] leading-relaxed text-[var(--auth-muted)] sm:text-[11px] sm:leading-relaxed">
          Forex, CFD, and leveraged trading products are subject to substantial market risk and may not be
          suitable for all investors. You may lose some or all of your invested capital — losses can exceed
          your initial deposit. Past performance, copy-trading results, PAMM pool returns, and MAM account
          statistics are not indicative of future results. Only trade with funds you can afford to lose.
          Please read our risk disclosure and seek independent financial advice before trading.
        </p>
      </div>
    </div>
  );
}
