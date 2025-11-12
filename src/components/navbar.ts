import { isAuthenticated, getUser, clearAuth } from '../utils/storage.js';
import type { Profile } from '../types/index.js';

export function renderNavbar(): string {
  const authed = isAuthenticated();
  const user = getUser<Profile | null>();
  const username =
    typeof user?.name === 'string' && user.name.trim() ? user.name.trim() : '';

  return `
    <nav class="fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-5 py-4 flex items-center justify-between">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <span class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Auction
          </span>
          <span class="text-gray-800">House</span>
        </a>

        <!-- Hamburger (Mobile) -->
        <button id="menuBtn" class="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[6px] group cursor-pointer" aria-label="Toggle Menu">
          <span class="block w-6 h-[2px] bg-gray-800 rounded transition-all duration-300 origin-center"></span>
          <span class="block w-6 h-[2px] bg-gray-800 rounded transition-all duration-300 origin-center"></span>
          <span class="block w-6 h-[2px] bg-gray-800 rounded transition-all duration-300 origin-center"></span>
        </button>

        <!-- Desktop Menu -->
        <div id="desktopMenu" class="hidden md:flex items-center gap-2">
          <a href="/" class="px-4 py-2 rounded-xl font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 transition-all">Home</a>
          <a href="/search" class="px-4 py-2 rounded-xl font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 transition-all">Search</a>
          ${
            authed
              ? `
              <a href="/create" class="px-4 py-2 rounded-xl font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 transition-all">Create</a>
              <a id="navbarProfile" href="/profile" class="px-4 py-2 rounded-xl font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 transition-all">
                Hei, ${username || 'Profile'}
              </a>
              <button id="logoutBtn" class="ml-2 px-5 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer">Logout</button>
            `
              : `
              <a href="/login" class="px-5 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md hover:shadow-lg hover:scale-105 transition-all">Login</a>
              <a href="/register" class="px-5 py-2 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:bg-gray-200 hover:shadow-sm transition-all">Register</a>
            `
          }
        </div>
      </div>

      <!-- Mobile Menu -->
      <div id="mobileMenu" class="md:hidden max-h-0 overflow-hidden transition-all duration-500 bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-inner px-5">
        <div class="flex flex-col space-y-2 py-4">
          <a href="/" class="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition">Home</a>
          <a href="/search" class="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition">Search</a>
          ${
            authed
              ? `
              <a href="/create" class="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition">Create</a>
              <a id="mobileProfile" href="/profile" class="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition">
                Hei, ${username || 'Profile'}
              </a>
              <button id="mobileLogoutBtn" class="mt-2 w-full text-left px-3 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-md transition cursor-pointer">Logout</button>
            `
              : `
              <a href="/login" class="block px-3 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-md transition">Login</a>
              <a href="/register" class="block px-3 py-2 rounded-lg font-semibold text-gray-700 border border-gray-300 hover:bg-gray-200 transition">Register</a>
            `
          }
        </div>
      </div>
    </nav>
  `;
}

export function setupNavbarActions() {
  const logoutBtn = document.getElementById('logoutBtn');
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

  function handleLogout() {
    clearAuth();
    window.location.hash = '/login';
  }

  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
}

// Call this after login/register to update the navbar dynamically
export function updateNavbarUser() {
  const user = getUser<Profile | null>();
  const username = user?.name ?? '';
  const navbarProfile = document.getElementById('navbarProfile');
  const mobileProfile = document.getElementById('mobileProfile');

  if (navbarProfile)
    navbarProfile.textContent = `Hei, ${username || 'Profile'}`;
  if (mobileProfile)
    mobileProfile.textContent = `Hei, ${username || 'Profile'}`;
}
