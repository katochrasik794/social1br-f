import { apiRequest } from "./http";
import { setAdminToken } from "../auth-storage";

export type AdminProfile = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

export async function loginAdmin(data: { email: string; password: string }) {
  const result = await apiRequest<{ token: string; admin: AdminProfile }>("/auth/admin/login", {
    method: "POST",
    body: data,
    token: null,
    tokenKey: "admin",
  });
  setAdminToken(result.token);
  return result;
}

export async function fetchAdminMe() {
  return apiRequest<AdminProfile>("/auth/admin/me", { tokenKey: "admin" });
}
