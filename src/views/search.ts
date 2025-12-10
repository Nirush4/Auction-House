import { showLoadingOverlay, hideLoadingOverlay } from '../utils/overlay'
import { showToast } from '../utils/toast'
import { listingCard } from '../views/home'
import { startCountdowns } from '../utils/startCountdowns'
import { getUserProfile } from '../utils/storage'

const LISTINGS_PER_PAGE = 9

export async function SearchView(root: HTMLElement) {
  root.innerHTML = `
    <div class="container mx-auto px-5 mt-23 md:mt-40 mb-12 sm:mb-20">
      <div id="searchResults" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
      <div id="paginationControls" class="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-15"></div>
    </div>
  `

  const resultsContainer = document.getElementById('searchResults')!
  const paginationContainer = document.getElementById('paginationControls')!

  const urlParams = new URLSearchParams(window.location.search)
  const initialQuery = urlParams.get('q') || ''

  async function fetchResults(query: string, page = 1) {
    showLoadingOverlay({ message: 'Searching listings...' })

    try {
      let url = ''
      if (query.trim()) {
        url = `https://v2.api.noroff.dev/auction/listings/search?q=${encodeURIComponent(
          query
        )}&_seller=true&_bids=true`
      } else {
        url = `https://v2.api.noroff.dev/auction/listings?limit=100&_seller=true&_bids=true`
      }

      const res = await fetch(url)
      if (!res.ok)
        throw new Error(`API returned ${res.status}: ${res.statusText}`)

      const json = await res.json()
      let listings = json.data || []

      if (!Array.isArray(listings) || listings.length === 0) {
        resultsContainer.innerHTML =
          '<p class="text-gray-500 text-center">No listings found.</p>'
        paginationContainer.innerHTML = ''
        return
      }

      // Sort by newest first
      listings.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      )

      // Pagination
      const totalPages = Math.ceil(listings.length / LISTINGS_PER_PAGE)
      const paginatedListings = listings.slice(
        (page - 1) * LISTINGS_PER_PAGE,
        page * LISTINGS_PER_PAGE
      )

      const currentUser = getUserProfile() ?? undefined

      resultsContainer.innerHTML = paginatedListings
        .map((listing) => listingCard(listing, currentUser))
        .join('')

      startCountdowns(paginatedListings)

      renderPagination(paginationContainer, totalPages, page, (p) =>
        fetchResults(query, p)
      )

      // Scroll to listing section after fetching
      const section = document.getElementById('searchResults')
      if (section)
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (err) {
      console.error('Fetch error:', err)
      showToast('error', (err as Error).message)
      resultsContainer.innerHTML =
        '<p class="text-red-500 text-center">Failed to fetch listings. Please try again later.</p>'
      paginationContainer.innerHTML = ''
    } finally {
      hideLoadingOverlay()
    }
  }

  fetchResults(initialQuery)

  window.addEventListener('popstate', () => {
    const urlParams2 = new URLSearchParams(window.location.search)
    const query = urlParams2.get('q') || ''
    fetchResults(query, 1)
  })
}

function renderPagination(
  container: HTMLElement,
  totalPages: number,
  currentPage: number,
  onPageClick: (page: number) => void
) {
  container.innerHTML = ''
  if (totalPages <= 1) return

  const prevBtn = document.createElement('button')
  prevBtn.innerHTML = '‹'
  prevBtn.disabled = currentPage === 1
  prevBtn.className = `
    px-3 py-1 rounded transition cursor-pointer
    ${
      currentPage === 1
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
    }
  `
  prevBtn.addEventListener('click', () => {
    onPageClick(currentPage - 1)
    scrollToListings()
  })
  container.appendChild(prevBtn)

  const maxPagesToShow = 5
  let startPage = Math.max(1, currentPage - 2)
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1)
  }

  if (startPage > 1) {
    container.appendChild(createPageBtn(1, currentPage, onPageClick))
    if (startPage > 2) addEllipsis(container)
  }

  for (let i = startPage; i <= endPage; i++) {
    container.appendChild(createPageBtn(i, currentPage, onPageClick))
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) addEllipsis(container)
    container.appendChild(createPageBtn(totalPages, currentPage, onPageClick))
  }

  const nextBtn = document.createElement('button')
  nextBtn.innerHTML = '›'
  nextBtn.disabled = currentPage === totalPages
  nextBtn.className = `
    px-3 py-1 rounded transition cursor-pointer
    ${
      currentPage === totalPages
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
    }
  `
  nextBtn.addEventListener('click', () => {
    onPageClick(currentPage + 1)
    scrollToListings()
  })
  container.appendChild(nextBtn)

  function createPageBtn(
    page: number,
    currentPage: number,
    onClick: (page: number) => void
  ) {
    const btn = document.createElement('button')
    btn.textContent = page.toString()
    btn.className = `
      px-3 py-1 sm:px-4 sm:py-2 rounded text-sm sm:text-base cursor-pointer transition
      ${
        page === currentPage
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }
    `
    btn.addEventListener('click', () => {
      onClick(page)
      scrollToListings()
    })
    return btn
  }

  function addEllipsis(container: HTMLElement) {
    const span = document.createElement('span')
    span.textContent = '...'
    span.className = 'px-2 py-1 text-gray-500'
    container.appendChild(span)
  }

  function scrollToListings() {
    const section = document.getElementById('searchResults')
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
