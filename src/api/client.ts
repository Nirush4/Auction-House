import { getLocalItem, setLocalItem } from '../utils/storage';

const API_URL =
  (import.meta as any).env?.VITE_API_BASE?.replace(/\/+$/, '') ||
  'https://v2.api.noroff.dev';
export const API_KEY_HEADER = 'X-Noroff-API-Key';
const PUBLIC_API_KEY = (import.meta as any).env?.VITE_API_TOKEN || null;

export type ApiClientOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, any> | null | undefined;
};
type Endpoint = string;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/* ------------------------- TOKEN HELPERS ------------------------- */
export function getToken(): string | null {
  const raw = getLocalItem('accessToken') ?? getLocalItem('token') ?? null;

  if (!raw) return null;
  if (typeof raw === 'string') return raw;

  try {
    const asObj =
      typeof raw === 'object' ? raw : JSON.parse(String(raw ?? 'null'));
    if (asObj && typeof asObj === 'object') {
      if (typeof (asObj as any).accessToken === 'string')
        return (asObj as any).accessToken;
      if (typeof (asObj as any).token === 'string') return (asObj as any).token;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

export function setToken(token: string) {
  setLocalItem('accessToken', token);
}

/* ------------------------- CORE CLIENT ------------------------- */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { body, ...customOptions } = options;

  const config: RequestInit = {
    method: body
      ? customOptions.method ?? 'POST'
      : customOptions.method ?? 'GET',
    ...customOptions,
    headers: {
      ...(customOptions.headers || {}),
    },
  };

  // Headers: API key (env or saved), Authorization
  const savedApiKey = getLocalItem('apiKey');
  const apiKey = PUBLIC_API_KEY || savedApiKey || null;
  const accessToken = getToken();

  if (apiKey)
    (config.headers as Record<string, string>)[API_KEY_HEADER] = apiKey;
  if (accessToken)
    (config.headers as Record<string, string>)[
      'Authorization'
    ] = `Bearer ${accessToken}`;

  // Body handling
  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      config.body = body;
    } else if (typeof body === 'string' || body instanceof Blob) {
      config.body = body as BodyInit;
      if (typeof body === 'string') {
        (config.headers as Record<string, string>)['Content-Type'] =
          (config.headers as Record<string, string>)['Content-Type'] ??
          'application/json';
      }
    } else {
      (config.headers as Record<string, string>)['Content-Type'] =
        (config.headers as Record<string, string>)['Content-Type'] ??
        'application/json';
      config.body = JSON.stringify(body);
    }
  }

  // Build URL (clean slashes)
  const baseRaw = API_URL.replace(/\/+$/, '');
  let path = endpoint.replace(/^\/+/, '');
  const url = `${baseRaw}/${path}`;

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') ?? '';

    if (response.status === 204 || !contentType.includes('application/json')) {
      if (!response.ok)
        throw new ApiError(`HTTP Error: ${response.status}`, response.status);
      return null as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.errors?.[0]?.message || `HTTP Error: ${response.status}`;
      throw new ApiError(message, response.status);
    }

    // Optionally filter out empty media/url items if needed by your UI
    if (Array.isArray(data)) {
      return data.filter(
        (item) => item?.media?.url !== '' && item?.url !== ''
      ) as T;
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new Error('A network or client error occurred.');
  }
}

/* ------------------------- API HELPERS ------------------------- */
export function api<T = unknown>(endpoint: string, options?: ApiClientOptions) {
  return apiClient<T>(endpoint, options);
}

function buildQuery(params: Record<string, any>) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');
}

export const get = <T = unknown>(endpoint: Endpoint): Promise<T> =>
  apiClient<T>(endpoint, { method: 'GET' });

export const post = <TBody extends Record<string, any>, TResp = unknown>(
  endpoint: Endpoint,
  body: TBody
): Promise<TResp> => apiClient<TResp>(endpoint, { method: 'POST', body });

export const put = <TBody extends Record<string, any>, TResp = unknown>(
  endpoint: Endpoint,
  body: TBody
): Promise<TResp> => apiClient<TResp>(endpoint, { method: 'PUT', body });

export const del = <TResp = unknown>(endpoint: Endpoint): Promise<TResp> =>
  apiClient<TResp>(endpoint, { method: 'DELETE' });

/* ------------------------- LISTING HELPERS (examples) ------------------------- */
export const getListings = <T = unknown>(
  params: Record<string, any> = {}
): Promise<T> => {
  const query = buildQuery(params);
  return get<T>(`auction/listings${query ? `?${query}` : ''}`);
};

/* ------------------------- AUTH ------------------------- */
export async function loginUser(data: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(PUBLIC_API_KEY ? { [API_KEY_HEADER]: PUBLIC_API_KEY } : {}),
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();

  if (!res.ok) {
    const message = json?.errors?.[0]?.message || 'Login failed';
    throw new ApiError(message, res.status);
  }
  const token = json?.data?.accessToken || json?.accessToken;
  const username = json?.data?.name || json?.name;
  if (!token || !username) throw new Error('Missing token or username');

  setLocalItem('accessToken', token);
  setLocalItem('username', username);
  return json;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(PUBLIC_API_KEY ? { [API_KEY_HEADER]: PUBLIC_API_KEY } : {}),
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    const message = json?.errors?.[0]?.message || 'Registration failed';
    throw new ApiError(message, res.status);
  }

  // Registration does NOT return a token, so don't check for it
  return json; // just return the response data
}

/* ------------------------- API KEY ------------------------- */
export async function fetchApiKey(
  accessToken: string
): Promise<string | undefined> {
  const res = await fetch(`${API_URL}/auth/create-api-key`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(PUBLIC_API_KEY ? { [API_KEY_HEADER]: PUBLIC_API_KEY } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch API key: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const key = data?.data?.key || data?.apiKey || data?.key;
  if (typeof key === 'string') setLocalItem('apiKey', key);
  return key;
}
