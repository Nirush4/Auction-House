import type { Listing } from '../types/index.js';
import { getToken } from '../utils/storage.js';

const API_BASE = 'https://v2.api.noroff.dev';
const AUCTION_BASE = `${API_BASE}/auction`;

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message =
      (data && (data.errors?.[0]?.message || data.message)) || res.statusText;
    throw new Error(message);
  }
  return data as T;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ListParams {
  limit?: number;
  sort?: 'created' | 'endsAt';
  sortOrder?: 'asc' | 'desc';
  _seller?: boolean;
  _bids?: boolean;
  q?: string;
}

export async function getListings(params: ListParams = {}): Promise<Listing[]> {
  const search = new URLSearchParams();
  if (params.limit) search.set('limit', String(params.limit));
  if (params.sort) search.set('sort', params.sort);
  if (params.sortOrder) search.set('sortOrder', params.sortOrder);
  if (params._seller) search.set('_seller', 'true');
  if (params._bids) search.set('_bids', 'true');
  if (params.q) search.set('q', params.q);

  const res = await fetch(`${AUCTION_BASE}/listings?${search.toString()}`, {
    headers: { ...authHeaders() },
  });
  const data = await handleResponse<{ data: Listing[] }>(res);
  return data.data;
}
