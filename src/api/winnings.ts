// src/api/winnings.ts
import type { Listing } from '../types';
import { getToken } from '../utils/storage';
import { API_KEY_HEADER } from './client';

const API_BASE = 'https://v2.api.noroff.dev/auction';

export interface WinningsResponse {
  data: Listing[];
  meta: {
    isFirstPage: boolean;
    isLastPage: boolean;
    currentPage: number;
    previousPage: number | null;
    nextPage: number | null;
    pageCount: number;
    totalCount: number;
  };
}

// Fetch user's winnings
export async function fetchProfileWinnings(
  username: string
): Promise<Listing[]> {
  const token = getToken();
  const key = localStorage.getItem('apiKey');

  if (!token) throw new Error('User is not logged in');

  const res = await fetch(
    `${API_BASE}/profiles/${encodeURIComponent(username)}/wins`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { [API_KEY_HEADER]: key } : {}),
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData?.errors?.[0]?.message || res.statusText);
  }

  const json: WinningsResponse = await res.json();
  const basicListings = json.data;

  // Fetch full listing details for each winning listing
  const listingsWithDetails = await Promise.all(
    basicListings.map(async (listing) => {
      const detailRes = await fetch(
        `${API_BASE}/listings/${listing.id}?_seller=true&_bids=true`
      );
      if (!detailRes.ok) return listing; // fallback
      const detailJson = await detailRes.json();
      return detailJson.data as Listing;
    })
  );

  return listingsWithDetails;
}

// Generate card HTML for winnings
export function winningsCard(listing: Listing): string {
  const img =
    listing.media?.[0]?.url ??
    'https://images.unsplash.com/photo-1631913290783-490324506193?auto=format&fit=crop&q=80&w=800';
  const alt = listing.media?.[0]?.alt ?? listing.title ?? 'Listing image';
  const bids = listing._count?.bids ?? 0;

  const sellerName = listing.seller?.name ?? 'Unknown seller';
  const sellerAvatar =
    listing.seller?.avatar?.url ??
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop';
  const sellerAlt = listing.seller?.avatar?.alt ?? sellerName;

  const category = listing.tags?.[0] ?? null;

  const startingBid = listing.startingBid ?? 0;
  const amountWon =
    listing.bids && listing.bids.length
      ? Math.max(...listing.bids.map((b) => b.amount))
      : startingBid;

  const created = listing.created
    ? new Date(listing.created).toLocaleDateString('en-GB')
    : 'Unknown';

  const description = listing.description?.trim()
    ? listing.description.trim().slice(0, 35) +
      (listing.description.trim().length > 35 ? '…' : '')
    : 'No description provided.';

  return `
    <div class="group relative rounded-2xl border-7 border-gray-100 bg-white/60 backdrop-blur-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">

      <!-- Seller badge -->
      <div class="flex items-center gap-3 pt-1 mx-5 my-3">
        <img src="${sellerAvatar}" alt="${sellerAlt}" class="h-8 w-8 rounded-full object-cover border" />
        <p class="text-sm sm:text-base">
          <span class="font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                       px-2 py-1 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all">
            ${sellerName}
          </span>
        </p>
      </div>

      <!-- Listing image -->
      <a href="/listing/${listing.id}">
        <div class="relative aspect-video overflow-hidden">
          <img src="${img}" alt="${alt}" class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity"></div>
          ${
            category
              ? `<div class="absolute top-3 left-3 bg-indigo-600/90 text-white text-xs font-medium px-2 py-1 rounded shadow">${category}</div>`
              : ''
          }
        </div>
      </a>

      <!-- Inner content -->
      <div class="p-5 space-y-3">
        <a href="/listing/${listing.id}">
          <h3 class="font-medium text-xl sm:text-lg xs:text-base text-gray-900 transition-colors line-clamp-1">
            ${listing.title ?? 'Untitled'}
          </h3>
        </a>

        <p class="text-sm sm:text-[14px] text-gray-600 line-clamp-2 leading-snug">
          ${description}
        </p>

        <div class="flex justify-between items-center text-sm sm:text-xs xs:text-[10px] text-gray-600">
          <p class="text-gray-500 text-xs sm:text-[14px]">Created: <span class="font-medium text-gray-800">${created}</span></p>
          <p class="text-gray-700 text-xs sm:text-[14px] font-bold">
            Amount Paid: <span class="font-bold text-indigo-600 text-lg sm:text-base">$${amountWon}</span>
          </p>
        </div>

        <div class="flex items-center justify-between text-xs sm:text-[14px] text-gray-600 pt-1">
          <p><span class="font-semibold text-indigo-600 text-lg sm:text-base">${bids}</span> bid${
    bids === 1 ? '' : 's'
  }</p>
        </div>

        <!-- View Listing Button -->
        <div class="mt-3">
          <a href="/listing/${listing.id}" 
             class="w-full text-center rounded-lg bg-blue-600 hover:bg-blue-700 py-2 text-white font-medium block">
             View Listing
          </a>
        </div>
      </div>
    </div>
  `;
}
