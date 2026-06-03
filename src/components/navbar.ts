import { isAuthenticated, clearAuth } from '../utils/storage'
import { navigateTo } from '../router'
import type { Profile } from '../types'

const LOGO_PATH = '/auction-house2.png'

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop'

export function getUser(): Profile | null {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

function renderSearchInput(id: string, maxWidthClass: string) {
  return `
    <div class="flex items-center bg-gray-200 rounded-lg px-3 py-3 w-full ${maxWidthClass}">
      <i class="fas fa-search text-indigo-600 mr-2"></i>
      <input
        id="${id}"
        type="text"
        placeholder="Search auctions..."
        class="bg-transparent focus:outline-none w-full text-gray-700 placeholder-gray-400 text-sm sm:text-base"
        autocomplete="off"
      />
    </div>
  `
}

function handleLogout() {
  clearAuth()
  localStorage.removeItem('user')
  navigateTo('/login')
}

function renderDesktopAuthLinks(
  authed: boolean,
  user: Profile | null,
  avatar: string
) {
  if (!authed) {
    return `
      <a href="/login" class="px-5 py-2 rounded-full text-base font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md hover:shadow-lg hover:scale-105 transition">Login</a>
      <a href="/register" class="px-5 py-2 rounded-full text-base font-semibold text-gray-700 border border-gray-300 hover:bg-gray-100 hover:shadow-sm transition">Register</a>
    `
  }

  return `
    <a href="/create" class="relative text-base px-4 p-2 mb-2 pb-0 font-medium text-gray-700 transition group">
      Create
      <span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full"></span>
    </a>

    <a id="navbarProfile" href="/profile" class="relative flex items-center gap-2 px-4 p-2 mb-2 pb-0 text-indigo-600 font-semibold transition group">
      <div class="flex items-center gap-1">
        <img src="${avatar}" alt="${
    user?.name || 'Profile'
  }" class="h-8 w-8 rounded-full object-cover border border-gray-300 shadow-sm"/>
        <span class="truncate max-w-[120px] text-base mt-1">Hi, ${
          user?.name || 'Profile'
        }</span>
      </div>

      <span class="inline-block bg-indigo-600 text-white text-base font-medium px-3 py-2 rounded-full">
        ${user?.credits ?? 1000} credits
      </span>

      <span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full"></span>
    </a>

    <button id="logoutBtn"
      class="ml-2 px-5 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md hover:shadow-lg hover:scale-105 transition cursor-pointer">
      Logout
    </button>
  `
}

function renderMobileAuthLinks(
  authed: boolean,
  user: Profile | null,
  avatar: string
) {
  if (!authed) {
    return `
      <a href="/login" class="block px-4 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-md transition">Login</a>
      <a href="/register" class="block px-4 py-2 rounded-full font-semibold text-gray-700 border border-gray-300 hover:bg-gray-100 transition">Register</a>
    `
  }

  return `
    <a href="/create" class="block px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-base">Create</a>

    <a id="mobileProfile" href="/profile"
      class="flex items-center justify-between px-4 py-2 rounded-full text-indigo-600 font-semibold hover:bg-gray-100 transition">

      <div class="flex items-center gap-1">
        <img src="${avatar}" alt="${
    user?.name || 'Profile'
  }" class="h-8 w-8 rounded-full object-cover border border-gray-300 shadow-sm"/>
        <span class="truncate text-base mt-1">Hi, ${
          user?.name || 'Profile'
        }</span>
      </div>

      <span class="inline-block bg-indigo-600 text-white text-sm font-medium px-3 py-2 rounded-full">
        ${user?.credits ?? 0} credits
      </span>
    </a>

    <button id="mobileLogoutBtn"
      class="w-full text-left px-4 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-md transition cursor-pointer">
      Logout
    </button>
  `
}

export function renderNavbar() {
  const authed = isAuthenticated()
  const user = getUser()
  const avatar = user?.avatar?.url ?? DEFAULT_AVATAR

  return `
    <nav class="flex flex-col fixed top-0 left-0 w-full z-100 bg-white lg:bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">

      <div class="container mx-auto px-6 py-3 flex items-center justify-between">

        <!-- Logo -->
        <a href="/" class="flex items-center gap-2 text-2xl sm:text-3xl font-medium tracking-tight">
          <img src="${LOGO_PATH}" alt="Auction House Logo" class="h-10 w-auto sm:h-12"/>
        </a>

        <!-- Mobile menu button -->
        <button id="menuBtn"
          class="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-[6px]"
          aria-label="Toggle Menu">
          <span class="w-6 h-[2px] bg-gray-800 rounded"></span>
          <span class="w-6 h-[2px] bg-gray-800 rounded"></span>
          <span class="w-6 h-[2px] bg-gray-800 rounded"></span>
        </button>

        <!-- Desktop menu -->
        <div id="desktopMenu" class="hidden lg:flex items-center gap-4">
          ${renderSearchInput('navbarSearch', 'lg:max-w-[250px]')}

          <div class="flex items-center gap-2">
            <a href="/home" class="relative font-medium text-base px-4 p-2 mb-2 pb-0 text-gray-700 transition group">
              Home
              <span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 group-hover:w-full transition-all"></span>
            </a>

            ${renderDesktopAuthLinks(authed, user, avatar)}
          </div>
        </div>

      </div>

      <!-- Mobile menu -->
      <div id="mobileMenu" class="lg:hidden container mx-auto px-6 max-h-0 overflow-hidden transition-all duration-500">
        <div class="flex flex-col space-y-3 py-5">

          ${renderSearchInput('navbarSearchMobile', 'max-w-full')}

          <a href="/home" class="block px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition">
            Home
          </a>

          ${renderMobileAuthLinks(authed, user, avatar)}
        </div>
      </div>

    </nav>
  `
}

export function setupNavbarToggle() {
  const menuBtn = document.getElementById('menuBtn')
  const desktopMenu = document.getElementById('desktopMenu')
  if (!menuBtn || !desktopMenu) return

  menuBtn.addEventListener('click', () => {
    desktopMenu.classList.toggle('hidden')
  })
}

export function setupNavbarActions() {
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout)
  document
    .getElementById('mobileLogoutBtn')
    ?.addEventListener('click', handleLogout)
}

export function setupNavbarSearch() {
  const desktopInput = document.getElementById(
    'navbarSearch'
  ) as HTMLInputElement | null
  const mobileInput = document.getElementById(
    'navbarSearchMobile'
  ) as HTMLInputElement | null

  let timer: ReturnType<typeof setTimeout>

  function go(query: string) {
    const encoded = encodeURIComponent(query)
    history.pushState({}, '', `/search?q=${encoded}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  function onInput(e: Event) {
    const value = (e.target as HTMLInputElement).value.trim()

    clearTimeout(timer)

    timer = setTimeout(() => {
      if (value) go(value)
    }, 900)
  }

  desktopInput?.addEventListener('input', onInput)
  mobileInput?.addEventListener('input', onInput)

  const initial = new URLSearchParams(window.location.search).get('q')?.trim()
  if (initial) {
    if (desktopInput) desktopInput.value = initial
    if (mobileInput) mobileInput.value = initial
  }
}
