const TOKEN_KEY = 'accessToken';
const USER_NAME = 'userName';
const API_KEY_KEY = 'api_key';

export function saveAuth(token: string, user: unknown, apiKey?: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_NAME, JSON.stringify(user));
  if (apiKey) localStorage.setItem(API_KEY_KEY, apiKey);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_NAME);
  localStorage.removeItem(API_KEY_KEY);
}

// Optional: remove only the user
export function clearUser() {
  localStorage.removeItem(USER_NAME);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser<T = unknown>(): T | null {
  const raw = localStorage.getItem(USER_NAME);
  if (!raw || raw === 'undefined' || raw === 'null') return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(USER_NAME);
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function getLocalItem<T = unknown>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (raw === null || raw === 'undefined' || raw === 'null') return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as unknown as T;
  }
}

export function setLocalItem<T = unknown>(key: string, value: T) {
  const val = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(key, val);
}

export function removeLocalItem(key: string) {
  localStorage.removeItem(key);
}
