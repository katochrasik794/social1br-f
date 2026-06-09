"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, Bell, ChevronDown, User, Wallet, LogOut } from "lucide-react";
import { useSidebar } from "@/providers/SidebarProvider";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { buildUserBreadcrumbs } from "@/lib/userBreadcrumbs";
import { mockUser } from "@/lib/mock/user";
import { money } from "@/lib/utils";
import { fetchUserMe, type UserProfile } from "@/lib/api/auth.user";
import { clearUserToken } from "@/lib/auth-storage";

const iconBtn =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--app-border)] text-[var(--app-text-secondary)] transition hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text-primary)]";

function displayName(user: UserProfile | null) {
  if (!user) return "User";
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }
  return user.email.split("@")[0];
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { setMobileMenuOpen } = useSidebar();
  const [showWallet, setShowWallet] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUserMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, [pathname]);

  const breadcrumbs = useMemo(() => buildUserBreadcrumbs(pathname), [pathname]);
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard";

  function handleLogout() {
    clearUserToken();
    router.push("/login");
  }

  return (
    <>
      <header className="fixed top-2 right-0 z-40 w-full px-4 lg:left-72 lg:w-[calc(100%-18rem)] lg:px-6">
        <div className="app-shell-panel mx-auto flex max-w-[2400px] items-center justify-between gap-3 rounded-xl border px-3 py-2 shadow-md sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" className={`${iconBtn} lg:hidden`} onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <nav className="hidden min-w-0 md:block">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[var(--app-text-muted)]">
                {breadcrumbs.map((crumb, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    {i > 0 ? <span>/</span> : null}
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-[color:var(--app-primary-solid)]">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-[var(--app-text-primary)]">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            <p className="truncate text-sm font-semibold text-[var(--app-text-primary)] md:hidden">{pageTitle}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowWallet(!showWallet);
                  setShowProfile(false);
                }}
                className="inline-flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--app-text-primary)]"
              >
                <Wallet className="h-4 w-4 text-[color:var(--app-primary-solid)]" />
                {money(mockUser.walletBalance + mockUser.mt5Balance)}
                <ChevronDown className="h-4 w-4 text-[var(--app-text-muted)]" />
              </button>
              {showWallet ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-3 shadow-xl">
                  <p className="text-sm text-[var(--app-text-muted)]">Wallet</p>
                  <p className="font-bold text-[var(--app-text-primary)]">{money(mockUser.walletBalance)}</p>
                  <p className="mt-2 text-sm text-[var(--app-text-muted)]">MT5 Total</p>
                  <p className="font-bold text-[var(--app-text-primary)]">{money(mockUser.mt5Balance)}</p>
                </div>
              ) : null}
            </div>

            <ThemeToggle className={iconBtn} />

            <button type="button" className={`${iconBtn} relative`}>
              <Bell className="h-5 w-5" />
              {mockUser.notifications > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--app-primary-solid)] text-[10px] font-bold text-white">
                  {mockUser.notifications}
                </span>
              ) : null}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowWallet(false);
                }}
                className="inline-flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-2 py-1.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--app-primary-solid)_15%,var(--app-mix-base))] text-[color:var(--app-primary-solid)]">
                  <User className="h-4 w-4" />
                </span>
                <span className="hidden text-sm font-semibold text-[var(--app-text-primary)] sm:block">
                  {displayName(user)}
                </span>
                <ChevronDown className="h-4 w-4 text-[var(--app-text-muted)]" />
              </button>
              {showProfile ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] p-3 shadow-xl">
                  <p className="font-semibold text-[var(--app-text-primary)]">{displayName(user)}</p>
                  <p className="text-sm text-[var(--app-text-muted)]">{user?.email ?? ""}</p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 flex w-full items-center gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2 text-sm font-medium text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-muted)]"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      <div className="h-[72px]" aria-hidden />
    </>
  );
}
