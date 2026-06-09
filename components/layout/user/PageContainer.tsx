import Link from "next/link";

/** Full-width responsive shell — stretches with the main content area on every screen size. */
export const pageShellClass = "w-full min-w-0";

export default function PageContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${pageShellClass} ${className}`.trim()}>{children}</div>;
}

export function HeroCard({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[color:var(--app-primary-solid)]" aria-hidden />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_oklab,var(--app-primary-solid)_10%,var(--app-mix-base))] text-[color:var(--app-primary-solid)]">
            <Icon className="h-7 w-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--app-text-primary)] leading-none">{title}</h1>
            <p className="mt-1.5 text-sm font-medium text-[var(--app-text-secondary)]">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}

export function InlineBreadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--app-text-muted)]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 ? <span className="text-[var(--app-text-muted)]">/</span> : null}
          {item.href ? (
            <Link href={item.href} className="transition hover:text-[color:var(--app-primary-solid)]">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? "text-[var(--app-text-primary)]" : "text-[var(--app-text-secondary)]"}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

export function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)]">{label}</p>
      <h2 className="mt-1 text-lg font-bold text-[var(--app-text-primary)]">{title}</h2>
    </div>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-md bg-[color:var(--app-primary-solid)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--app-text-primary)] transition hover:bg-[var(--app-surface-muted)]";
