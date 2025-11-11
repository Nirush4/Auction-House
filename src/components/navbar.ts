import { isAuthenticated, getUser } from '../utils/storage.js';
import type { Profile } from '../types/index.js';

export function renderNavbar(): string {
  const authed = isAuthenticated();
  const user = getUser<Profile | null>();
  const username = user?.name ?? '';

  return `
    <nav class="bg-white/80 backdrop-blur border-b border-gray-200">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2 font-semibold text-xl">
          <span class="text-indigo-600">Noroff</span> Auction
        </a>
        <div class="flex items-center gap-3">
          <a class="px-3 py-1.5 rounded hover:bg-gray-100" href="/">Home</a>
          <a class="px-3 py-1.5 rounded hover:bg-gray-100" href="/search">Search</a>
          ${
            authed
              ? `
            <a class="px-3 py-1.5 rounded hover:bg-gray-100" href="/create">Create</a>
            <a class="px-3 py-1.5 rounded hover:bg-gray-100" href="/profile">${
              username || 'Profile'
            }</a>
            <button id="logoutBtn" class="px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-gray-800">Logout</button>
          `
              : `
            <a class="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-500" href="/login">Login</a>
            <a class="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100" href="/register">Register</a>
          `
          }
        </div>
      </div>
    </nav>
  `;
}
