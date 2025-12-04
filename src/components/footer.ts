export function renderFooter(): string {
  const year = new Date().getFullYear();
  return `
    <footer class="relative bg-gray-800 text-gray-300 border-t border-gray-700 shadow-inner">
      <div class="container mx-auto px-6 py-8 sm:pt-12 pb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          <!-- Brand / Description -->
          <div class="text-left md:text-center">
            <p class="text-xl sm:text-2xl font-bold text-white">
              Auction <span class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">House</span>
            </p>
            <p class="mt-2 text-sm sm:text-base text-gray-300">
              Discover, bid, and win exclusive items in our trusted online auction marketplace.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="text-left md:text-center">
            <h3 class="text-base sm:text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul class="space-y-2 text-sm sm:text-base">
              <li><a href="/" class="hover:text-indigo-500 transition-colors">Home</a></li>
              <li><a href="/login" class="hover:text-indigo-500 transition-colors">Login</a></li>
              <li><a href="/register" class="hover:text-indigo-500 transition-colors">Register</a></li>
            </ul>
          </div>

          <!-- Support / Company Info -->
          <div class="text-left md:text-center">
            <h3 class="text-base sm:text-lg font-semibold text-white mb-4">Support</h3>
            <ul class="space-y-2 text-sm sm:text-base">
              <li><a href="/about" class="hover:text-indigo-500 transition-colors">About Us</a></li>
              <li><a href="/privacy-policy" class="hover:text-indigo-500 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms-condition" class="hover:text-indigo-500 transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          <!-- Contact & Social Media -->
          <div class="text-left md:text-center">
            <h3 class="text-base sm:text-lg font-semibold text-white mb-4">Contact Us</h3>
            <p class="text-sm sm:text-base text-gray-300">Noroff 123, 0587 Oslo</p>
            <p class="text-sm sm:text-base text-gray-300 mt-1">+47 123 45 678</p>
            <p class="text-sm sm:text-base text-gray-300 mt-1">nirraj03327@stud.noroff.no</p>

            <!-- Social Media -->
            <div class="flex justify-start md:justify-center gap-4 mt-4 text-gray-300">
              <a href="https://facebook.com" target="_blank" class="hover:text-indigo-500 text-xl sm:text-2xl">
                <i class="fa-brands fa-square-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" class="hover:text-indigo-500 text-xl sm:text-2xl">
                <i class="fa-brands fa-square-twitter"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" class="hover:text-indigo-500 text-xl sm:text-2xl">
                <i class="fa-brands fa-linkedin"></i>
              </a>
            </div>
          </div>

        </div>

        <!-- Divider -->
        <div class="mt-10 border-t border-gray-700 pt-6 text-center text-sm sm:text-base text-gray-400">
          <p>&copy; ${year} Auction SPA. All rights reserved. Design and built by 
            <a href="https://www.linkedin.com/in/nirushan-rajamanoharan/" target="_blank" rel="noopener noreferrer" 
               class="font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">NIRUSH.</a>
          </p>
        </div>
      </div>

      <!-- Subtle top glow -->
      <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent"></div>
    </footer>
  `;
}
