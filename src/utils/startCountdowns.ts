import type { Listing } from '../types/index';

/**
 * Start countdown for a single listing
 */
export function startCountdown(listing: Listing) {
  const countdownId = `countdown-${listing.id}`;
  const el = document.getElementById(countdownId);
  if (!el || !listing.endsAt) return;

  const endTime = new Date(listing.endsAt).getTime();

  const interval = setInterval(() => {
    const now = Date.now();
    const distance = endTime - now;

    if (distance <= 0) {
      el.textContent = '⏳ Auction ended';
      clearInterval(interval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    if (days > 0) {
      el.textContent = `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
      el.textContent = `⏳ ${hours}h ${minutes}m ${seconds}s`;
    }
  }, 1000);
}

/**
 * Start countdowns for multiple listings
 */
export function startCountdowns(listings: Listing[]) {
  listings.forEach((listing) => startCountdown(listing));
}
