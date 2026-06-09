import Link from "next/link";
import { Copy, Layers, Network, ArrowRight } from "lucide-react";

const modules = [
  { name: "Copier", icon: Copy, href: "/admin/copier/copiers", kpis: ["12 Active Copies", "89 Masters", "$2.4M AUM"] },
  { name: "PAMM", icon: Layers, href: "/admin/pamm/investors", kpis: ["42 Investors", "3 Pools", "$4.9M NAV"] },
  { name: "MAM", icon: Network, href: "/admin/mam/investors", kpis: ["73 Links", "2 Managers", "$1.5M AUM"] },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-[2400px] space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--app-text-primary)]">Admin Dashboard</h1>
        <p className="text-sm text-[var(--app-text-secondary)]">Social trading module overview</p>
      </div>

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
                <h2 className="text-lg font-bold">{mod.name}</h2>
              </div>
              <ArrowRight className="h-5 w-5 text-[var(--app-text-muted)] group-hover:text-[color:var(--app-primary-solid)]" />
            </div>
            <ul className="mt-4 space-y-2">
              {mod.kpis.map((kpi) => (
                <li key={kpi} className="text-sm text-[var(--app-text-secondary)]">{kpi}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-semibold text-[color:var(--app-primary-solid)]">Manage {mod.name} →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
