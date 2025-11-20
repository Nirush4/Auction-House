import type { Listing } from '../types';

export function startCountdowns(listings: Listing[]) {
  function updateAll() {
    const now = Date.now();

    for (const listing of listings) {
      const el = document.getElementById(`countdown-${listing.id}`);
      if (!el || !listing.endsAt) continue;

      const end = new Date(listing.endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        el.textContent = '⏰ Auction ended';
        el.classList.add('text-red-600');
        continue;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      let countdownText = '';
      if (days > 0)
        countdownText = `🗓 Ends in ${days} day${days > 1 ? 's' : ''}`;
      else if (hours > 0) countdownText = `⏳ Ends in ${hours}h ${minutes}m`;
      else countdownText = `⚡ Ends in ${minutes}m ${seconds}s`;

      const exactTime = formatExactDateTime(listing.endsAt);
      el.textContent = `${countdownText} — ${exactTime}`;
    }
  }

  updateAll();
  setInterval(updateAll, 1000);
}

function formatExactDateTime(endsAt: string): string {
  const date = new Date(endsAt);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
