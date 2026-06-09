const USER_TOKEN_KEY = "token";
const USER_COOKIE = "user_token";
const THIRTY_DAYS = 30 * 24 * 60 * 60;

export function setUserToken(token: string) {
  localStorage.setItem(USER_TOKEN_KEY, token);
  document.cookie = `${USER_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${THIRTY_DAYS}; SameSite=Lax`;
}

export function getUserToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_TOKEN_KEY);
}

export function clearUserToken() {
  localStorage.removeItem(USER_TOKEN_KEY);
  document.cookie = `${USER_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_COOKIE = "admin_token";

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  document.cookie = `${ADMIN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${THIRTY_DAYS}; SameSite=Lax`;
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  document.cookie = `${ADMIN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
