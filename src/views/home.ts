import type { Listing } from '../types/index'
import { getUserProfile } from '../utils/storage'
import { HeroSection } from './heroSection'

import {
  CategoryFilter,
  setupCategoryScroll,
} from '../components/categoryFilter'
import { showLoadingOverlay, hideLoadingOverlay } from '../utils/overlay'
import { navigateTo } from '../router'
import { startCountdowns } from '../utils/startCountdowns'
import { showToast } from '../utils/toast'
import { openEditListingModal } from '../components/editListingModal'

const LISTINGS_PER_PAGE = 9

// imp! HOME

export async function HomeView(root: HTMLElement): Promise<void> {
  root.innerHTML = `
    ${HeroSection()}  

<section id="ending-soon-section" class="container pt-12 md:pt-14 pb-12 sm:pb-19 space-y-10 mx-auto px-6 bg-gradient-to-r from-red-50 via-red-150 to-red-50  shadow-md border-2 border-red-200">
  <header class="flex items-end justify-between flex-wrap gap-4">
    <div>
      <h2 class="text-2xl sm:text-4xl font-bold text-red-500">⏳ Ending Soon</h2>
      <p class="text-gray-700 text-base md:text-lg">Hurry! Auctions about to close</p>
    </div>
  </header>

  <div id="endingSoonContent" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    ${Array.from({ length: 4 })
      .map(() => listingSkeleton())
      .join('')}
  </div>
</section>


    <!-- Category Filter Bar -->
    <section id="listItems" class="container mx-auto px-6 pt-18 sm:pt-23">
      ${CategoryFilter()}
    </section>

    <section id="listing-section" class="pt-12 md:pt-14 pb-12 sm:pb-25 space-y-10 container mx-auto px-6">
      <header class="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-2xl sm:text-4xl font-bold text-gray-800">🏠 Latest Auctions</h1>
          <p class="text-gray-500 text-base md:text-lg">Discover and bid on the newest listings</p>
        </div>
      </header>
      <div id="homeContent" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="col-span-full text-center py-10">
          <p class="text-gray-500">Loading listings...</p>
        </div>
      </div>
      <div id="paginationControls" class="flex flex-wrap justify-center gap-2 sm:gap-3 mt-6 sm:mt-15"></div>
    </section>
  `

  setupCategoryScroll()
  setupSmoothScroll(root)
  setupProfileLinks()

  const listings = await fetchListings(1)
  if (listings) {
    renderEndingSoon(listings)
    startCountdowns(listings)
  }
}

export function listingSkeleton(): string {
  return `
    <div class="animate-pulse flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 bg-gray-300 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
      <div class="relative aspect-video rounded-lg overflow-hidden bg-gray-300"></div>
      <div class="space-y-2">
        <div class="h-5 bg-gray-300 rounded w-3/4"></div>
        <div class="h-3 bg-gray-300 rounded w-full"></div>
        <div class="h-3 bg-gray-300 rounded w-5/6"></div>
      </div>
      <div class="flex justify-between items-center mt-3">
        <div class="h-4 bg-gray-300 rounded w-1/3"></div>
        <div class="h-4 bg-gray-300 rounded w-1/4"></div>
      </div>
      <div class="h-10 bg-gray-300 rounded-lg mt-3 w-full"></div>
    </div>
  `
}

function renderEndingSoon(listings: Listing[]) {
  const container = document.getElementById('endingSoonContent')!

  const now = new Date()
  const endingSoonListings = listings
    .filter((l) => l.endsAt && new Date(l.endsAt) > now)
    .sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime())
    .slice(0, 4)

  if (!endingSoonListings.length) {
    container.innerHTML =
      '<p class="text-gray-500 col-span-full text-center">No auctions ending soon.</p>'
    return
  }

  const currentUser = getUserProfile() ?? undefined

  container.innerHTML = endingSoonListings
    .map((l) => listingCard(l, currentUser))
    .join('')

  startCountdowns(endingSoonListings)
}

function setupSmoothScroll(root: HTMLElement) {
  const viewListBtn = root.querySelector('#viewlist')
  const browseBtn = root.querySelector('a[href="#listItems"]')

  function smoothScroll(e: Event) {
    e.preventDefault()
    const section = document.querySelector('#listItems')
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (viewListBtn) viewListBtn.addEventListener('click', smoothScroll)
  if (browseBtn) browseBtn.addEventListener('click', smoothScroll)
}

function setupProfileLinks() {
  document.querySelectorAll('a[href="/profile"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      showLoadingOverlay({ message: 'Loading your profile...' })
      navigateTo('/profile')
    })
  })
}

