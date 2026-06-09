"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { registerUser, verifyOtp } from "@/lib/api/auth.user";
import {
  filterEmail,
  filterName,
  filterOtp,
  filterPassword,
  filterPhone,
  LIMITS,
  validateRegisterForm,
} from "@/lib/auth-validation";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validateRegisterForm({
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (otp.length !== LIMITS.otp) {
      setError("Enter the 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ email: email.trim().toLowerCase(), otp });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  if (step === "otp") {
    return (
      <>
        <AuthFormHeader
          title="Verify Email"
          subtitle={`Enter the 6-digit code sent to ${email}. Dev OTP: 123456`}
        />
        <form onSubmit={handleVerify} className="space-y-5">
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
            Verify & Continue
          </AuthSubmitButton>
        </form>
      </>
    );
  }

  return (
    <>
      <AuthFormHeader title="Create Account" subtitle="Start your social trading journey today." />
      <form onSubmit={handleRegister} className="space-y-5" noValidate>
        {error ? <AuthErrorBox message={error} /> : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField label="First Name">
            <input
              type="text"
              required
              autoComplete="given-name"
              maxLength={LIMITS.name}
              value={firstName}
              onChange={(e) => setFirstName(filterName(e.target.value))}
              className={authInputClass}
              placeholder="Enter your first name"
            />
          </AuthField>
          <AuthField label="Last Name">
            <input
              type="text"
              required
              autoComplete="family-name"
              maxLength={LIMITS.name}
              value={lastName}
              onChange={(e) => setLastName(filterName(e.target.value))}
              className={authInputClass}
              placeholder="Enter your last name"
            />
          </AuthField>
        </div>
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
        <AuthField label="Phone Number">
          <input
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            maxLength={LIMITS.phone}
            value={phone}
            onChange={(e) => setPhone(filterPhone(e.target.value))}
            className={authInputClass}
            placeholder="Enter your phone number"
          />
        </AuthField>
        <AuthField label="Password">
          <AuthPasswordInput
            autoComplete="new-password"
            minLength={LIMITS.passwordMin}
            value={password}
            onChange={(v) => setPassword(filterPassword(v))}
            placeholder="Min. 8 chars, upper, lower, number & symbol"
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
        <AuthSubmitButton loading={loading} loadingText="Sending code...">
          Continue
        </AuthSubmitButton>
      </form>
      <AuthFooterLink>
        Already have an account? <AuthLink href="/login">Sign in</AuthLink>
      </AuthFooterLink>
    </>
  );
}
