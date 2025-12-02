export function renderFooter(): string {
  const year = new Date().getFullYear();
  return `
    <footer class="relative bg-white/60 backdrop-blur-xl border-t border-gray-200 shadow-inner">
      <div class="container mx-auto px-6 py-6 text-center">
        <!-- Gradient line -->
        <div class="mx-auto mb-6 h-[2px] w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"></div>

        <!-- Brand / Description -->
        <p class="text-lg sm:text-xl font-semibold text-gray-800">
          Auction <span class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">House</span>
        </p>

        <p class="mt-2 text-sm sm:text-base text-gray-500">
          Discover, bid, and win exclusive items in our trusted online auction marketplace.
        </p>

        <!-- Links -->
        <div class="flex justify-center gap-6 mt-6 text-sm">
          <a href="/" class="text-gray-600 hover:text-indigo-500 transition-colors sm:text-base">Home</a>
          <a href="/login" class="text-gray-600 hover:text-indigo-500 transition-colors sm:text-base">Login</a>
          <a href="/register" class="text-gray-600 hover:text-indigo-500 transition-colors sm:text-base">Register</a>
          <a href="privacy-policy" class="text-gray-600 hover:text-indigo-500 transition-colors sm:text-base">  Privacy Policy</a>
        </div>

        <!-- Divider -->
        <div class="mt-8 border-t border-gray-200 pt-4">
          <p class="text-sm ext-gray-500">&copy; ${year} Noroff Auction SPA. All rights reserved. Made with ❤️ by <a href="https://www.linkedin.com/in/nirushan-rajamanoharan/" target="_blank" 
    rel="noopener noreferrer" 
    class="font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"> NIRUSH. </a></p>
        </div>
      </div>

      <!-- Subtle top glow -->
      <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent"></div>
    </footer>
  `;
}
