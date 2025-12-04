import type { Listing } from '../types/index';

/**
 * Helper: updates countdown display for 1 element
 */
function updateCountdown(el: HTMLElement, endTime: number) {
  const now = Date.now();
  const diff = endTime - now;

  if (diff <= 0) {
    el.textContent = '⛔ Auction Ended';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  if (days > 0) {
    el.textContent = `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else {
    el.textContent = `⏳ ${hours}h ${minutes}m ${seconds}s`;
  }
}

/**
 * Start countdown for a single listing
 */
export function startCountdown(listing: Listing) {
  const countdownId = `countdown-${listing.id}`;
  const el = document.getElementById(countdownId);

  if (!el || !listing.endsAt) return;

  const endTime = new Date(listing.endsAt).getTime();
  const now = Date.now();

  // Auction already ended
  if (endTime <= now) {
    el.textContent = '⛔ Auction Ended';
    return;
  }

  // Initial render
  updateCountdown(el, endTime);

  // Auto update every second
  const interval = setInterval(() => {
    const now = Date.now();
    if (now >= endTime) {
      el.textContent = '⛔ Auction Ended';
      clearInterval(interval);
      return;
    }
    updateCountdown(el, endTime);
  }, 1000);
}

/**
 * Start countdowns for multiple listings
 */
export function startCountdowns(listings: Listing[]) {
  listings.forEach((listing) => startCountdown(listing));
}
