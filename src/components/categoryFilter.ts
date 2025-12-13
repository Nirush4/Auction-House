import { navigateTo } from '../router'
import { startCountdowns } from '../utils/startCountdowns'
import { getUserProfile } from '../utils/storage'
import { listingCard } from '../views/home'

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
}

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
]

export async function fetchListings(
  categoryId: string,
  page: number = 1,
  activeOnly: boolean = true
) {
  const tags = categoryTagMap[categoryId]
  const allResults: any[] = []

  if (categoryId === 'all' || !tags) {
    const params = new URLSearchParams()
    if (activeOnly) params.append('_active', 'true')
    params.append('_seller', 'true')
    params.append('_bids', 'true')
    params.append('limit', '9')
    params.append('page', page.toString())
    params.append('sort', 'created')
    params.append('sortOrder', 'desc')

    const url = `https://v2.api.noroff.dev/auction/listings?${params.toString()}`

    try {
      const res = await fetch(url)
      if (res.ok) {
        const json = await res.json()
        const listings = json.data || []
        allResults.push(...listings)
      }
    } catch (err) {
      console.error('Failed to fetch all listings', err)
    }
  } else {
    for (const tag of tags) {
      const params = new URLSearchParams()
      params.append('_tag', tag)
      if (activeOnly) params.append('_active', 'true')
      params.append('_seller', 'true')
      params.append('_bids', 'true')
      params.append('limit', '9')
      params.append('page', page.toString())
      params.append('sort', 'created')
      params.append('sortOrder', 'desc')

      const url = `https://v2.api.noroff.dev/auction/listings?${params.toString()}`

      try {
        const res = await fetch(url)
        if (res.ok) {
          const json = await res.json()
          const listings = json.data || []
          allResults.push(...listings)
        }
      } catch (err) {
        console.error(`Failed to fetch listings for tag: ${tag}`, err)
      }
    }
  }

  const uniqueResults = Array.from(
    new Map(allResults.map((item) => [item.id, item])).values()
  )

  renderListings(uniqueResults)
}

export function renderListings(listings: any[], _currentUserName?: string) {
  const container = document.getElementById('homeContent')
  if (!container) return

  if (!listings.length) {
    container.innerHTML = `
      <div class="col-span-full text-center py-10">
        <p class="text-gray-500">No listings found in this category.</p>
      </div>`
    return
  }
  const currentUser = getUserProfile()
  const currentUserName = currentUser?.name ?? undefined

  container.innerHTML = listings
    .map((listing) => listingCard(listing, currentUserName))
    .join('')

  startCountdowns(listings)

  const loginBtns =
    container.querySelectorAll<HTMLButtonElement>('button[data-login]')
  loginBtns.forEach((btn) =>
    btn.addEventListener('click', () => navigateTo('/login'))
  )
}

export function CategoryFilter(activeCategory: string = 'all') {
  return `
    <div class="relative flex items-center justify-around">
      <button id="catScrollLeft" class="p-3 bg-white/70 rounded-full shadow hover:bg-white transition hidden md:flex cursor-pointer">
        <i class="fa-solid fa-chevron-left text-gray-600 text-xl"></i>
      </button>

      <nav id="categoryContainer" 
        class="flex gap-1 sm:gap-2 justify-between py-2 sm:py-4 px-4 sm:px-6 overflow-x-auto scrollbar-hide scroll-smooth">
        
        ${categories
          .map(
            (cat) => `
          <button 
            data-category="${cat.id}"
            class="category-btn flex flex-col items-center gap-1 px-2 md:px-4 py-2 rounded-lg transition cursor-pointer 
              ${
                cat.id === activeCategory
                  ? 'bg-gray-200 border border-gray-600 shadow-sm'
                  : 'text-gray-800 hover:bg-gray-200'
              }"
          >
            <i class="${cat.icon} text-xl text-gray-800"></i>
            <span class="text-xs sm:text-base whitespace-nowrap">${
              cat.label
            }</span>
          </button>`
          )
          .join('')}
      </nav>

      <button id="catScrollRight" class="p-3 bg-white/70 rounded-full shadow hover:bg-white transition hidden md:flex cursor-pointer">
        <i class="fa-solid fa-chevron-right text-gray-800 text-xl"></i>
      </button>
    </div>
  `
}

export function setupCategoryScroll() {
  const nav = document.getElementById('categoryContainer')
  const leftBtn = document.getElementById('catScrollLeft')
  const rightBtn = document.getElementById('catScrollRight')

  if (!nav || !leftBtn || !rightBtn) return

  nav.style.scrollBehavior = 'smooth'

  const categoryButtons = Array.from(
    nav.querySelectorAll<HTMLButtonElement>('.category-btn')
  )

  let activeIndex = 0

  function updateActive(index: number) {
    if (index < 0 || index >= categoryButtons.length) return

    categoryButtons[activeIndex].classList.remove(
      'bg-gray-200',
      'border',
      'border-gray-600',
      'shadow-sm'
    )

    categoryButtons[index].classList.add(
      'bg-gray-200',
      'border',
      'border-gray-600',
      'shadow-sm'
    )

    activeIndex = index

    const selectedCategory = categoryButtons[index].dataset.category || 'all'

    fetchListings(selectedCategory, 1, true)
    updateArrows()

    categoryButtons[index].scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }

  function updateArrows() {
    if (leftBtn && rightBtn) {
      leftBtn.style.display = activeIndex > 0 ? 'flex' : 'none'
      rightBtn.style.display =
        activeIndex < categoryButtons.length - 1 ? 'flex' : 'none'
    }
  }

  leftBtn.addEventListener('click', () => updateActive(activeIndex - 1))
  rightBtn.addEventListener('click', () => updateActive(activeIndex + 1))

  categoryButtons.forEach((btn, i) =>
    btn.addEventListener('click', () => updateActive(i))
  )

  updateArrows()

  const initialCategory = categoryButtons[activeIndex].dataset.category || 'all'
  fetchListings(initialCategory, 1, true)
}
