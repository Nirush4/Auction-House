import { getListings } from '../api/listings.js';
import type { Listing } from '../types/index.js';

/** Format exact local end date + time */
function formatExactDateTime(endsAt: string): string {
  const date = new Date(endsAt);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function listingCard(listing: Listing): string {
  const img =
    listing.media?.[0]?.url ??
    'https://images.unsplash.com/photo-1631913290783-490324506193?auto=format&fit=crop&q=80&w=800';
  const alt = listing.media?.[0]?.alt ?? listing.title;
  const bids = listing._count?.bids ?? 0;
  const seller = listing.seller?.name ?? 'Unknown seller';
  const countdownId = `countdown-${listing.id}`;

  return `
    <a href="#/listing/${listing.id}" 
       class="group relative rounded-2xl border-7 border-gray-100 bg-white/60 backdrop-blur-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
      
      <!-- Image -->
      <div class="relative aspect-video overflow-hidden">
        <img src="${img}" alt="${alt}" 
             class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity"></div>

        <!-- Countdown -->
        <div id="${countdownId}" 
             class="absolute bottom-3 left-3 rounded-md bg-white/90 backdrop-blur px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
          ⏳ Calculating...
        </div>
      </div>

      <!-- Info -->
      <div class="p-5">
        <h3 class="font-semibold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
          ${listing.title}
        </h3>

        <div class="mt-2 flex items-center justify-between text-sm text-gray-600">
          <p>Seller: <span class="font-medium text-gray-800">${seller}</span></p>
          <p><span class="font-semibold text-indigo-600">${bids}</span> bid${
    bids === 1 ? '' : 's'
  }</p>
        </div>
      </div>
    </a>
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
      limit: 18,
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
  } catch (err) {
    console.error('Error fetching listings:', err);
    grid.innerHTML = `
      <div class="col-span-full rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 text-center">
        ⚠️ Failed to load auctions: ${(err as Error).message}
      </div>
    `;
  }
}
