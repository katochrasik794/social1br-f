"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Copy,
  Layers,
  Network,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { useSidebar } from "@/providers/SidebarProvider";
import { mockMasterProfile } from "@/lib/mock/copier";
import { clearUserToken } from "@/lib/auth-storage";

function NavSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--app-text-secondary)] first:pt-0.5">
      {children}
    </p>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mobileMenuOpen, setMobileMenuOpen } = useSidebar();
  const routeMenu = pathname.startsWith("/copier") ? "copier" : pathname.startsWith("/pamm") ? "pamm" : pathname.startsWith("/mam") ? "mam" : null;
  const [manualMenu, setManualMenu] = useState<string | null>(null);
  const openMenu = manualMenu ?? routeMenu;

  const isMaster = mockMasterProfile.status === "approved";

  const toggleMenu = (menu: string) => setManualMenu(openMenu === menu ? null : menu);

  const itemBase =
    "group/nav flex min-h-[38px] w-full items-center gap-2 border border-transparent px-2 py-1.5 text-[13px] font-medium outline-none transition duration-200 rounded-lg";
  const itemIdle =
    "text-[var(--app-text-secondary)] hover:border-[var(--app-border)]/90 hover:bg-[var(--app-surface)] hover:text-[var(--app-text-primary)] hover:shadow-[0_6px_20px_-4px_rgba(15,23,42,0.08)]";
  const itemActive =
    "border-[color-mix(in_oklab,var(--app-primary-solid)_22%,#e2e8f0)] bg-[color-mix(in_oklab,var(--app-primary-solid)_12%,var(--app-mix-base))] font-semibold text-[var(--app-text-primary)] shadow-[0_1px_0_rgba(15,23,42,0.04),0_4px_14px_-6px_color-mix(in_oklab,var(--app-primary-solid)_28%,transparent)]";

  const subLink = (active: boolean) =>
    `block min-h-[32px] rounded-md py-1.5 pl-2.5 pr-1.5 text-xs font-medium transition duration-200 ${
      active
        ? "bg-[color-mix(in_oklab,var(--app-primary-solid)_10%,var(--app-mix-base))] font-semibold text-[color:var(--app-primary-solid)]"
        : "text-[var(--app-text-secondary)] hover:bg-[var(--app-surface)]/90 hover:text-[var(--app-text-primary)]"
    }`;

  const iconWrap = (active: boolean) =>
    `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition duration-200 ${
      active
        ? "border-[color:var(--app-primary-solid)] bg-[color:var(--app-primary-solid)] text-white shadow-[0_4px_12px_-4px_color-mix(in_oklab,var(--app-primary-solid)_45%,transparent)]"
        : "border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-secondary)] group-hover/nav:border-[color-mix(in_oklab,var(--app-primary-solid)_25%,var(--app-border))] group-hover/nav:text-[color:var(--app-primary-solid)]"
    }`;

  const isDash = pathname === "/dashboard";

  return (
    <>
      {mobileMenuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <aside
        className={`app-shell-panel fixed inset-y-0 left-0 z-[70] flex w-72 flex-col border-r shadow-lg transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--app-border)] px-5">
          <Link href="/dashboard" className="text-lg font-bold text-[var(--app-text-primary)]">
            Social<span className="text-[color:var(--app-primary-solid)]">Trading</span>
          </Link>
          <button type="button" className="lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5 text-[var(--app-text-secondary)]" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavSectionTitle>Overview</NavSectionTitle>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`${itemBase} ${isDash ? itemActive : itemIdle}`}
          >
            <span className={iconWrap(isDash)}>
              <LayoutDashboard className="h-4 w-4" strokeWidth={2} />
            </span>
            Dashboard
          </Link>

          <NavSectionTitle>Social Trading</NavSectionTitle>

          {/* Copier */}
          <div className="mt-1">
            <button type="button" onClick={() => toggleMenu("copier")} className={`${itemBase} ${pathname.startsWith("/copier") ? itemActive : itemIdle}`}>
              <span className={iconWrap(pathname.startsWith("/copier"))}>
                <Copy className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="flex-1 text-left">Copier</span>
              {openMenu === "copier" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {openMenu === "copier" ? (
              <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-[color:var(--app-primary-solid)] pl-2">
                <Link href="/copier/rating" onClick={() => setMobileMenuOpen(false)} className={subLink(pathname.startsWith("/copier/rating") || pathname === "/copier/list")}>Top Rated</Link>
                <Link href="/copier/area" onClick={() => setMobileMenuOpen(false)} className={subLink(pathname === "/copier/area")}>Copier Area</Link>
                <Link href="/copier/master" onClick={() => setMobileMenuOpen(false)} className={subLink(pathname === "/copier/master")}>
                  {isMaster ? "Master Area" : "Become Master"}
                </Link>
              </div>
            ) : null}
          </div>

          {/* PAMM */}
          <div className="mt-1">
            <button type="button" onClick={() => toggleMenu("pamm")} className={`${itemBase} ${pathname.startsWith("/pamm") ? itemActive : itemIdle}`}>
              <span className={iconWrap(pathname.startsWith("/pamm"))}>
                <Layers className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="flex-1 text-left">PAMM</span>
              {openMenu === "pamm" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {openMenu === "pamm" ? (
              <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-[color:var(--app-primary-solid)] pl-2">
                <Link href="/pamm/investor" onClick={() => setMobileMenuOpen(false)} className={subLink(pathname === "/pamm/investor")}>Investor Area</Link>
                <Link href="/pamm/manager" onClick={() => setMobileMenuOpen(false)} className={subLink(pathname === "/pamm/manager")}>Manager Area</Link>
              </div>
            ) : null}
          </div>

          {/* MAM */}
          <div className="mt-1">
            <button type="button" onClick={() => toggleMenu("mam")} className={`${itemBase} ${pathname.startsWith("/mam") ? itemActive : itemIdle}`}>
              <span className={iconWrap(pathname.startsWith("/mam"))}>
                <Network className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="flex-1 text-left">MAM</span>
              {openMenu === "mam" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {openMenu === "mam" ? (
              <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-[color:var(--app-primary-solid)] pl-2">
                <Link href="/mam/investor" onClick={() => setMobileMenuOpen(false)} className={subLink(pathname === "/mam/investor")}>Investor Area</Link>
                <Link href="/mam/manager" onClick={() => setMobileMenuOpen(false)} className={subLink(pathname === "/mam/manager")}>Manager Area</Link>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="border-t border-[var(--app-border)] p-4">
          <button
            type="button"
            onClick={() => {
              clearUserToken();
              router.push("/login");
            }}
            className={`${itemBase} w-full ${itemIdle}`}
          >
            <span className={iconWrap(false)}>
              <LogOut className="h-4 w-4" strokeWidth={2} />
            </span>
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
