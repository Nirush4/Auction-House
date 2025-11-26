import { showLoadingOverlay, hideLoadingOverlay } from '../utils/overlay';
import { showToast } from '../utils/toast';
import { listingCard } from '../views/home';
import { startCountdowns } from '../utils/startCountdowns';
import { getUser } from '../utils/storage';

const LISTINGS_PER_PAGE = 9;

export async function SearchView(root: HTMLElement) {
  root.innerHTML = `
    <div class="container mx-auto px-5 mt-24 mb-6 sm:mb-20">
      <div id="searchResults" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      <div id="paginationControls" class="flex justify-center gap-3 mt-6 sm:mt-15"></div>
    </div>
  `;

  const resultsContainer = document.getElementById('searchResults')!;
  const paginationContainer = document.getElementById('paginationControls')!;

  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';

  async function fetchResults(query: string, page = 1) {
    showLoadingOverlay({ message: 'Searching listings...' });

    try {
      let url = '';
      if (query.trim()) {
        url = `https://v2.api.noroff.dev/auction/listings/search?q=${encodeURIComponent(
          query
        )}&_seller=true&_bids=true`;
      } else {
        url = `https://v2.api.noroff.dev/auction/listings?limit=100&_seller=true&_bids=true`;
      }

      const res = await fetch(url);
      if (!res.ok)
        throw new Error(`API returned ${res.status}: ${res.statusText}`);

      const json = await res.json();
      let listings = json.data || [];

      if (!Array.isArray(listings) || listings.length === 0) {
        resultsContainer.innerHTML =
          '<p class="text-gray-500 text-center">No listings found.</p>';
        paginationContainer.innerHTML = '';
        return;
      }

      // Sort by newest first
      listings.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      );

      // Pagination
      const totalPages = Math.ceil(listings.length / LISTINGS_PER_PAGE);
      const paginatedListings = listings.slice(
        (page - 1) * LISTINGS_PER_PAGE,
        page * LISTINGS_PER_PAGE
      );

      const currentUser = getUser() ?? undefined;
      resultsContainer.innerHTML = paginatedListings
        .map((listing) => listingCard(listing, currentUser))
        .join('');

      startCountdowns(paginatedListings);

      // Render pagination buttons
      renderPagination(paginationContainer, totalPages, page, (p) =>
        fetchResults(query, p)
      );
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('error', (err as Error).message);
      resultsContainer.innerHTML =
        '<p class="text-red-500 text-center">Failed to fetch listings. Please try again later.</p>';
      paginationContainer.innerHTML = '';
    } finally {
      hideLoadingOverlay();
    }
  }

  fetchResults(initialQuery);

  window.addEventListener('popstate', () => {
    const urlParams2 = new URLSearchParams(window.location.search);
    const query = urlParams2.get('q') || '';
    fetchResults(query, 1);
  });
}

/**
 * Render pagination buttons
 */
function renderPagination(
  container: HTMLElement,
  totalPages: number,
  currentPage: number,
  onPageClick: (page: number) => void
) {
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i.toString();
    btn.className = `px-3 py-1 rounded ${
      i === currentPage
        ? 'bg-indigo-600 text-white'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    } transition`;
    btn.addEventListener('click', () => onPageClick(i));
    container.appendChild(btn);
  }
}
