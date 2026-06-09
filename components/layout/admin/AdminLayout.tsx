"use client";

import { useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { SidebarProvider, useSidebar } from "@/providers/SidebarProvider";
import { ToastProvider } from "@/components/ui/Toast";

function BodyClass() {
  useEffect(() => {
    document.body.classList.remove("client-route");
    document.body.classList.add("admin-route");
    return () => document.body.classList.remove("admin-route");
  }, []);
  return null;
}

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useSidebar();
  return (
    <div className="flex min-h-screen">
      <BodyClass />
      <AdminSidebar />
      <div className={`flex min-w-0 flex-1 flex-col transition-all ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <AdminTopbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SidebarProvider>
        <AdminShellInner>{children}</AdminShellInner>
      </SidebarProvider>
    </ToastProvider>
  );
}
