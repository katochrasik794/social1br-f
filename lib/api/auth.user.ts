import { apiRequest } from "./http";
import { setUserToken } from "../auth-storage";

export type UserProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isEmailVerified: boolean;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
};

export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}) {
  return apiRequest<{ email: string; message: string }>("/auth/user/register", {
    method: "POST",
    body: data,
    token: null,
  });
}

export async function verifyOtp(data: { email: string; otp: string }) {
  const result = await apiRequest<{ token: string; user: UserProfile }>("/auth/user/verify-otp", {
    method: "POST",
    body: data,
    token: null,
  });
  setUserToken(result.token);
  return result;
}

export async function loginUser(data: { email: string; password: string }) {
  const result = await apiRequest<{ token: string; user: UserProfile }>("/auth/user/login", {
    method: "POST",
    body: data,
    token: null,
  });
  setUserToken(result.token);
  return result;
}

export async function forgotPassword(data: { email: string }) {
  return apiRequest<{ message: string }>("/auth/user/forgot-password", {
    method: "POST",
    body: data,
    token: null,
  });
}

export async function verifyResetOtp(data: { email: string; otp: string }) {
  return apiRequest<{ resetToken: string }>("/auth/user/verify-reset-otp", {
    method: "POST",
    body: data,
    token: null,
  });
}

export async function resetPassword(resetToken: string, password: string) {
  return apiRequest<{ message: string }>("/auth/user/reset-password", {
    method: "POST",
    body: { password },
    token: resetToken,
  });
}

export async function fetchUserMe() {
  return apiRequest<UserProfile>("/auth/user/me");
}
