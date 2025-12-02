import type { Listing } from '../types/index';
import { getUser, getToken } from '../utils/storage';
import { showLoadingOverlay, hideLoadingOverlay } from '../utils/overlay';
import { startCountdown } from '../utils/startCountdowns';
import { showToast } from '../utils/toast';
import { navigateTo } from '../router';
import { openEditListingModal } from '../components/editListingModal';
import { showConfirmModal } from '../utils/confirmModal';

let isClickListenerAttached = false;

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
    const token = getToken();
    const key = localStorage.getItem('apiKey');
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

    const mainImage =
      listing.media?.[0]?.url ??
      'https://images.unsplash.com/photo-1631913290783-490324506193?auto=format&fit=crop&q=80&w=800';

    const galleryThumbnails =
      listing.media
        ?.map(
          (m, index) => `
        <img src="${m.url}" 
             alt="${m.alt ?? listing.title}" 
             class="h-24 w-24 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-indigo-500 transition"
             data-index="${index}"/>`
        )
        .join('') ?? '';

    const sellerAvatar =
      listing.seller?.avatar?.url ??
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop';
    const sellerAlt = listing.seller?.name ?? 'Seller';

    root.innerHTML = `
      <section class="container mx-auto px-6 mt-20 sm:mt-35 mb-12 sm:mb-30">
        <!-- Hero Gallery -->
        <div class="relative w-full rounded-xl overflow-hidden shadow-xl mb-10">
          <img id="mainGalleryImg" src="${mainImage}" alt="${
      listing.title
    }" class="w-full h-95 sm:h-106 object-cover transition-transform duration-500"/>
          <div id="${countdownId}" class="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg text-sm sm:text-lg">
            ⏳ Calculating...
          </div>
        </div>

        ${
          listing.media && listing.media.length > 1
            ? `<div class="flex gap-2 justify-center mb-8 overflow-x-auto" id="galleryThumbnails">${galleryThumbnails}</div>`
            : ''
        }

        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1 space-y-6">
            <div class="bg-white/60 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg flex items-center gap-4 cursor-pointer sellerAvatar" data-username="${
              listing.seller?.name ?? ''
            }">
              <img src="${sellerAvatar}" alt="${sellerAlt}" class="h-12 sm:h-16 w-12 sm:w-16 rounded-full border-2 border-indigo-600 object-cover"/>
              <div>
                <p class="font-bold text-base sm:text-xl text-gray-900">${
                  listing.seller?.name ?? 'Unknown Seller'
                }</p>
                <p class="text-gray-500 text-sm sm:text-base">Created: ${created}</p>
              </div>
            </div>

            <div class="bg-white/60 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-500 font-medium text-base sm:text-lg">Category</span>
                <span class="font-semibold text-gray-900">${
                  listing.category ?? 'N/A'
                }</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 font-medium text-base sm:text-lg">Starting Bid</span>
                <span class="font-semibold text-green-700">$${startingBid}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 font-medium text-base sm:text-lg">Highest Bid</span>
                <span class="font-semibold text-purple-700">$${highestBid}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 font-medium text-base sm:text-lg">Total Bids</span>
                <span class="font-semibold text-yellow-700">${bids}</span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-2 space-y-6">
            <h1 class="text-xl sm:text-4xl md:text-5xl font-extralight text-gray-900">${
              listing.title ?? 'Untitled'
            }</h1>
            <p class="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed">${
              listing.description ?? 'No description provided.'
            }</p>

            <div class="flex flex-wrap gap-2">
              ${(listing.tags ?? [])
                .map(
                  (tag) =>
                    `<span class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm cursor-pointer hover:bg-indigo-200 transition">${tag}</span>`
                )
                .join('')}
            </div>

            <div class="flex flex-wrap gap-3 mt-4">
              ${
                isOwner
                  ? `<button class="editListingButton bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-5 py-2 rounded-lg text-sm sm:text-base shadow-lg cursor-pointer">Edit Listing</button>
                     <button class="deleteListingBtn bg-red-600 hover:bg-red-700 text-white px-3 sm:px-5 py-2 rounded-lg text-sm sm:text-base shadow-lg cursor-pointer">Delete Listing</button>`
                  : currentUser
                  ? `<div class="flex gap-2 items-center w-full flex-wrap max-w-sm">
                       <input type="number" min="${
                         highestBid + 1
                       }" id="bidAmount" placeholder="Enter your bid (>$${highestBid})" class="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                       <button id="placeBidBtn" class="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">Place Bid</button>
                     </div>`
                  : `<button class="loginBtn bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">Login to Bid</button>`
              }
            </div>

            <div class="mt-8">
              <h2 class="text-base sm:text-xl font-semibold text-gray-900 mb-4">Bid History</h2>
              <ul id="bidHistoryList" class="space-y-2"></ul>
            </div>
          </div>
        </div>
      </section>
    `;

    startCountdown(listing);

    // Render bids
    const bidHistoryList = document.getElementById(
      'bidHistoryList'
    ) as HTMLDivElement;
    if (listing.bids?.length) {
      const sortedBids = listing.bids.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      );

      bidHistoryList.innerHTML = `
        <div class="flex flex-col space-y-2 w-full">
          ${sortedBids
            .map(
              (bid) => `
              <div class="flex flex-col sm:flex-row justify-between items-center border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors bidderAvatar" data-username="${
                bid.bidder.name
              }">
                <div class="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                  <img src="${
                    bid.bidder.avatar?.url ??
                    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop'
                  }" alt="${
                bid.bidder.name
              }" class="h-8 w-8 rounded-full object-cover mr-3"/>
                  <span class="font-medium text-gray-800 text-sm sm:text-base">${
                    bid.bidder.name
                  }</span>
                </div>
                <div class="flex flex-col sm:flex-row sm:space-x-4 items-end sm:items-center w-full sm:w-auto text-right">
                  <span class="font-semibold text-indigo-600 text-sm sm:text-base">$${
                    bid.amount
                  }</span>
                  <span class="text-gray-500 text-xs sm:text-sm">${new Date(
                    bid.created
                  ).toLocaleString()}</span>
                </div>
              </div>
            `
            )
            .join('')}
        </div>
      `;
    } else {
      bidHistoryList.innerHTML = `
        <p class="py-4 px-4 text-gray-500 text-center border border-gray-200 rounded-lg">No bids yet</p>
      `;
    }

    // --------------------------
    // EVENT LISTENER (UPDATED)
    // --------------------------
    if (!isClickListenerAttached) {
      isClickListenerAttached = true;

      root.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;

        // Thumbnail click
        const thumb = target.closest('[data-index]') as HTMLElement;
        if (thumb) {
          const idx = parseInt(thumb.dataset.index!);
          const newSrc = listing.media?.[idx]?.url;
          if (newSrc) {
            const mainImg = document.getElementById(
              'mainGalleryImg'
            ) as HTMLImageElement;
            mainImg.classList.add('opacity-0', 'scale-105');
            setTimeout(() => {
              mainImg.src = newSrc;
              mainImg.classList.remove('opacity-0', 'scale-105');
            }, 200);
          }
          return;
        }

        // Seller avatar click
        const sellerEl = target.closest('.sellerAvatar');
        if (sellerEl) {
          const username = sellerEl.getAttribute('data-username');
          if (username) navigateTo(`/profile/${encodeURIComponent(username)}`);
          return;
        }

        // Bidder avatar click
        const bidderEl = target.closest('.bidderAvatar');
        if (bidderEl) {
          const username = bidderEl.getAttribute('data-username');
          if (username) navigateTo(`/profile/${encodeURIComponent(username)}`);
          return;
        }

        // Edit listing
        if (target.closest('.editListingButton') && isOwner) {
          openEditListingModal(listing.id);
          return;
        }

        // Delete listing
        if (target.closest('.deleteListingBtn') && isOwner) {
          const confirmed = await showConfirmModal(
            'Are you sure you want to delete this listing?'
          );
          if (!confirmed) return;

          try {
            showLoadingOverlay({ message: 'Deleting listing...' });

            const res = await fetch(
              `https://v2.api.noroff.dev/auction/listings/${listing.id}`,
              {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  ...(key ? { 'X-Noroff-API-Key': key } : {}),
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(
                errData?.errors?.[0]?.message || 'Failed to delete listing'
              );
            }

            showToast('success', 'Listing deleted successfully!');
            navigateTo('/profile');
          } catch (err) {
            console.error(err);
            showToast('error', (err as Error).message);
          } finally {
            hideLoadingOverlay();
          }
          return;
        }

        // Login button
        if (target.closest('.loginBtn')) {
          navigateTo('/login');
          return;
        }

        // Place Bid
        if (target.id === 'placeBidBtn' && currentUser && token) {
          const bidInput = document.getElementById(
            'bidAmount'
          ) as HTMLInputElement;
          const amount = parseFloat(bidInput.value);

          if (!amount || amount <= highestBid) {
            showToast('error', `Enter a valid bid greater than $${highestBid}`);
            return;
          }

          try {
            showLoadingOverlay({ message: 'Placing your bid...' });

            const res = await fetch(
              `https://v2.api.noroff.dev/auction/listings/${listing.id}/bids`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(key ? { 'X-Noroff-API-Key': key } : {}),
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount }),
              }
            );

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(
                errData?.errors?.[0]?.message || 'Failed to place bid'
              );
            }

            showToast('success', `Bid of $${amount} placed successfully!`);
            bidInput.value = '';

            ListingDetailsView(root, listingId);
          } catch (err) {
            console.error(err);
            showToast('error', (err as Error).message);
          } finally {
            hideLoadingOverlay();
          }
        }
      });
    }
  } catch (err) {
    console.error(err);
    root.innerHTML = `<p class="text-gray-500 text-center text-lg">Failed to load listing.</p>`;
  } finally {
    hideLoadingOverlay();
  }
}
