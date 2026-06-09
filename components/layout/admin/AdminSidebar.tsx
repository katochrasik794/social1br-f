"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, X, PanelLeftClose, PanelLeft } from "lucide-react";
import { ADMIN_MENU } from "./adminMenu";
import { useSidebar } from "@/providers/SidebarProvider";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen, sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const cleanPath = pathname.replace(/^\/admin\/?/, "");

  useEffect(() => {
    ADMIN_MENU.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children?.some((c) => cleanPath.startsWith(c.to))) {
          setOpenMenus((prev) => ({ ...prev, [item.to]: true }));
        }
      });
    });
  }, [cleanPath]);

  return (
    <>
      {mobileMenuOpen ? (
        <button type="button" className="fixed inset-0 z-[60] bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      ) : null}

      <aside
        className={`app-shell-panel fixed inset-y-0 left-0 z-[70] flex flex-col border-r shadow-lg transition-all duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarCollapsed ? "w-20" : "w-72"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--app-border)] px-4">
          {!sidebarCollapsed ? (
            <Link href="/admin/dashboard" className="text-lg font-bold text-[var(--app-text-primary)]">
              Admin<span className="text-[color:var(--app-primary-solid)]">Panel</span>
            </Link>
          ) : null}
          <button type="button" className="hidden lg:inline-flex" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <button type="button" className="lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {ADMIN_MENU.map((section) => (
            <div key={section.label} className="mb-4">
              {!sidebarCollapsed ? (
                <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--app-text-secondary)]">
                  {section.label}
                </p>
              ) : null}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.children
                  ? item.children.some((c) => cleanPath.startsWith(c.to))
                  : cleanPath.startsWith(item.to);
                const hasChildren = Boolean(item.children?.length);

                return (
                  <div key={item.to} className="mt-1">
                    {hasChildren ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setOpenMenus((prev) => ({ ...prev, [item.to]: !prev[item.to] }))}
                          className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[14px] font-medium transition ${
                            isActive
                              ? "bg-[color-mix(in_oklab,var(--app-primary-solid)_12%,var(--app-mix-base))] text-[var(--app-text-primary)]"
                              : "text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-muted)]"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {!sidebarCollapsed ? (
                            <>
                              <span className="flex-1 text-left">{item.label}</span>
                              {openMenus[item.to] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </>
                          ) : null}
                        </button>
                        {!sidebarCollapsed && openMenus[item.to] ? (
                          <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-[color:var(--app-primary-solid)] pl-2">
                            {item.children!.map((child) => (
                              <Link
                                key={child.to}
                                href={`/admin/${child.to}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block rounded-md py-1.5 pl-2 text-sm font-medium ${
                                  cleanPath.startsWith(child.to)
                                    ? "font-semibold text-[color:var(--app-primary-solid)]"
                                    : "text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)]"
                                }`}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <Link
                        href={`/admin/${item.to}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[14px] font-medium transition ${
                          isActive
                            ? "bg-[color-mix(in_oklab,var(--app-primary-solid)_12%,var(--app-mix-base))] text-[var(--app-text-primary)]"
                            : "text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-muted)]"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!sidebarCollapsed ? item.label : null}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
