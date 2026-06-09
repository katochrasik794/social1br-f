import { apiRequest } from "./http";

export type DashboardActivity = {
  id: string;
  type: string;
  message: string;
  time: string;
};

export async function fetchDashboardActivity() {
  return apiRequest<DashboardActivity[]>("/dashboard/activity", { tokenKey: "user" });
}
