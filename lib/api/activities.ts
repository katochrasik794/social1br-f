import { apiRequest } from "./http";

export type UserActivity = {
  id: string;
  type: "account_opened" | "deposit" | "withdrawal";
  message: string;
  status: string | null;
  amount: number | null;
  accountNumber: number | null;
  createdAt: string;
};

export async function fetchUserActivities() {
  return apiRequest<UserActivity[]>("/activities", { tokenKey: "user" });
}
