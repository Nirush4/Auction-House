import { getListings } from '../api/listings.js';
import { navigateTo } from '../router.js';
import type { Listing } from '../types/index.js';
import { getUser } from '../utils/storage.js'; // Make sure this exists

/** Format exact local end date + time */
function formatExactDateTime(endsAt: string): string {
  const date = new Date(endsAt);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// Function to handle bid button click (customize as needed)
function handleBid(listingId: string) {
  // Example: Navigate to bid page for that listing
  window.location.href = `/listingDetails/${listingId}/bid`;

  // Or open a bid modal/dialog here instead
  // ...
}

function listingCard(listing: Listing): string {
  const user = getUser(); // detect logged-in state

  const img =
    listing.media?.[0]?.url ??
    'https://images.unsplash.com/photo-1631913290783-490324506193?auto=format&fit=crop&q=80&w=800';
  const alt = listing.media?.[0]?.alt ?? listing.title;

  const bids = listing._count?.bids ?? 0;
  const sellerName = listing.seller?.name ?? 'Unknown seller';
  const sellerAvatar =
    listing.seller?.avatar?.url ??
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  const category = listing.tags?.[0] ?? null;

  const highestBid =
    listing.bids && listing.bids.length
      ? Math.max(...listing.bids.map((b) => b.amount))
      : 0;

  const created = listing.created
    ? new Date(listing.created).toLocaleDateString()
    : null;

  // Description (truncate to 35 characters)
  const description = listing.description?.trim()
    ? listing.description.trim().slice(0, 35) +
      (listing.description.trim().length > 35 ? '…' : '')
    : 'No description provided.';

  const countdownId = `countdown-${listing.id}`;

  return `
    <div 
       class="group relative rounded-2xl border-7 border-gray-100 bg-white/60 backdrop-blur-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
      
       <!-- Seller info -->
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

      <!-- Image -->
      <a href="/listing/${listing.id}">
        <div class="relative aspect-video overflow-hidden">
          <img src="${img}" alt="${alt}"
               class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />

          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 
                      group-hover:opacity-80 transition-opacity"></div>

          <!-- Countdown -->
          <div id="${countdownId}"
              class="absolute bottom-3 left-0 rounded-md mx-3 bg-white/90 backdrop-blur px-2 py-1 text-xs md:text-[14px] font-medium text-gray-700 shadow-sm">
            ⏳ Calculating...
          </div>

          <!-- Category badge -->
          ${
            category
              ? `<div class="absolute top-3 left-3 bg-indigo-600/90 text-white text-xs font-medium px-2 py-1 rounded shadow">
                   ${category}
                 </div>`
              : ''
          }
        </div>
      </a>

      <!-- Info -->
      <div class="p-5 space-y-3">

        <!-- Title -->
        <a href="/listing/${listing.id}">
          <h3 class="font-medium text-xl sm:text-lg xs:text-base text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            ${listing.title}
          </h3>
        </a>

        <!-- Description -->
        <p class="text-sm sm:text-[14px] text-gray-600 line-clamp-2 leading-snug">
          ${description}
        </p>

       
        <!-- Created date + highest bid -->
        <div class="flex justify-between items-center text-sm sm:text-xs xs:text-[10px] text-gray-600">
          ${
            created
              ? `<p class="text-gray-500 text-xs sm:text-[14px]">Created: <span class="font-medium text-gray-800">${created}</span></p>`
              : `<p></p>`
          }

          <p class="text-gray-700 text-xs sm:text-[14px] font-bold">
            Highest Bid: 
            <span class="font-bold text-indigo-600 text-lg sm:text-base ">$${highestBid}</span>
          </p>
        </div>

        <!-- Bid count -->
        <div class="flex items-center justify-between text-xs sm:text-[14px] text-gray-600 pt-1">
          <p><span class="font-semibold text-indigo-600 text-lg sm:text-base ">${bids}</span> bid${
    bids === 1 ? '' : 's'
  }</p>
        </div>

       <!-- Login or Bid button -->
${
  !user
    ? `
      <div class="mt-3">
        <button
          data-login
          class="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-500 transition cursor-pointer"
          onclick="window.location.hash = '/login'">
          Login to Bid
        </button>
      </div>
    `
    : `
      <div class="mt-3">
        <button
          data-bid
          class="w-full rounded-lg bg-green-600 py-2 font-medium text-white hover:bg-green-500 transition cursor-pointer"
          onclick="handleBid('${listing.id}')">
          Bid Now
        </button>
      </div>
    `
}

      </div>
    </div>
  `;
}

function startCountdowns(listings: Listing[]) {
  function updateAll() {
    const now = Date.now();

    for (const listing of listings) {
      const el = document.getElementById(`countdown-${listing.id}`);
      if (!el || !listing.endsAt) continue;

      const end = new Date(listing.endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        el.textContent = '⏰ Auction ended';
        el.classList.add('text-red-600');
        continue;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      let countdownText = '';
      if (days > 0)
        countdownText = `🗓 Ends in ${days} day${days > 1 ? 's' : ''}`;
      else if (hours > 0) countdownText = `⏳ Ends in ${hours}h ${minutes}m`;
      else countdownText = `⚡ Ends in ${minutes}m ${seconds}s`;

      const exactTime = formatExactDateTime(listing.endsAt);
      el.textContent = `${countdownText} — ${exactTime}`;
    }
  }

  updateAll();
  setInterval(updateAll, 1000);
}

/** Home view */
export async function HomeView(root: HTMLElement): Promise<void> {
  root.innerHTML = `
    <section class="pt-24 pb-12 space-y-10 container mx-auto px-6">
      <header class="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 class=" text-xl sm:text-2xl font-bold text-gray-800">🏠 Latest Auctions</h1>
          <p class="text-gray-500  text-base md:text-lg">Discover and bid on the newest listings</p>
        </div>
        <a href="/search" 
           class="text-sm sm:text-base font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
          🔍 Advanced search
        </a>
      </header>

      <div id="homeContent" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${Array.from({ length: 6 })
          .map(
            () => `
            <div class="animate-pulse rounded-2xl border border-gray-200 bg-white/70">
              <div class="h-48 bg-gray-200"></div>
              <div class="p-4 space-y-3">
                <div class="h-4 w-3/5 bg-gray-200 rounded"></div>
                <div class="h-3 w-2/5 bg-gray-200 rounded"></div>
                <div class="h-3 w-1/3 bg-gray-200 rounded"></div>
              </div>
            </div>`
          )
          .join('')}
      </div>
    </section>
  `;

  const grid = root.querySelector('#homeContent') as HTMLElement;

  try {
    const listings = await getListings({
      limit: 28,
      sort: 'created',
      sortOrder: 'desc',
      _seller: true,
      _bids: true,
    });
    if (!listings || listings.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-gray-500 text-lg">No auctions available right now — check back soon!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = listings.map(listingCard).join('');
    startCountdowns(listings);

    // Attach login button click handlers (optional, your inline onclick works)
    const loginButtons =
      grid.querySelectorAll<HTMLButtonElement>('button[data-login]');
    loginButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        navigateTo('/login');
      });
    });
  } catch (err) {
    console.error('Error fetching listings:', err);
    grid.innerHTML = `
      <div class="col-span-full rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 text-center">
        ⚠️ Failed to load auctions: ${(err as Error).message}
      </div>
    `;
  }
}
