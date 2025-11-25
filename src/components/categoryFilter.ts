import { navigateTo } from '../router';
import { startCountdowns } from '../utils/startCountdowns';
import { listingCard } from '../views/home';

const categoryTagMap: Record<string, string | null> = {
  all: null,
  art: 'art',
  watches: 'watches',
  jewelry: 'jewelry',
  vintage: 'vintage',
  fashion: 'fashion',
  cars: 'cars',
  furniture: 'furniture',
  decor: 'decor',
  games: 'games',
  books: 'books',
  toys: 'toys',
  sports: 'sports',
};

export const categories = [
  { id: 'all', label: 'All listings', icon: 'fa-solid fa-star' },
  { id: 'art', label: 'Art', icon: 'fa-solid fa-palette' },
  { id: 'watches', label: 'Watches', icon: 'fa-solid fa-clock' },
  { id: 'jewelry', label: 'Jewelry', icon: 'fa-solid fa-gem' },
  { id: 'vintage', label: 'Vintage', icon: 'fa-solid fa-camera' },
  { id: 'fashion', label: 'Fashion', icon: 'fa-solid fa-bag-shopping' },
  { id: 'cars', label: 'Cars', icon: 'fa-solid fa-car' },
  { id: 'furniture', label: 'Furniture', icon: 'fa-solid fa-couch' },
  { id: 'decor', label: 'Decor', icon: 'fa-solid fa-archway' },
  { id: 'games', label: 'Games', icon: 'fa-solid fa-gamepad' },
  { id: 'books', label: 'Books', icon: 'fa-solid fa-book' },
  { id: 'toys', label: 'Toys', icon: 'fa-solid fa-puzzle-piece' },
  { id: 'sports', label: 'Sports', icon: 'fa-solid fa-basketball' },
];

export async function fetchListings(
  categoryId: string,
  activeOnly: boolean = true
) {
  const params = new URLSearchParams();
  const tag = categoryTagMap[categoryId];
  if (tag) params.append('_tag', tag);
  if (activeOnly) params.append('_active', 'true');

  params.append('_seller', 'true');
  params.append('_bids', 'true');

  const url = `https://v2.api.noroff.dev/auction/listings?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch listings');

    const result = await response.json();
    renderListings(result.data || []);
  } catch (error) {
    console.error('Error fetching listings:', error);
  }
}

export function CategoryFilter(activeCategory: string = 'all') {
  return `
    <div class="relative flex items-center justify-around">
      <button id="catScrollLeft" class="p-3 bg-white/70 backdrop-blur rounded-full shadow hover:bg-white transition hidden md:flex cursor-pointer">
        <i class="fa-solid text-xl fa-chevron-left text-gray-600"></i>
      </button>

      <nav id="categoryContainer" class="flex gap-2 justify-between py-2 sm:py-4 px-4 sm:px-6 overflow-x-auto scrollbar-hide scroll-smooth">
        ${categories
          .map(
            (cat) => `
          <button 
            data-category="${cat.id}"
            class="category-btn flex flex-col items-center gap-1 px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition cursor-pointer 
              ${
                cat.id === activeCategory
                  ? 'bg-gray-200 text-gray-600 border border-gray-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-600 hover:bg-gray-200'
              }"
          >
            <i class="${cat.icon} text-xl sm:text-2xl text-gray-500"></i>
            <span class="text-sm whitespace-nowrap">${cat.label}</span>
          </button>`
          )
          .join('')}
      </nav>

      <button id="catScrollRight" class="p-3 bg-white/70 backdrop-blur rounded-full shadow hover:bg-white transition hidden md:flex cursor-pointer">
        <i class="fa-solid text-xl fa-chevron-right text-gray-600"></i>
      </button>
    </div>
  `;
}
function renderListings(listings: any[], currentUserName?: string) {
  const container = document.getElementById('homeContent');
  if (!container) return;

  if (!listings.length) {
    container.innerHTML = `
      <div class="col-span-full text-center py-10">
        <p class="text-gray-500">No listings found in this category.</p>
      </div>`;
    return;
  }

  // Render actual listing cards
  container.innerHTML = listings
    .map((listing) => listingCard(listing, currentUserName))
    .join('');

  // ⭐ Start countdown timers
  startCountdowns(listings);

  // ⭐ Re-bind login buttons (same behavior as HomeView)
  const loginButtons =
    container.querySelectorAll<HTMLButtonElement>('button[data-login]');

  loginButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      navigateTo('/login');
    });
  });
}

export function setupCategoryScroll() {
  const nav = document.getElementById('categoryContainer');
  const leftBtn = document.getElementById('catScrollLeft');
  const rightBtn = document.getElementById('catScrollRight');
  if (!nav || !leftBtn || !rightBtn) return;

  nav.style.scrollBehavior = 'smooth';
  nav.style.overflow = 'hidden';

  const categoryButtons = Array.from(
    nav.querySelectorAll<HTMLButtonElement>('.category-btn')
  );

  let activeIndex = categoryButtons.findIndex((btn) =>
    btn.classList.contains('bg-gray-50')
  );
  if (activeIndex === -1) activeIndex = 0;

  function updateActive(index: number) {
    if (index < 0 || index >= categoryButtons.length) return;

    categoryButtons[activeIndex].classList.remove(
      'bg-gray-200',
      'text-gray-600',
      'border',
      'border-gray-600',
      'shadow-sm'
    );

    categoryButtons[index].classList.add(
      'bg-gray-200',
      'text-gray-600',
      'border',
      'border-gray-600',
      'shadow-sm'
    );

    activeIndex = index;

    categoryButtons[index].scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
    });

    const selectedCategory = categoryButtons[index].dataset.category || 'all';
    fetchListings(selectedCategory, true);

    updateArrows();
  }

  leftBtn.addEventListener('click', () => updateActive(activeIndex - 1));
  rightBtn.addEventListener('click', () => updateActive(activeIndex + 1));

  function updateArrows() {
    if (leftBtn && rightBtn) {
      leftBtn.style.display = activeIndex > 0 ? 'flex' : 'none';
      rightBtn.style.display =
        activeIndex < categoryButtons.length - 1 ? 'flex' : 'none';
    }
  }

  updateArrows();

  categoryButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => updateActive(i));
  });

  const initialCategory =
    categoryButtons[activeIndex]?.dataset.category || 'all';

  fetchListings(initialCategory, true);
}
