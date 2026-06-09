"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  AuthFormHeader,
  AuthField,
  authInputClass,
  AuthSubmitButton,
  AuthErrorBox,
} from "@/components/auth/AuthSplitLayout";
import AuthPasswordInput from "@/components/auth/AuthPasswordInput";
import { loginAdmin } from "@/lib/api/auth.admin";
import { filterEmail, filterPassword, LIMITS, validateLoginForm } from "@/lib/auth-validation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validateLoginForm({ email, password });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await loginAdmin({ email: email.trim().toLowerCase(), password });
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout variant="admin">
      <AuthFormHeader title="Admin Sign In" subtitle="Enter your credentials to access the admin console." />
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error ? <AuthErrorBox message={error} /> : null}
        <AuthField label="Admin Email">
          <input
            type="email"
            required
            autoComplete="email"
            maxLength={LIMITS.email}
            value={email}
            onChange={(e) => setEmail(filterEmail(e.target.value))}
            className={authInputClass}
            placeholder="admin@example.com"
          />
        </AuthField>
        <AuthField label="Password">
          <AuthPasswordInput
            autoComplete="current-password"
            value={password}
            onChange={(v) => setPassword(filterPassword(v))}
            placeholder="Enter your password"
          />
        </AuthField>
        <AuthSubmitButton loading={loading} loadingText="Signing in...">
          Launch Console
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