export async function fetchListings(page = 1, tag = '', shouldScroll = false) {
  const homeContent = document.getElementById('homeContent')!
  const paginationControls = document.getElementById('paginationControls')!

  homeContent.innerHTML = Array.from({ length: LISTINGS_PER_PAGE })
    .map(() => listingSkeleton())
    .join('')

  try {
    const params = new URLSearchParams({
      limit: LISTINGS_PER_PAGE.toString(),
      page: page.toString(),
      sort: 'created',
      sortOrder: 'desc',
      _seller: 'true',
      _bids: 'true',
    })
    if (tag) params.append('_tag', tag)

    const url = `https://v2.api.noroff.dev/auction/listings?${params.toString()}`

    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch listings')

    const json = await res.json()
    const listings: Listing[] = json.data ?? []
    const totalListings: number = json.meta?.totalCount ?? listings.length
    const totalPages = Math.ceil(totalListings / LISTINGS_PER_PAGE)

    if (!listings.length) {
      homeContent.innerHTML =
        '<p class="text-gray-500 text-center">No listings found.</p>'
      paginationControls.innerHTML = ''
      return
    }

    const currentUser = getUserProfile() ?? undefined

    homeContent.innerHTML = listings
      .map((l) => listingCard(l, currentUser))
      .join('')

    homeContent.classList.add('transition-opacity', 'duration-500')
    homeContent.style.opacity = '0'
    setTimeout(() => {
      homeContent.style.opacity = '1'
    }, 50)

    document.querySelectorAll('button[data-login]').forEach((btn) => {
      btn.addEventListener('click', () => {
        navigateTo('/login')
      })
    })

    startCountdowns(listings)

    renderPagination(paginationControls, totalPages, page, (p) =>
      fetchListings(p, tag, true)
    )

    if (shouldScroll) {
      setTimeout(() => {
        const section = document.querySelector('#listing-section')
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 150)
    }
    return listings
  } catch (err) {
    console.error(err)
    showToast('error', (err as Error).message)
  } finally {
    hideLoadingOverlay()
  }
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
    px-3 py-1 rounded transition
    ${
      currentPage === 1
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
    }
  `
  prevBtn.addEventListener('click', () => onPageClick(currentPage - 1))
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
    px-3 py-1 rounded cursor-pointer text-sm sm:text-lg transition
    ${
      currentPage === totalPages
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
    }
  `
  nextBtn.addEventListener('click', () => onPageClick(currentPage + 1))
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
    btn.addEventListener('click', () => onClick(page))
    return btn
  }

  function addEllipsis(container: HTMLElement) {
    const span = document.createElement('span')
    span.textContent = '...'
    span.className = 'px-2 py-1 text-gray-500'
    container.appendChild(span)
  }
}

