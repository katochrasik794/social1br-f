"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { useSidebar } from "@/providers/SidebarProvider";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { ADMIN_MENU } from "./adminMenu";
import { fetchAdminMe, type AdminProfile } from "@/lib/api/auth.admin";
import { clearAdminToken } from "@/lib/auth-storage";

export default function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setMobileMenuOpen, sidebarCollapsed } = useSidebar();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  useEffect(() => {
    fetchAdminMe()
      .then(setAdmin)
      .catch(() => setAdmin(null));
  }, [pathname]);

  function handleLogout() {
    clearAdminToken();
    router.push("/admin/login");
  }

  const breadcrumbs = useMemo(() => {
    const cleanPath = pathname.replace(/^\/admin\/?/, "");
    const items: { label: string; href?: string }[] = [{ label: "Admin", href: "/admin/dashboard" }];

    for (const section of ADMIN_MENU) {
      for (const item of section.items) {
        if (item.children) {
          const child = item.children.find((c) => cleanPath.startsWith(c.to));
          if (child) {
            items.push({ label: item.label });
            items.push({ label: child.label });
            return items;
          }
        } else if (cleanPath.startsWith(item.to)) {
          items.push({ label: item.label });
          return items;
        }
      }
    }
    return items;
  }, [pathname]);

  return (
    <>
      <header
        className={`app-shell-panel fixed top-0 z-40 flex h-16 items-center justify-between border-b px-4 transition-all lg:px-6 ${
          sidebarCollapsed ? "lg:left-20 lg:w-[calc(100%-5rem)]" : "lg:left-72 lg:w-[calc(100%-18rem)]"
        } left-0 w-full`}
      >
        <div className="flex items-center gap-3">
          <button type="button" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[var(--app-text-muted)]">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 ? <span>/</span> : null}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[color:var(--app-primary-solid)]">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--app-text-primary)]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {admin ? (
            <span className="hidden text-sm text-[var(--app-text-secondary)] sm:block">{admin.email}</span>
          ) : null}
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-muted)]"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
      <div className="h-16" aria-hidden />
    </>
  );
}
