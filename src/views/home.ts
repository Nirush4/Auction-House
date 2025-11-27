import type { Listing } from '../types/index';
import { getUser } from '../utils/storage';
import { HeroSection } from './heroSection';

import {
  CategoryFilter,
  setupCategoryScroll,
} from '../components/categoryFilter';
import { showLoadingOverlay, hideLoadingOverlay } from '../utils/overlay';
import { navigateTo } from '../router';
import { startCountdowns } from '../utils/startCountdowns';
import { showToast } from '../utils/toast';

const LISTINGS_PER_PAGE = 9;

export async function HomeView(root: HTMLElement): Promise<void> {
  root.innerHTML = `
    ${HeroSection()}  

    <!-- Category Filter Bar -->
    <section id="listItems" class="container mx-auto px-6 pt-20 sm:pt-25">
      ${CategoryFilter()}
    </section>

    <section class="pt-14 pb-12 sm:pb-20 space-y-10 container mx-auto px-6">
      <header class="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-800">🏠 Latest Auctions</h1>
          <p class="text-gray-500 text-base md:text-lg">Discover and bid on the newest listings</p>
        </div>
      </header>

      <!-- Container for listings -->
      <div id="homeContent" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="col-span-full text-center py-10">
          <p class="text-gray-500">Loading listings...</p>
        </div>
      </div>

     <div
  id="paginationControls"
  class="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-15"
></div>

    </section>
  `;

  setupCategoryScroll();
  setupSmoothScroll(root);
  setupProfileLinks();

  // Fetch initial listings
  fetchListings(1);
}

/**
 * Smooth scroll for buttons
 */
function setupSmoothScroll(root: HTMLElement) {
  const viewListBtn = root.querySelector('#viewlist');
  const browseBtn = root.querySelector('a[href="#listItems"]');

  function smoothScroll(e: Event) {
    e.preventDefault();
    const section = document.querySelector('#listItems');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (viewListBtn) viewListBtn.addEventListener('click', smoothScroll);
  if (browseBtn) browseBtn.addEventListener('click', smoothScroll);
}

/**
 * Show loading overlay when navigating to profile
 */
function setupProfileLinks() {
  document.querySelectorAll('a[href="/profile"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showLoadingOverlay({ message: 'Loading your profile...' });
      navigateTo('/profile'); // router handles the profile
    });
  });
}

/**
 * Fetch listings with pagination & sorting
 */
