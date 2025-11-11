// storage.ts
const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';
const API_KEY_KEY = 'api_key';

export function saveAuth(token: string, user: unknown, apiKey?: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (apiKey) localStorage.setItem(API_KEY_KEY, apiKey);
}

export function setApiKey(apiKey: string) {
  localStorage.setItem(API_KEY_KEY, apiKey);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(API_KEY_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_KEY);
}

export function getUser<T = unknown>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || raw === 'undefined' || raw === 'null') return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(USER_KEY);
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