export function listingCard(
  listing: Listing,
  currentUser?: { id: string; name: string; avatar?: any }
): string {
  const isOwner = (() => {
    if (!currentUser) return false
    const currentPath = window.location.pathname
    const profileUsername = currentPath.startsWith('/profile/')
      ? currentPath.split('/')[2]
      : undefined

    if (currentPath === '/profile') return true
    if (profileUsername) return profileUsername === currentUser.name
    return false
  })()

  const currentSection = document.getElementById('ending-soon-section')
  const isEndingSoon =
    currentSection && currentSection.contains(document.createElement('div'))

  const cardExtraClasses =
    'group relative rounded-2xl overflow-hidden transition-all duration-500 ' +
    (isEndingSoon
      ? 'border-2 border-red-400 shadow-lg hover:shadow-2xl'
      : 'border-5 border-gray-100 shadow-sm')

  const img =
    listing.media?.[0]?.url ??
    'https://images.unsplash.com/photo-1631913290783-490324506193?auto=format&fit=crop&q=80&w=800'
  const alt = listing.media?.[0]?.alt ?? listing.title ?? 'Listing image'
  const bids = listing._count?.bids ?? 0
  const sellerName = listing.seller?.name ?? 'Unknown seller'
  const sellerAvatar =
    listing.seller?.avatar?.url ??
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop'
  const sellerAlt = listing.seller?.avatar?.alt ?? sellerName
  const category = listing.tags?.[0] ?? null
  const highestBid = listing.bids?.length
    ? Math.max(...listing.bids.map((b) => b.amount))
    : 0
  const created = listing.created
    ? new Date(listing.created).toLocaleDateString('en-GB')
    : 'Unknown'
  const title = listing.title?.trim()
    ? listing.title.trim().slice(0, 20) +
      (listing.title.trim().length > 20 ? '…' : '')
    : 'No titile provided.'
  const description = listing.description?.trim()
    ? listing.description.trim().slice(0, 35) +
      (listing.description.trim().length > 35 ? '…' : '')
    : 'No description provided.'
  const countdownId = `countdown-${listing.id}`

  return `
    <div class="${cardExtraClasses} bg-white backdrop-blur-md hover:-translate-y-1">

      <!-- Seller -->
<a href="/profile/${encodeURIComponent(sellerName)}"
   class="flex items-center gap-3 pt-1 mx-5 my-3 cursor-pointer hover:opacity-80 transition">

  <!-- Avatar -->
  <img 
    src="${sellerAvatar}" 
    alt="${sellerAlt}" 
    class="h-12 w-12 rounded-full object-cover 
           border border-gray-300 shadow-sm
           transition-transform duration-200 ease-out
           group-hover:scale-105"
  />

  <!-- Username + verified -->
  <div class="flex flex-col">
    <div class="flex items-center gap-1.5">
      <span class="text-base font-semibold text-gray-900 tracking-wide">
        ${sellerName}
      </span>

      <!-- Verified Badge -->
      <span 
        title="Verified Seller"
        class="inline-flex items-center justify-center h-4 w-4 
               rounded-full bg-blue-500 text-white text-[10px] 
               shadow-sm border border-white/80
               group-hover:scale-110 transition-transform">
        ✔
      </span>
    </div>

    <span class="text-xs text-gray-500 italic">
      ${isEndingSoon ? 'Auction Ending Soon' : 'Verified Seller'}
    </span>
  </div>
</a>


      <!-- Image & Countdown -->
      <a href="/listing/${listing.id}">
        <div class="relative aspect-video overflow-hidden">
          <img src="${img}" alt="${alt}" class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity"></div>
          <div id="${countdownId}" class="absolute bottom-3 left-0 mx-3 px-2 py-1 text-xs md:text-[14px] font-medium text-gray-700 rounded-md bg-white/90 backdrop-blur shadow-sm">
            ⏳ Calculating...
          </div>

          ${
            category
              ? `<div class="absolute top-3 left-3 ${
                  isEndingSoon ? 'bg-red-500/90' : 'bg-indigo-600/90'
                } text-white text-xs font-medium px-2 py-1 rounded shadow">${category}</div>`
              : ''
          }
        </div>
      </a>

      <!-- Details -->
      <div class="p-5 space-y-3">
        <a href="/listing/${listing.id}">
          <h3 class="font-semibold text-base sm:text-lg text-gray-900 transition-colors line-clamp-1">${
            title ?? 'Untitled'
          }</h3>
        </a>
        <p class="text-sm sm:text-[14px] text-gray-600 line-clamp-2 leading-snug">${description}</p>

        <div class="flex justify-between items-center text-sm gap-5 sm:text-xs xs:text-[10px] text-gray-600">
          <p class="text-gray-500 text-xs sm:text-[14px]">Created: <span class="font-medium text-gray-800">${created}</span></p>
          <p class="text-gray-700 text-xs sm:text-[14px] font-bold">Highest Bid: <span class="font-bold text-indigo-600 text-lg sm:text-base">$${highestBid}</span></p>
        </div>

        <div class="flex items-center justify-between text-xs sm:text-[14px] text-gray-600 pt-1">
          <p><span class="font-semibold text-indigo-600 text-lg sm:text-base">${bids}</span> bid${
    bids === 1 ? '' : 's'
  }</p>
        </div>

        <!-- Owner / Bid buttons -->
        ${
          isOwner
            ? `<div class="flex gap-2 mt-3">
                 <button class="editListingBtn flex-1 rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer" data-listing-id="${listing.id}">Edit</button>
                 <button class="deleteListingBtn flex-1 rounded-lg bg-red-600 py-2 font-medium text-white hover:bg-red-700 transition-colors cursor-pointer" data-listing-id="${listing.id}">Delete</button>
               </div>`
            : currentUser
            ? `<div class="mt-3">
                 <button data-bid data-listing-id="${listing.id}" class="w-full rounded-lg bg-green-600 py-2 font-medium text-white hover:bg-green-500 transition cursor-pointer">
                   <a href="/listing/${listing.id}" class="block w-full h-full">Bid Now</a>
                 </button>
               </div>`
            : `<div class="mt-3">
                 <button id="login" data-login class="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-500 transition cursor-pointer">Login to Bid</button>
               </div>`
        }
      </div>
    </div>
  `
}

document.addEventListener('click', async (e) => {
  const btn = (e.target as HTMLElement).closest('.editListingBtn')
  if (!btn) return
  const listingId = btn.getAttribute('data-listing-id')
  if (!listingId) return
  openEditListingModal(listingId)
})
