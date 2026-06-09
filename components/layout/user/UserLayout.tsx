"use client";

import { useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { SidebarProvider } from "@/providers/SidebarProvider";
import { MasterProfileProvider } from "@/providers/MasterProfileProvider";

function BodyClass({ route }: { route: "client" | "admin" }) {
  useEffect(() => {
    document.body.classList.remove("client-route", "admin-route");
    document.body.classList.add(`${route}-route`);
    return () => document.body.classList.remove(`${route}-route`);
  }, [route]);
  return null;
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MasterProfileProvider>
        <BodyClass route="client" />
        <div className="flex min-h-screen w-full min-w-0 overflow-x-hidden">
          <Sidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col sidebar:pl-72">
            <Header />
            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 md:px-8 md:py-6 lg:px-10 xl:px-12 lg:py-8">
              {children}
            </main>
          </div>
        </div>
      </MasterProfileProvider>
    </SidebarProvider>
  );
}
