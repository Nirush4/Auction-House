export function renderFooter(): string {
  const year = new Date().getFullYear();
  return `
    <div class="border-t border-gray-200 bg-white">
      <div class="container mx-auto px-4 py-6 text-sm text-gray-600">
        <p>&copy; ${year} Noroff Auction SPA. All rights reserved.</p>
      </div>
    </div>
  `;
}
