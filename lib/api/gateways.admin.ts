import { apiRequest, apiUploadForm } from "./http";
import type { GatewayCategory, ManualGateway } from "./gateways";

export async function fetchAdminGateways() {
  return apiRequest<ManualGateway[]>("/admin/manual-gateways", { tokenKey: "admin" });
}

export async function createAdminGateway(form: FormData) {
  return apiUploadForm<ManualGateway>("/admin/manual-gateways", form, { tokenKey: "admin" });
}

export async function updateAdminGateway(id: string, form: FormData) {
  return apiUploadForm<ManualGateway>(`/admin/manual-gateways/${id}`, form, {
    method: "PUT",
    tokenKey: "admin",
  });
}

export async function toggleAdminGateway(id: string) {
  return apiRequest<ManualGateway>(`/admin/manual-gateways/${id}/toggle`, {
    method: "POST",
    tokenKey: "admin",
  });
}

export async function deleteAdminGateway(id: string) {
  return apiRequest<{ deleted: boolean }>(`/admin/manual-gateways/${id}`, {
    method: "DELETE",
    tokenKey: "admin",
  });
}

export type { GatewayCategory };
