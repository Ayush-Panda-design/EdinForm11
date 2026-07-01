// Client-side auth utilities
//
// Dual-storage strategy:
//   PRIMARY:  httpOnly cookie — set by the API server on sign-in/sign-up (XSS-safe).
//             The browser sends it automatically on every same-site request.
//   FALLBACK: localStorage — stores token for the Authorization header used by
//             the tRPC client. This ensures compatibility when cookies are
//             blocked (e.g. cross-origin in local dev).
//
// In production with same-origin deployment the httpOnly cookie path is fully
// active and localStorage is an extra redundant layer.

export const TOKEN_KEY = "formcraft_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  // Also attempt to clear the httpOnly cookie via the API
  // (handled server-side on signOut — this is just cleanup)
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
