export type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  tokenKey?: "user" | "admin";
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, tokenKey = "user" } = options;

  let authToken = token;
  if (authToken === undefined && typeof window !== "undefined") {
    authToken =
      tokenKey === "admin"
        ? localStorage.getItem("adminToken")
        : localStorage.getItem("token");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new Error(json.error || "Request failed");
  }

  return json.data;
}

export function getApiUrl() {
  return API_URL;
}

export async function apiUploadForm<T>(
  path: string,
  formData: FormData,
  options: { tokenKey?: "user" | "admin"; method?: string } | "user" | "admin" = "user"
): Promise<T> {
  const tokenKey = typeof options === "string" ? options : (options.tokenKey ?? "user");
  const method = typeof options === "string" ? "POST" : (options.method ?? "POST");

  let authToken: string | null = null;
  if (typeof window !== "undefined") {
    authToken =
      tokenKey === "admin" ? localStorage.getItem("adminToken") : localStorage.getItem("token");
  }

  const headers: Record<string, string> = {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: formData,
  });

  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) throw new Error(json.error || "Upload failed");
  return json.data;
}
