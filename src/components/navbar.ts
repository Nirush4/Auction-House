import { isAuthenticated, getUser, clearAuth } from '../utils/storage';
import { navigateTo } from '../router';

export function renderNavbar() {
  const authed = isAuthenticated();
  const username = getUser();

  return `
    <nav class="fixed top-0 left-0 w-full z-500 bg-white/70 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-5 py-3 flex items-center justify-between">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <span class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Auction
          </span>
          <span class="text-gray-800">House</span>
        </a>

        <!-- Hamburger for mobile -->
        <button id="menuBtn" class="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[6px] group cursor-pointer" aria-label="Toggle Menu">
          <span class="block w-6 h-[2px] bg-gray-800 rounded transition-all duration-300 origin-center"></span>
          <span class="block w-6 h-[2px] bg-gray-800 rounded transition-all duration-300 origin-center"></span>
          <span class="block w-6 h-[2px] bg-gray-800 rounded transition-all duration-300 origin-center"></span>
        </button>

        <!-- Desktop menu -->
        <div id="desktopMenu" class="hidden md:flex items-center gap-3">
          <div class="hidden md:flex items-center ml-4">
            <input 
              id="navbarSearch"
              type="text"
              placeholder="Search auctions..."
              class="px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm w-64 transition-all duration-200"
            />
          </div>
          <a href="/home" class="px-4 py-2 rounded-full font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition">Home</a>
          ${
            authed
              ? `
              <a href="/create" class="px-4 py-2 rounded-full font-medium hover:text-gray-900 hover:bg-gray-100 transition">Create</a>
              <a id="navbarProfile" href="/profile" class="px-4 py-2 rounded-full text-indigo-600 font-bold hover:text-indigo-700 hover:bg-gray-100 transition">
                Hi, ${username || 'Profile'}
              </a>
              <button id="logoutBtn" class="ml-2 px-5 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md hover:shadow-lg hover:scale-105 transition cursor-pointer">Logout</button>
            `
              : `
              <a href="/login" class="px-5 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md hover:shadow-lg hover:scale-105 transition">Login</a>
              <a href="/register" class="px-5 py-2 rounded-full font-semibold text-gray-700 border border-gray-300 hover:bg-gray-100 hover:shadow-sm transition">Register</a>
            `
          }
        </div>
      </div>

      <!-- Mobile menu -->
      <div id="mobileMenu" class="md:hidden max-h-0 overflow-hidden transition-all duration-500 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-inner px-5">
        <div class="flex flex-col space-y-3 py-4">
          <input
            id="navbarSearchMobile"
            type="text"
            placeholder="Search auctions..."
            class="block w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm transition-all duration-200"
          />
          <a href="/home" class="block px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition">Home</a>
          ${
            authed
              ? `
              <a href="/create" class="block px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition">Create</a>
              <a id="mobileProfile" href="/profile" class="block px-4 py-2 text-indigo-600 font-bold rounded-full hover:text-indigo-700 hover:bg-gray-100 transition">
                Hi, ${username || 'Profile'}
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
  `;
}

export function updateNavbarUser() {
  const user = getUser();
  const username = user;
  const navbarProfile = document.getElementById('navbarProfile');
  const mobileProfile = document.getElementById('mobileProfile');

  if (navbarProfile)
    navbarProfile.textContent = `Hei, ${username || 'Profile'}`;
  if (mobileProfile)
    mobileProfile.textContent = `Hei, ${username || 'Profile'}`;
}

export function setupNavbarActions() {
  const logoutBtn = document.getElementById('logoutBtn');
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

  function handleLogout() {
    clearAuth();
    navigateTo('/login');
  }

  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
}

export function setupNavbarSearch() {
  const desktopInput = document.getElementById(
    'navbarSearch'
  ) as HTMLInputElement | null;
  const mobileInput = document.getElementById(
    'navbarSearchMobile'
  ) as HTMLInputElement | null;

  let debounceTimer: ReturnType<typeof setTimeout>;

  function navigateToSearch(query: string) {
    const encoded = encodeURIComponent(query);
    history.pushState({}, '', `/search?q=${encoded}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value.trim();

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      if (value.length > 0) {
        navigateToSearch(value);
      }
    }, 300);
  }

  if (desktopInput) desktopInput.addEventListener('input', handleInput);
  if (mobileInput) mobileInput.addEventListener('input', handleInput);

  // On page load, set input values if URL has a query
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q')?.trim() || '';
  if (initialQuery.length > 0) {
    if (desktopInput) desktopInput.value = initialQuery;
    if (mobileInput) mobileInput.value = initialQuery;
  }
}
