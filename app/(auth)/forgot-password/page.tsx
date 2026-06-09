"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthFormHeader,
  AuthField,
  authInputClass,
  AuthSubmitButton,
  AuthErrorBox,
  AuthInfoBox,
  AuthFooterLink,
  AuthLink,
} from "@/components/auth/AuthSplitLayout";
import AuthPasswordInput from "@/components/auth/AuthPasswordInput";
import { forgotPassword, verifyResetOtp, resetPassword } from "@/lib/api/auth.user";
import {
  filterEmail,
  filterOtp,
  filterPassword,
  LIMITS,
  validateEmail,
  validatePassword,
} from "@/lib/auth-validation";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword({ email: email.trim().toLowerCase() });
      setMessage(res.message);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (otp.length !== LIMITS.otp) {
      setError("Enter the 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyResetOtp({ email: email.trim().toLowerCase(), otp });
      setResetToken(res.resetToken);
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const passwordErr = validatePassword(password);
    if (passwordErr) {
      setError(passwordErr);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetToken, password);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  const subtitles: Record<Step, string> = {
    email: "We will send a verification code to your email.",
    otp: "Enter the code from your email. Dev OTP: 123456",
    password: "Choose a strong new password for your account.",
  };

  return (
    <>
      <AuthFormHeader title="Reset Password" subtitle={subtitles[step]} />

      {step === "email" ? (
        <form onSubmit={handleEmail} className="space-y-5" noValidate>
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
          <AuthSubmitButton loading={loading} loadingText="Sending...">
            Send OTP
          </AuthSubmitButton>
        </form>
      ) : null}

      {step === "otp" ? (
        <form onSubmit={handleOtp} className="space-y-5" noValidate>
          {message ? <AuthInfoBox message={message} /> : null}
          {error ? <AuthErrorBox message={error} /> : null}
          <AuthField label="Verification Code">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={LIMITS.otp}
              value={otp}
              onChange={(e) => setOtp(filterOtp(e.target.value))}
              className={authInputClass}
              placeholder="Enter 6-digit code"
            />
          </AuthField>
          <AuthSubmitButton loading={loading} loadingText="Verifying...">
            Verify OTP
          </AuthSubmitButton>
        </form>
      ) : null}

      {step === "password" ? (
        <form onSubmit={handleReset} className="space-y-5" noValidate>
          {error ? <AuthErrorBox message={error} /> : null}
          <AuthField label="New Password">
            <AuthPasswordInput
              autoComplete="new-password"
              minLength={LIMITS.passwordMin}
              value={password}
              onChange={(v) => setPassword(filterPassword(v))}
              placeholder="Enter your new password"
            />
          </AuthField>
          <AuthField label="Confirm Password">
            <AuthPasswordInput
              autoComplete="new-password"
              minLength={LIMITS.passwordMin}
              value={confirmPassword}
              onChange={(v) => setConfirmPassword(filterPassword(v))}
              placeholder="Re-enter your password"
            />
          </AuthField>
          <AuthSubmitButton loading={loading} loadingText="Updating...">
            Update Password
          </AuthSubmitButton>
        </form>
      ) : null}

      <AuthFooterLink>
        <AuthLink href="/login">Back to sign in</AuthLink>
      </AuthFooterLink>
    </>
  );
}
