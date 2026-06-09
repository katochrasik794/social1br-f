"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMasterProfile } from "@/providers/MasterProfileProvider";

const BASE_TABS = [
  { label: "Top Rated", href: "/copier/rating", match: (p: string) => p.startsWith("/copier/rating") || p === "/copier/list" },
  { label: "Copier Area", href: "/copier/area", match: (p: string) => p.startsWith("/copier/area") },
  { label: "Master Area", href: "/copier/master", match: (p: string) => p.startsWith("/copier/master"), dynamicLabel: true },
  { label: "Terms & Conditions", href: "/copier/terms", match: (p: string) => p.startsWith("/copier/terms") },
];

export default function CopierTabNav() {
  const pathname = usePathname();
  const { status: masterStatus } = useMasterProfile();
  const masterTabLabel =
    masterStatus === "approved" || masterStatus === "pending" ? "Master Area" : "Become Master";
  const TABS = BASE_TABS.map((tab) =>
    tab.dynamicLabel ? { ...tab, label: masterTabLabel } : tab
  );

  return (
    <nav className="app-shell-panel border-b">
      <div className="-mb-px flex gap-0 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] transition sm:px-6 sm:text-sm ${
                active
                  ? "border-[color:var(--app-primary-solid)] text-[color:var(--app-primary-solid)]"
                  : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
