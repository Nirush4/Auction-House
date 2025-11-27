import type { Listing } from '../types/index';
import { getUser } from '../utils/storage';
import { showLoadingOverlay, hideLoadingOverlay } from '../utils/overlay';
import { startCountdown } from '../utils/startCountdowns';
import { showToast } from '../utils/toast';
import { navigateTo } from '../router'; // fix login button

export async function ListingDetailsView(
  root: HTMLElement,
  listingId: string
): Promise<void> {
  root.innerHTML = `
    <section class="container mx-auto px-4 py-16 text-center">
      <p class="text-gray-400 text-lg animate-pulse">Loading listing details...</p>
    </section>
  `;

  showLoadingOverlay({ message: 'Fetching listing...' });

  try {
    const url = `https://v2.api.noroff.dev/auction/listings/${listingId}?_seller=true&_bids=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch listing');

    const json = await res.json();
    const listing: Listing = json.data;

    if (!listing) {
      root.innerHTML =
        '<p class="text-gray-500 text-center text-lg">Listing not found.</p>';
      return;
    }

    const currentUser = getUser() ?? undefined;
    const isOwner = currentUser && listing.seller?.name === currentUser;

    const startingBid = listing.startingBid ?? 0;

    const highestBid =
      listing.bids && listing.bids.length
        ? Math.max(...listing.bids.map((b) => b.amount))
        : startingBid;

    const bids = listing._count?.bids ?? 0;

    const created = listing.created
      ? new Date(listing.created).toLocaleDateString('en-GB')
      : 'Unknown';

    const countdownId = `countdown-${listing.id}`;

    /**
     * FIXED — clean gallery with only FIRST image containing countdown overlay
     */
    const gallery = listing.media?.length
      ? listing.media
          .map(
            (m, index) => `
          <div class="relative overflow-hidden rounded-xl">
            <img src="${m.url}" 
                 alt="${m.alt ?? listing.title}" 
                 class="w-full h-64 sm:h-110 lg:h-140 object-cover"/>

            ${
              index === 0
                ? `
              <div id="${countdownId}" 
                   class="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r 
                          from-indigo-500 to-purple-500 text-white font-bold 
                          rounded-xl shadow-lg text-sm sm:text-lg  shadow-[0_8px_30px_rgba(0,0,0,0.25)]
            border border-white/40">
                ⏳ Calculating...
              </div>`
                : ''
            }
          </div>`
          )
          .join('')
      : `
      <div class="relative overflow-hidden rounded-xl">
        <img src="https://images.unsplash.com/photo-1631913290783-490324506193?auto=format&fit=crop&q=80&w=800"
             alt="Placeholder" 
             class="w-full h-64 sm:h-80 lg:h-96 object-cover"/>

        <div id="${countdownId}" 
             class="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r 
                    from-indigo-500 to-purple-500 text-white font-bold 
                    rounded-full shadow-lg text-sm sm:text-base">
          ⏳ Calculating...
        </div>
      </div>`;

    const sellerName = listing.seller?.name ?? 'Unknown seller';
    const sellerAvatar =
      listing.seller?.avatar?.url ??
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop';
    const sellerAlt = listing.seller?.avatar?.alt ?? sellerName;

    root.innerHTML = `
      <section class="container mx-auto px-4 mt-22 md:mt-30 mb-20">
<div class="flex flex-col lg:flex-row gap-6 lg:gap-10">

          <!-- Left Gallery FIXED -->
          <div class="flex-2 grid grid-cols-1 gap-4 h-64 sm:h-110 lg:h-140">
            ${gallery}
          </div>

          <!-- Right Details -->
          <div class="flex-1 flex flex-col justify-between gap-6">
            
            <!-- Seller -->
            <div class="flex items-center gap-4">
              <img src="${sellerAvatar}" 
                   alt="${sellerAlt}" 
                   class="h-16 w-16 rounded-full object-cover border-2 border-indigo-600"/>

              <div class="flex flex-col">
                <p class="font-bold text-lg sm:text-xl text-gray-900">${sellerName}</p>
                <p class="text-gray-500 text-sm sm:text-base">Created: ${created}</p>
              </div>
            </div>

            <!-- Title & Description -->
            <h1 class="text-xl sm:text-3xl md:text-4xl font-extralight text-gray-900">
              ${listing.title ?? 'Untitled'}
            </h1>

            <p class="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
              ${listing.description ?? 'No description provided.'}
            </p>

            <!-- Listing Info Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-indigo-50 p-4 rounded-xl shadow flex flex-col">
                <span class="text-gray-500 font-medium text-sm">Category</span>
                <span class="font-semibold text-gray-900 text-base sm:text-lg">
                  ${listing.category ?? 'N/A'}
                </span>
              </div>

              <div class="bg-green-50 p-4 rounded-xl shadow flex flex-col">
                <span class="text-gray-500 font-medium text-sm">Starting Bid</span>
                <span class="font-semibold text-green-700 text-base sm:text-lg">
                  $${startingBid}
                </span>
              </div>

              <div class="bg-purple-50 p-4 rounded-xl shadow flex flex-col">
                <span class="text-gray-500 font-medium text-sm">Highest Bid</span>
                <span class="font-semibold text-purple-700 text-lg">
                  $${highestBid}
                </span>
              </div>

              <div class="bg-yellow-50 p-4 rounded-xl shadow flex flex-col">
                <span class="text-gray-500 font-medium text-sm">Total Bids</span>
                <span class="font-semibold text-yellow-700 text-lg">
                  ${bids}
                </span>
              </div>
            </div>

            <!-- Tags -->
            ${
              listing.tags?.length
                ? `
              <div class="flex flex-wrap gap-2 mt-4">
                ${listing.tags
                  .map(
                    (tag) =>
                      `<span class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm cursor-pointer hover:bg-indigo-200 transition">${tag}</span>`
                  )
                  .join('')}
              </div>`
                : ''
            }

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-4">
              ${
                isOwner
                  ? `
                  <button class="editListingBtn bg-indigo-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-indigo-500 transition"
                          data-listing-id="${listing.id}">
                    Edit Listing
                  </button>

                  <button class="deleteListingBtn bg-red-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-red-500 transition"
                          data-listing-id="${listing.id}">
                    Delete Listing
                  </button>`
                  : currentUser
                  ? `
                  <button class="bidBtn bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-500 transition cursor-pointer"
                          onclick="handleBid('${listing.id}')">
                    Place Bid
                  </button>`
                  : `
                  <button class="loginBtn bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-500 transition cursor-pointer"
                          onclick="navigateTo('/login')">
                    Login to Bid
                  </button>`
              }
            </div>

          </div>
        </div>
      </section>
    `;

    startCountdown(listing);
  } catch (err) {
    console.error(err);
    showToast('error', (err as Error).message);

    root.innerHTML =
      '<p class="text-gray-500 text-center text-lg">Failed to load listing details.</p>';
  } finally {
    hideLoadingOverlay();
  }
}
