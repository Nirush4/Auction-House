import { navigateTo } from '../router';
import { startCountdowns } from '../utils/startCountdowns';
import { listingCard } from '../views/home';

//
// CATEGORY MAP
//
const categoryTagMap: Record<string, string[] | null> = {
  all: null,

  art: [
    'art',
    'Art',
    'painting',
    'Painting',
    'drawings',
    'Drawings',
    'illustration',
    'Illustration',
  ],

  watches: ['watches', 'Watches', 'watch', 'Watch', 'timepiece', 'Timepiece'],

  jewelry: [
    'jewelry',
    'Jewelry',
    'jewel',
    'Jewel',
    'gems',
    'Gems',
    'accessories',
    'Accessories',
  ],

  vintage: ['vintage', 'Vintage', 'retro', 'Retro', 'classic', 'Classic'],

  fashion: [
    'fashion',
    'Fashion',
    'clothes',
    'Clothes',
    'clothing',
    'Clothing',
    'apparel',
    'Apparel',
    'style',
    'Style',
  ],

  cars: [
    'cars',
    'Cars',
    'car',
    'Car',
    'vehicle',
    'Vehicle',
    'vehicles',
    'Vehicles',
    'auto',
    'Auto',
    'automobile',
    'Automobile',
  ],

  furniture: [
    'furniture',
    'Furniture',
    'chair',
    'Chair',
    'table',
    'Table',
    'sofa',
    'Sofa',
    'desk',
    'Desk',
  ],

  decor: [
    'decor',
    'Decor',
    'decoration',
    'Decoration',
    'home',
    'Home',
    'interior',
    'Interior',
  ],

  games: ['games', 'Games', 'gaming', 'Gaming', 'game', 'Game'],

  books: [
    'books',
    'Books',
    'book',
    'Book',
    'novel',
    'Novel',
    'reading',
    'Reading',
  ],

  toys: ['toys', 'Toys', 'toy', 'Toy', 'kids', 'Kids'],

  sports: [
    'sports',
    'Sports',
    'sport',
    'Sport',
    'fitness',
    'Fitness',
    'gym',
    'Gym',
  ],
};

//
// CATEGORY LIST USED BY UI
//
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

//
// FETCH LISTINGS BY CATEGORY — WITH SERVER-SIDE SORT + PAGINATION
//
export async function fetchListings(
  categoryId: string,
  page: number = 1,
  activeOnly: boolean = true
) {
  const tags = categoryTagMap[categoryId];

  // For "All listings"
  if (!tags) {
    return;
  }

  const allResults: any[] = [];

  // Fetch each possible tag separately
  for (const tag of tags) {
    const params = new URLSearchParams();

    params.append('_tag', tag);
    if (activeOnly) params.append('_active', 'true');
    params.append('_seller', 'true');
    params.append('_bids', 'true');
    params.append('limit', '9');
    params.append('page', page.toString());
    params.append('sort', 'created');
    params.append('sortOrder', 'desc');

    const url = `https://v2.api.noroff.dev/auction/listings?${params.toString()}`;

    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const json = await res.json();
      const listings = json.data || [];

      allResults.push(...listings);
    } catch {
      // ignore errors for individual tags
    }
  }

  // Remove duplicates (same listing ID)
  const uniqueResults = Array.from(
    new Map(allResults.map((item) => [item.id, item])).values()
  );

  renderListings(uniqueResults);
}

//
// RENDER LISTINGS TO UI
//
export function renderListings(listings: any[], currentUserName?: string) {
  const container = document.getElementById('homeContent');
  if (!container) return;

  if (!listings.length) {
    container.innerHTML = `
      <div class="col-span-full text-center py-10">
        <p class="text-gray-500">No listings found in this category.</p>
      </div>`;
    return;
  }

  container.innerHTML = listings
    .map((listing) => listingCard(listing, currentUserName))
    .join('');

  startCountdowns(listings);

  // Bind login button
  const loginBtns =
    container.querySelectorAll<HTMLButtonElement>('button[data-login]');
  loginBtns.forEach((btn) =>
    btn.addEventListener('click', () => navigateTo('/login'))
  );
}

//
// CATEGORY FILTER UI
//
export function CategoryFilter(activeCategory: string = 'all') {
  return `
    <div class="relative flex items-center justify-around">
      <button id="catScrollLeft" class="p-3 bg-white/70 rounded-full shadow hover:bg-white transition hidden md:flex cursor-pointer">
        <i class="fa-solid fa-chevron-left text-gray-600 text-xl"></i>
      </button>

      <nav id="categoryContainer" 
        class="flex gap-2 justify-between py-2 sm:py-4 px-4 sm:px-6 overflow-x-auto scrollbar-hide scroll-smooth">
        
        ${categories
          .map(
            (cat) => `
          <button 
            data-category="${cat.id}"
            class="category-btn flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition cursor-pointer 
              ${
                cat.id === activeCategory
                  ? 'bg-gray-200 border border-gray-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200'
              }"
          >
            <i class="${cat.icon} text-xl text-gray-500"></i>
            <span class="text-sm whitespace-nowrap">${cat.label}</span>
          </button>`
          )
          .join('')}
      </nav>

      <button id="catScrollRight" class="p-3 bg-white/70 rounded-full shadow hover:bg-white transition hidden md:flex cursor-pointer">
        <i class="fa-solid fa-chevron-right text-gray-600 text-xl"></i>
      </button>
    </div>
  `;
}

//
// CATEGORY SCROLL + CLICK HANDLING
//
export function setupCategoryScroll() {
  const nav = document.getElementById('categoryContainer');
  const leftBtn = document.getElementById('catScrollLeft');
  const rightBtn = document.getElementById('catScrollRight');

  if (!nav || !leftBtn || !rightBtn) return;

  nav.style.scrollBehavior = 'smooth';

  const categoryButtons = Array.from(
    nav.querySelectorAll<HTMLButtonElement>('.category-btn')
  );

  let activeIndex = 0;

  //
  // UPDATE ACTIVE CATEGORY + FETCH DATA
  //
  function updateActive(index: number) {
    if (index < 0 || index >= categoryButtons.length) return;

    categoryButtons[activeIndex].classList.remove(
      'bg-gray-200',
      'border',
      'border-gray-600',
      'shadow-sm'
    );

    categoryButtons[index].classList.add(
      'bg-gray-200',
      'border',
      'border-gray-600',
      'shadow-sm'
    );

    activeIndex = index;

    const selectedCategory = categoryButtons[index].dataset.category || 'all';

    fetchListings(selectedCategory, 1, true);
    updateArrows();
  }

  //
  // ARROW VISIBILITY
  //
  function updateArrows() {
    if (leftBtn && rightBtn) {
      leftBtn.style.display = activeIndex > 0 ? 'flex' : 'none';
      rightBtn.style.display =
        activeIndex < categoryButtons.length - 1 ? 'flex' : 'none';
    }
  }

  //
  // CLICK HANDLERS
  //
  leftBtn.addEventListener('click', () => updateActive(activeIndex - 1));
  rightBtn.addEventListener('click', () => updateActive(activeIndex + 1));

  categoryButtons.forEach((btn, i) =>
    btn.addEventListener('click', () => updateActive(i))
  );

  updateArrows();

  // Load initial category
  const initialCategory =
    categoryButtons[activeIndex].dataset.category || 'all';
  fetchListings(initialCategory, 1, true);
}
