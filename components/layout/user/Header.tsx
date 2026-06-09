"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Wallet,
  LogOut,
  ArrowDownToLine,
  ArrowUpFromLine,
  UserPlus,
} from "lucide-react";
import { useSidebar } from "@/providers/SidebarProvider";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { buildUserBreadcrumbs } from "@/lib/userBreadcrumbs";
import { money } from "@/lib/utils";
import { fetchUserMe, type UserProfile } from "@/lib/api/auth.user";
import { fetchTradingAccounts } from "@/lib/api/trading";
import { fetchUserActivities, type UserActivity } from "@/lib/api/activities";
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

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function activityIcon(type: UserActivity["type"]) {
  if (type === "account_opened") return UserPlus;
  if (type === "deposit") return ArrowDownToLine;
  return ArrowUpFromLine;
}

function statusTone(status: string | null) {
  if (status === "approved" || status === "active") return "text-emerald-600";
  if (status === "rejected") return "text-red-500";
  return "text-amber-600";
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { setMobileMenuOpen } = useSidebar();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mt5TotalBalance, setMt5TotalBalance] = useState(0);
  const [activities, setActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    fetchUserMe()
      .then(setUser)
      .catch(() => setUser(null));
    fetchTradingAccounts()
      .then((accounts) => setMt5TotalBalance(accounts.reduce((sum, a) => sum + a.balance, 0)))
      .catch(() => setMt5TotalBalance(0));
    fetchUserActivities()
      .then(setActivities)
      .catch(() => setActivities([]));
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
        <div className="app-shell-panel flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border px-3 py-2 shadow-md sm:px-4">
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
            <div
              className="inline-flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--app-text-primary)]"
              title="Total MT5 balance"
            >
              <Wallet className="h-4 w-4 text-[color:var(--app-primary-solid)]" />
              {money(mt5TotalBalance)}
            </div>

            <ThemeToggle className={iconBtn} />

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                className={`${iconBtn} relative`}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {activities.length > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--app-primary-solid)] text-[10px] font-bold text-white">
                    {activities.length}
                  </span>
                ) : null}
              </button>
              {showNotifications ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl">
                  <div className="border-b border-[var(--app-border)] px-4 py-3">
                    <p className="text-sm font-bold text-[var(--app-text-primary)]">Recent activity</p>
                    <p className="text-xs text-[var(--app-text-muted)]">Last 5 account, deposit & withdrawal events</p>
                  </div>
                  {activities.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm font-medium text-[var(--app-text-muted)]">
                      No activity yet
                    </p>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto py-1">
                      {activities.map((item) => {
                        const Icon = activityIcon(item.type);
                        return (
                          <li
                            key={item.id}
                            className="flex gap-3 border-b border-[var(--app-border)] px-4 py-3 last:border-0"
                          >
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--app-primary-solid)_10%,var(--app-mix-base))] text-[color:var(--app-primary-solid)]">
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold leading-snug text-[var(--app-text-primary)]">
                                {item.message}
                              </p>
                              <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                                {formatRelativeTime(item.createdAt)}
                                {item.status ? (
                                  <span className={`ml-2 font-semibold capitalize ${statusTone(item.status)}`}>
                                    {item.status}
                                  </span>
                                ) : null}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
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
