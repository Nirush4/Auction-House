import { showLoadingOverlay, hideLoadingOverlay } from '../utils/overlay.js';
import { showToast } from '../utils/toast.js';
import { listingCard } from '../views/home.js';
import { startCountdowns } from '../utils/startCountdowns';

export async function SearchView(root: HTMLElement) {
  root.innerHTML = `
    <div class="container mx-auto px-5 mt-24">
      <div id="searchResults" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    </div>
  `;

  const resultsContainer = document.getElementById(
    'searchResults'
  ) as HTMLDivElement;

  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';

  async function fetchResults(query: string) {
    showLoadingOverlay({ message: 'Searching listings...' });

    try {
      let url = '';

      if (query.trim()) {
        // Include seller info and bids
        url = `https://v2.api.noroff.dev/auction/listings/search?q=${encodeURIComponent(
          query
        )}&_seller=true&_bids=true`;
      } else {
        url =
          'https://v2.api.noroff.dev/auction/listings?limit=28&sort=created&sortOrder=desc&_seller=true&_bids=true';
      }

      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        console.error('Noroff API error response:', text);
        throw new Error(`API returned ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const listings = json.data || [];

      if (!Array.isArray(listings) || listings.length === 0) {
        resultsContainer.innerHTML =
          '<p class="text-gray-500">No listings found.</p>';
        return;
      }

      // Render using listingCard
      resultsContainer.innerHTML = listings.map(listingCard).join('');

      // Start countdown timers for all listings
      startCountdowns(listings);
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('error', (err as Error).message);
      resultsContainer.innerHTML =
        '<p class="text-red-500">Failed to fetch listings. Please try again later.</p>';
    } finally {
      hideLoadingOverlay();
    }
  }

  // Initial fetch
  fetchResults(initialQuery);

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const urlParams2 = new URLSearchParams(window.location.search);
    const query = urlParams2.get('q') || '';
    fetchResults(query);
  });
}
