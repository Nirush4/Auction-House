// LISTING CARD FUNCTION (unchanged)
import type { Listing } from '../types/index.js';
import { getUser } from '../utils/storage.js';

export function listingCard(listing: Listing): string {
  const user = getUser(); // Detect logged-in state

  const img =
    listing.media?.[0]?.url ??
    'https://images.unsplash.com/photo-1631913290783-490324506193?auto=format&fit=crop&q=80&w=800';
  const alt = listing.media?.[0]?.alt ?? listing.title;

  const bids = listing._count?.bids ?? 0;
  const sellerName = listing.seller?.name ?? 'Unknown seller';
  const sellerAvatar =
    listing.seller?.avatar?.url ??
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop';

  const category = listing.tags?.[0] ?? null;

  const highestBid =
    listing.bids && listing.bids.length
      ? Math.max(...listing.bids.map((b) => b.amount))
      : 0;

  const created = listing.created
    ? new Date(listing.created).toLocaleDateString()
    : null;

  const description = listing.description?.trim()
    ? listing.description.trim().slice(0, 35) +
      (listing.description.trim().length > 35 ? '…' : '')
    : 'No description provided.';

  const countdownId = `countdown-${listing.id}`;

  return `
    <div class="group relative rounded-2xl border-7 border-gray-100 bg-white/60 backdrop-blur-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">

      <div class="flex items-center gap-3 pt-1 mx-5 my-3">
        ${
          sellerAvatar
            ? `<img src="${sellerAvatar}" class="h-8 w-8 rounded-full object-cover border" />`
            : `<div class="h-8 w-8 rounded-full bg-gray-300"></div>`
        }
        <p class="text-sm sm:text-base">
          <span class="font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                       px-2 py-1 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all">
            ${sellerName}
          </span>
        </p>
      </div>

      <a href="/listing/${listing.id}">
        <div class="relative aspect-video overflow-hidden">
          <img src="${img}" alt="${alt}" class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity"></div>

          <div id="${countdownId}" class="absolute bottom-3 left-0 mx-3 px-2 py-1 text-xs md:text-[14px] font-medium text-gray-700 rounded-md bg-white/90 backdrop-blur shadow-sm">
            ⏳ Calculating...
          </div>

          ${
            category
              ? `<div class="absolute top-3 left-3 bg-indigo-600/90 text-white text-xs font-medium px-2 py-1 rounded shadow">
                   ${category}
                 </div>`
              : ''
          }
        </div>
      </a>

      <div class="p-5 space-y-3">
        <a href="/listing/${listing.id}">
          <h3 class="font-medium text-xl sm:text-lg xs:text-base text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            ${listing.title}
          </h3>
        </a>

        <p class="text-sm sm:text-[14px] text-gray-600 line-clamp-2 leading-snug">
          ${description}
        </p>

        <div class="flex justify-between items-center text-sm sm:text-xs xs:text-[10px] text-gray-600">
          ${
            created
              ? `<p class="text-gray-500 text-xs sm:text-[14px]">Created: <span class="font-medium text-gray-800">${created}</span></p>`
              : `<p></p>`
          }
          <p class="text-gray-700 text-xs sm:text-[14px] font-bold">
            Highest Bid: <span class="font-bold text-indigo-600 text-lg sm:text-base">$${highestBid}</span>
          </p>
        </div>

        <div class="flex items-center justify-between text-xs sm:text-[14px] text-gray-600 pt-1">
          <p><span class="font-semibold text-indigo-600 text-lg sm:text-base">${bids}</span> bid${
    bids === 1 ? '' : 's'
  }</p>
        </div>

        ${
          !user
            ? `<div class="mt-3">
                 <button data-login class="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-500 transition cursor-pointer" onclick="window.location.hash = '/login'">
                   Login to Bid
                 </button>
               </div>`
            : `<div class="mt-3">
                 <button data-bid class="w-full rounded-lg bg-green-600 py-2 font-medium text-white hover:bg-green-500 transition cursor-pointer" onclick="handleBid('${listing.id}')">
                   Bid Now
                 </button>
               </div>`
        }

      </div>
    </div>
  `;
}
