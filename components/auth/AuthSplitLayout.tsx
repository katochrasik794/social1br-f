"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AuthHeroPanel from "./AuthHeroPanel";

type AuthSplitLayoutProps = {
  children: React.ReactNode;
  variant?: "user" | "admin";
};

export default function AuthSplitLayout({ children, variant = "user" }: AuthSplitLayoutProps) {
  const brandLabel = variant === "admin" ? "ADMIN PANEL" : "SOCIAL TRADING";

  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:flex-row">
      {/* Left hero — desktop only */}
      <div className="hidden lg:block lg:min-h-screen">
        <AuthHeroPanel variant={variant} />
      </div>

      {/* Form panel — full screen on mobile */}
      <div className="relative flex min-h-screen flex-col bg-[var(--auth-form-bg)]">
        <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6 lg:right-8 lg:top-8">
          <ThemeToggle className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--auth-input-border)] bg-[var(--auth-input-bg)] text-[var(--app-text-primary)]" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8 lg:px-10 xl:px-12">
          {/* Narrow form column — matches reference */}
          <div className="w-full max-w-[380px]">
            <Link
              href={variant === "admin" ? "/admin/login" : "/login"}
              className="mb-8 inline-flex items-center gap-2.5 sm:mb-10"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--auth-input-border)] bg-[var(--auth-input-bg)]">
                <span className="h-3 w-3 rounded-sm bg-[color:var(--app-primary-solid)]" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--app-text-primary)] sm:text-[13px]">
                {brandLabel}
              </span>
            </Link>

            {children}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 px-5 pb-5 sm:justify-end sm:px-8 sm:pb-6 lg:px-10">
          <span className="h-2 w-2 rounded-full bg-[color:var(--app-primary-solid)]" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-[var(--auth-muted)] sm:text-xs">
            Server Status: Online
          </span>
        </div>
      </div>
    </div>
  );
}

export function AuthFormHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-7 sm:mb-8">
      <h2 className="text-[2rem] font-bold leading-tight tracking-tight text-[var(--app-text-primary)] sm:text-[2.35rem]">
        {title}
      </h2>
      {subtitle ? <p className="mt-2.5 text-sm leading-relaxed text-[var(--auth-muted)] sm:text-base">{subtitle}</p> : null}
    </div>
  );
}

export function AuthField({
  label,
  children,
  action,
}: {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div>
      <div className={`mb-2.5 flex items-center gap-3 ${action ? "justify-between" : ""}`}>
        <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--auth-label)] sm:text-xs">
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}

export const authInputClass =
  "w-full rounded-md border border-[var(--auth-input-border)] bg-[var(--auth-input-bg)] px-4 py-3.5 text-base text-[var(--app-text-primary)] outline-none transition placeholder:text-[var(--auth-muted)] focus:border-[color-mix(in_oklab,var(--app-primary-solid)_50%,var(--auth-input-border))] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--app-primary-solid)_20%,transparent)] sm:py-4";

export function AuthSubmitButton({
  children,
  loading,
  loadingText,
}: {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group mt-6 flex w-full items-center justify-between rounded-md bg-[var(--auth-btn-bg)] px-5 py-4 text-sm font-bold uppercase tracking-[0.1em] text-[var(--auth-btn-text)] transition hover:opacity-90 disabled:opacity-50 sm:py-[1.125rem] sm:text-base"
    >
      <span>{loading ? loadingText ?? "Please wait..." : children}</span>
      <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
    </button>
  );
}

export function AuthErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 sm:text-base dark:text-rose-400">
      {message}
    </div>
  );
}

export function AuthInfoBox({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-[color-mix(in_oklab,var(--app-primary-solid)_30%,transparent)] bg-[color-mix(in_oklab,var(--app-primary-solid)_10%,transparent)] px-4 py-3 text-sm text-[color:var(--app-primary-solid)] sm:text-base">
      {message}
    </div>
  );
}

export function AuthFooterLink({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 text-center text-sm text-[var(--auth-muted)] sm:text-base">{children}</div>;
}

export function AuthLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`font-semibold text-[var(--app-text-primary)] underline-offset-4 hover:underline ${className}`}
    >
      {children}
    </Link>
  );
}
