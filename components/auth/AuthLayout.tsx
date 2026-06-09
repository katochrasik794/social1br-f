"use client";

import { useEffect } from "react";
import AuthSplitLayout from "./AuthSplitLayout";

export default function AuthLayout({
  children,
  variant = "user",
}: {
  children: React.ReactNode;
  variant?: "user" | "admin";
}) {
  useEffect(() => {
    document.body.classList.remove("client-route", "admin-route");
    document.body.classList.add("auth-route");
    return () => document.body.classList.remove("auth-route");
  }, []);

  return <AuthSplitLayout variant={variant}>{children}</AuthSplitLayout>;
}