async function fetchListings(page = 1, tag = '') {
  const homeContent = document.getElementById('homeContent')!;
  const paginationControls = document.getElementById('paginationControls')!;

  showLoadingOverlay({ message: 'Fetching listings...' });

  try {
    const params = new URLSearchParams({
      limit: LISTINGS_PER_PAGE.toString(),
      page: page.toString(),
      sort: 'created',
      sortOrder: 'desc',
      _active: 'true',
      _seller: 'true',
      _bids: 'true',
    });

    if (tag) params.append('_tag', tag);

    const url = `https://v2.api.noroff.dev/auction/listings?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch listings');

    const json = await res.json();

    const listings: Listing[] = json.data ?? [];
    const totalListings: number = json.meta?.totalCount ?? listings.length;

    const totalPages = Math.ceil(totalListings / LISTINGS_PER_PAGE);

    if (!listings.length) {
      homeContent.innerHTML =
        '<p class="text-gray-500 text-center">No listings found.</p>';
      paginationControls.innerHTML = '';
      return;
    }

    const currentUser = getUser() ?? undefined;

    homeContent.innerHTML = listings
      .map((l) => listingCard(l, currentUser))
      .join('');

    // Attach login button event
    document.querySelectorAll('button[data-login]').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigateTo('/login');
      });
    });

    startCountdowns(listings);

    renderPagination(paginationControls, totalPages, page, (p) =>
      fetchListings(p, tag)
    );
  } catch (err) {
    console.error(err);
    showToast('error', (err as Error).message);
  } finally {
    hideLoadingOverlay();
  }
}

function renderPagination(
  container: HTMLElement,
  totalPages: number,
  currentPage: number,
  onPageClick: (page: number) => void
) {
  container.innerHTML = '';

  if (totalPages <= 1) return;

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.innerHTML = '‹';
  prevBtn.disabled = currentPage === 1;
  prevBtn.className = `
    px-3 py-1 rounded transition
    ${
      currentPage === 1
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
    }
  `;
  prevBtn.addEventListener('click', () => onPageClick(currentPage - 1));
  container.appendChild(prevBtn);

  // Page buttons (show max 5 pages, with ellipsis)
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  if (startPage > 1) {
    container.appendChild(createPageBtn(1, currentPage, onPageClick));
    if (startPage > 2) addEllipsis(container);
  }

  for (let i = startPage; i <= endPage; i++) {
    container.appendChild(createPageBtn(i, currentPage, onPageClick));
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) addEllipsis(container);
    container.appendChild(createPageBtn(totalPages, currentPage, onPageClick));
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.innerHTML = '›';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.className = `
    px-3 py-1 rounded cursor-pointer text-sm sm:text-lg transition
    ${
      currentPage === totalPages
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
    }
  `;
  nextBtn.addEventListener('click', () => onPageClick(currentPage + 1));
  container.appendChild(nextBtn);

  // Helper: create page button
  function createPageBtn(
    page: number,
    currentPage: number,
    onClick: (page: number) => void
  ) {
    const btn = document.createElement('button');
    btn.textContent = page.toString();
    btn.className = `
      px-3 py-1 sm:px-4 sm:py-2 rounded text-sm sm:text-base cursor-pointer transition
      ${
        page === currentPage
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }
    `;
    btn.addEventListener('click', () => onClick(page));
    return btn;
  }

  // Helper: ellipsis
  function addEllipsis(container: HTMLElement) {
    const span = document.createElement('span');
    span.textContent = '...';
    span.className = 'px-2 py-1 text-gray-500';
    container.appendChild(span);
  }
}

/**
 * Listing card function (unchanged)
 */
export function listingCard(
  listing: Listing,
  currentUserName?: string
): string {
  const user = getUser();
  const isOwner = currentUserName && listing.seller?.name === currentUserName;

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

  const highestBid =
    listing.bids && listing.bids.length
      ? Math.max(...listing.bids.map((b) => b.amount))
      : 0;

  const created = listing.created
    ? new Date(listing.created).toLocaleDateString('en-GB')
    : 'Unknown';

  const description = listing.description?.trim()
    ? listing.description.trim().slice(0, 35) +
      (listing.description.trim().length > 35 ? '…' : '')
    : 'No description provided.';

  const countdownId = `countdown-${listing.id}`;

  return `
    <div class="group relative rounded-2xl border-7 border-gray-100 bg-white/60 backdrop-blur-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">

      <div class="flex items-center gap-3 pt-1 mx-5 my-3">
        <img src="${sellerAvatar}" alt="${sellerAlt}" class="h-8 w-8 rounded-full object-cover border" />
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
            ${listing.title ?? 'Untitled'}
          </h3>
        </a>

        <p class="text-sm sm:text-[14px] text-gray-600 line-clamp-2 leading-snug">
          ${description}
        </p>

        <div class="flex justify-between items-center text-sm sm:text-xs xs:text-[10px] text-gray-600">
          <p class="text-gray-500 text-xs sm:text-[14px]">Created: <span class="font-medium text-gray-800">${created}</span></p>
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
          isOwner
            ? `<div class="flex gap-2 mt-3">
            <button class="editListingBtn flex-1 rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-500 transition cursor-pointer" data-listing-id="${listing.id}">
  Edit
</button>

<button 
  class="deleteListingBtn flex-1 rounded-lg bg-red-600 py-2 font-medium text-white hover:bg-red-500 transition cursor-pointer"
  data-listing-id="${listing.id}">
  Delete
</button>

               </div>`
            : user
            ? `<div class="mt-3">
                   <button data-bid class="w-full rounded-lg bg-green-600 py-2 font-medium text-white hover:bg-green-500 transition cursor-pointer" onclick="handleBid('${listing.id}')">
                     Bid Now
                   </button>
                 </div>`
            : `<div class="mt-3">
                   <button id="login" data-login class="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-500 transition cursor-pointer">
                     Login to Bid
                   </button>
                 </div>`
        }

      </div>
    </div>
  `;
}
