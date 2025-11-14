import { apiClient } from './client.js';
import type { Profile, Listing, Bid } from '../types/index.js';

const BASE = 'auction/profiles';

export async function fetchProfile(username: string): Promise<Profile> {
  const { data } = await apiClient<{ data: Profile }>(
    `${BASE}/${encodeURIComponent(username)}`
  );
  return data;
}

export async function updateProfile(
  username: string,
  payload: Partial<Profile>
): Promise<Profile> {
  const { data } = await apiClient<{ data: Profile }>(
    `${BASE}/${encodeURIComponent(username)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );
  return data;
}

export async function fetchProfileListings(
  username: string
): Promise<Listing[]> {
  const { data } = await apiClient<{ data: Listing[] }>(
    `${BASE}/${encodeURIComponent(username)}/listings`,
    {
      method: 'GET',
    }
  );
  return data;
}

export async function fetchProfileBids(username: string): Promise<Bid[]> {
  const { data } = await apiClient<{ data: Bid[] }>(
    `${BASE}/${encodeURIComponent(username)}/bids?_listings=true`,
    {
      method: 'GET',
    }
  );
  return data;
}
