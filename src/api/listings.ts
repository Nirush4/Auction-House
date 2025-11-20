// src/api/listings.ts
import type { Listing, MediaItem } from '../types/index';
import { getToken } from '../utils/storage';
import { apiClient } from './client';

const API_BASE = 'https://v2.api.noroff.dev';
const AUCTION_BASE = `${API_BASE}/auction/listings`;
const BASE = 'auction/listings';

/** ==========================
 *  Types
 *  ========================== */

export interface ListParams {
  limit?: number;
  sort?: 'created' | 'endsAt';
  sortOrder?: 'asc' | 'desc';
  _seller?: boolean;
  _bids?: boolean;
  q?: string;
  _tag?: string;
  _active?: boolean;
}

export interface CreateListingPayload {
  title: string;
  description?: string;
  tags?: string[];
  endsAt: string; // ISO string
  media?: MediaItem[];
}

export interface UpdateListingPayload {
  title?: string;
  description?: string;
  tags?: string[];
  media?: MediaItem[];
  endsAt?: string;
}

export interface BidPayload {
  amount: number;
}

/** ==========================
 *  Helpers
 *  ========================== */

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message =
      data?.errors?.[0]?.message || data?.message || res.statusText;
    throw new Error(message);
  }
  return data as T;
}

/** ==========================
 *  API Functions
 *  ========================== */

/**
 * Get a list of listings (with optional filters)
 */
export async function getListings(params: ListParams = {}): Promise<Listing[]> {
  const search = new URLSearchParams();

  if (params.limit) search.set('limit', String(params.limit));
  if (params.sort) search.set('sort', params.sort);
  if (params.sortOrder) search.set('sortOrder', params.sortOrder);
  if (params._seller) search.set('_seller', 'true');
  if (params._bids) search.set('_bids', 'true');
  if (params.q) search.set('q', params.q);
  if (params._tag) search.set('_tag', params._tag);
  if (params._active !== undefined)
    search.set('_active', String(params._active));

  const url = `${AUCTION_BASE}?${search.toString()}`;
  const res = await fetch(url, { headers: authHeaders() });

  const { data } = await handleResponse<{ data: Listing[] }>(res);
  return data;
}

/**
 * Create a new listing
 */
export async function createListing(
  payload: CreateListingPayload
): Promise<Listing> {
  const { data } = await apiClient<{ data: Listing }>(BASE, {
    method: 'POST',
    body: payload,
  });
  return data;
}

/**
 * Get a single listing with seller and bids info
 */
export async function getListing(id: string): Promise<Listing> {
  const { data } = await apiClient<{ data: Listing }>(
    `${BASE}/${encodeURIComponent(id)}?_seller=true&_bids=true`
  );
  return data;
}

/**
 * Update an existing listing
 */
export async function updateListing(
  id: string,
  payload: UpdateListingPayload
): Promise<Listing> {
  const { data } = await apiClient<{ data: Listing }>(
    `${BASE}/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: payload,
    }
  );
  return data;
}

/**
 * Delete a listing
 */
export async function deleteListing(id: string): Promise<void> {
  await apiClient(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/**
 * Place a bid on a listing
 */
export async function placeBid(
  id: string,
  payload: BidPayload
): Promise<Listing> {
  const { data } = await apiClient<{ data: Listing }>(
    `${BASE}/${encodeURIComponent(id)}/bids`,
    {
      method: 'POST',
      body: payload,
    }
  );
  return data;
}
