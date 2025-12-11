import { isAuthenticated, clearAuth } from '../utils/storage'
import { navigateTo } from '../router'
import type { Profile } from '../types'

export function getUser(): Profile | null {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

export function renderNavbar() {
  const authed = isAuthenticated()
  const user = getUser()

  const searchInput = `
    <div class="flex items-center bg-gray-200 rounded-lg px-3 py-3 w-full lg:max-w-[250px]">
      <i class="fas fa-search text-indigo-600 mr-2"></i>
      <input 
        id="navbarSearch"
        type="text"
        placeholder="Search auctions..."
        class="bg-transparent focus:outline-none w-full text-gray-700 placeholder-gray-400 text-sm sm:text-base"
        autocomplete="off"
      />
    </div>
  `

  return `
    <nav class="flex flex-col fixed top-0 left-0 w-full z-100 bg-white lg:bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div class="container mx-auto border-b-2 border-gray-200 lg:border-0 px-6 py-3 md:pt-3 lg:py-4 flex items-center justify-between">

        <!-- Logo -->
        <a href="/" class="flex items-center gap-2 text-2xl sm:text-3xl font-medium tracking-tight">
          <span class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Auction
          </span>
          <span class="font-medium text-gray-800">House</span>
        </a>

        <!-- Hamburger menu for mobile -->
        <button id="menuBtn" class="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-[6px] group cursor-pointer" aria-label="Toggle Menu">
          <span class="block w-6 h-[2px] bg-gray-800 rounded transition-all duration-300 origin-center"></span>
          <span class="block w-6 h-[2px] bg-gray-800 rounded transition-all duration-300 origin-center"></span>
          <span class="block w-6 h-[2px] bg-gray-800 rounded transition-all duration-300 origin-center"></span>
        </button>

        <!-- Desktop menu -->
        <div id="desktopMenu" class="hidden lg:flex items-center gap-4">

          <!-- Shared search input -->
          ${searchInput}

          <!-- Nav links container -->
          <div class="flex items-center justify-center gap-2 ml-6">

            <a href="/home" class="relative font-medium text-lg px-4 p-2 mb-2 pb-0 text-gray-700 transition group">
              Home
              <span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full"></span>
            </a>

            ${
              authed
                ? `
                <a href="/create" class="relative text-lg px-4 p-2 mb-2 pb-0 font-medium text-gray-700 transition group">
                  Create
                  <span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a id="navbarProfile" href="/profile" class="relative flex items-center lg:min-w-60 gap-2 px-4 p-2 mb-2 pb-0 text-indigo-600 font-semibold transition group">
                  <span class="truncate max-w-[120px] text-lg">Hi, ${
                    user?.name || 'Profile'
                  }</span>
                  <span class="inline-block bg-indigo-600 text-white text-base font-medium px-3 py-2 rounded-full">
                    ${user?.credits ?? 1000} credits
                  </span>
                  <span class="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
                <button id="logoutBtn" class="ml-2 px-5 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md hover:shadow-lg hover:scale-105 transition cursor-pointer">Logout</button>
                `
                : `
                <a href="/login" class="px-5 py-2 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md hover:shadow-lg hover:scale-105 transition">Login</a>
                <a href="/register" class="px-5 py-2 rounded-full text-lg font-semibold text-gray-700 border border-gray-300 hover:bg-gray-100 hover:shadow-sm transition">Register</a>
                `
            }
          </div>

        </div>
      </div>

      <!-- Mobile menu -->
      <div id="mobileMenu" class="lg:hidden container mx-auto px-6 max-h-0 overflow-hidden transition-all duration-500 ">
        <div class="flex flex-col space-y-3 py-5">

          <!-- Shared search input for mobile, same markup & style -->
          ${searchInput
            .replace('id="navbarSearch"', 'id="navbarSearchMobile"')
            .replace('max-w-[250px]', 'max-w-full')}

          <a href="/home" class="block px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-base">Home</a>
          ${
            authed
              ? `
              <a href="/create" class="block px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition text-base">Create</a>
              <a id="mobileProfile" href="/profile" class="flex items-center justify-between px-4 py-2 rounded-full text-indigo-600 font-semibold hover:text-indigo-700 hover:bg-gray-100 transition">
                <span class="truncate text-base">Hi, ${
                  user?.name || 'Profile'
                }</span>
                <span class="inline-block bg-indigo-600 text-white text-sm font-medium px-3 py-2 rounded-full">
                  ${user?.credits ?? 0} credits
                </span>
              </a>
              <button id="mobileLogoutBtn" class="w-full text-left px-4 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-md transition cursor-pointer">Logout</button>
              `
              : `
              <a href="/login" class="block px-4 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-md transition">Login</a>
              <a href="/register" class="block px-4 py-2 rounded-full font-semibold text-gray-700 border border-gray-300 hover:bg-gray-100 transition">Register</a>
              `
          }
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
  const logoutBtn = document.getElementById('logoutBtn')
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn')

  function handleLogout() {
    clearAuth()
    localStorage.removeItem('user')
    navigateTo('/login')
  }

  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout)
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout)
}

export function setupNavbarSearch() {
  const desktopInput = document.getElementById(
    'navbarSearch'
  ) as HTMLInputElement | null
  const mobileInput = document.getElementById(
    'navbarSearchMobile'
  ) as HTMLInputElement | null

  let debounceTimer: ReturnType<typeof setTimeout>

  function navigateToSearch(query: string) {
    const encoded = encodeURIComponent(query)
    history.pushState({}, '', `/search?q=${encoded}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value.trim()
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      if (value.length > 0) navigateToSearch(value)
    }, 900)
  }

  if (desktopInput) desktopInput.addEventListener('input', handleInput)
  if (mobileInput) mobileInput.addEventListener('input', handleInput)

  const urlParams = new URLSearchParams(window.location.search)
  const initialQuery = urlParams.get('q')?.trim() || ''
  if (initialQuery.length > 0) {
    if (desktopInput) desktopInput.value = initialQuery
    if (mobileInput) mobileInput.value = initialQuery
  }
}
