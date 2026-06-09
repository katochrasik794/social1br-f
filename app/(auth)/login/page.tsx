"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthFormHeader,
  AuthField,
  authInputClass,
  AuthSubmitButton,
  AuthErrorBox,
  AuthFooterLink,
  AuthLink,
} from "@/components/auth/AuthSplitLayout";
import AuthPasswordInput from "@/components/auth/AuthPasswordInput";
import { loginUser } from "@/lib/api/auth.user";
import { filterEmail, filterPassword, LIMITS, validateLoginForm } from "@/lib/auth-validation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

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
      await loginUser({ email: email.trim().toLowerCase(), password });
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AuthFormHeader title="Sign In" subtitle="Enter your credentials to access the platform." />
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error ? <AuthErrorBox message={error} /> : null}
        <AuthField label="Email Address">
          <input
            type="email"
            required
            autoComplete="email"
            maxLength={LIMITS.email}
            value={email}
            onChange={(e) => setEmail(filterEmail(e.target.value))}
            className={authInputClass}
            placeholder="Enter your email address"
          />
        </AuthField>
        <AuthField
          label="Password"
          action={
            <AuthLink href="/forgot-password" className="text-xs normal-case tracking-normal sm:text-sm">
              Forgot password?
            </AuthLink>
          }
        >
          <AuthPasswordInput
            autoComplete="current-password"
            value={password}
            onChange={(v) => setPassword(filterPassword(v))}
            placeholder="Enter your password"
          />
        </AuthField>
        <AuthSubmitButton loading={loading} loadingText="Signing in...">
          Launch Platform
        </AuthSubmitButton>
      </form>
      <AuthFooterLink>
        No account? <AuthLink href="/register">Register</AuthLink>
      </AuthFooterLink>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--auth-muted)]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
