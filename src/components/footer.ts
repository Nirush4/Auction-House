import { getUser } from './navbar'

export function renderFooter(): string {
  const year = new Date().getFullYear()
  const user = getUser()

  return `
    <footer class="relative bg-gray-900 text-gray-300 border-t border-gray-800 shadow-inner">

      <!-- Subscribe Section Styled -->
      ${
        !user
          ? `<div id="subscribe-section" class="mt-12 sm:mt-20 max-6 mx-6 sm:max-w-5xl sm:mx-auto rounded-2xl bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 p-6 sm:p-10 border border-indigo-700 shadow-md">
              <h2 class="text-xl sm:text-3xl md:text-4xl font-serif font-extrabold text-white mb-2 sm:mb-3 leading-snug">
                Stay Updated on Premium Auctions
              </h2>
              <p class="text-pink-200 mb-6 sm:mb-8 max-w-full sm:max-w-xl text-sm sm:text-base">
                Subscribe now and join <span class="font-semibold">thousands of collectors</span> receiving weekly curated auction alerts.
              </p>

              <form id="subscribe-form" class="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full">
                <input
                  type="email"
                  id="subscribe-email"
                  placeholder="your.email@stud.noroff.no"
                  aria-label="Email address"
                  required
                  class="flex-grow rounded-lg text-sm sm:text-base border border-gray-700 bg-gray-800 px-4 py-3 sm:px-6 sm:py-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:indigo-pink-400 transition w-full sm:w-auto"
                />
                <button
                  type="submit"
                  class="flex items-center justify-center gap-2 sm:gap-3 bg-white cursor-pointer hover:bg-white/90 active:bg-pink-700 rounded-lg px-4 py-3 sm:px-8 sm:py-4 font-semibold text-gray-900 text-sm sm:text-base shadow-sm transition-shadow w-full sm:w-auto"
                >
                  <i class="fa-solid fa-bell"></i><span>Subscribe</span>
                </button>
              </form>

              <p id="subscribe-message" class="mt-3 sm:mt-4 min-h-[1.5rem] px-3 sm:px-4 py-2 rounded text-sm font-medium transition-all duration-300 hidden text-white"></p>

              <p class="text-white/90 mt-2 text-xs sm:text-sm opacity-70">Unsubscribe anytime. We respect your privacy.</p>
            </div>`
          : ''
      }

      <!-- Footer Links / Contact Info -->
      <div class="container mx-auto px-6 py-12 sm:pt-16 sm:pb-10">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-12">
          <!-- Brand / Description -->
          <div class="text-left md:text-left">
            <p class="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
              Auction <span class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">House</span>
            </p>
            <p class="mt-2 text-sm sm:text-base md:text-lg text-gray-400 leading-relaxed max-w-sm">
              Discover rare items and participate in exclusive online auctions curated for collectors worldwide.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="text-left mt-8 sm:mt-0">
            <h3 class="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-5 tracking-wide">Quick Links</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base text-left">
              <li><a href="/" class="hover:text-indigo-500 transition-colors duration-300">Home</a></li>
              <li><a href="/login" class="hover:text-indigo-500 transition-colors duration-300">Login</a></li>
              <li><a href="/register" class="hover:text-indigo-500 transition-colors duration-300">Register</a></li>
            </ul>
          </div>

          <!-- Support / Company Info -->
          <div class="text-left mt-8 sm:mt-0">
            <h3 class="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-5 tracking-wide">Support</h3>
            <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base text-left">
              <li><a href="/about" class="hover:text-indigo-500 transition-colors duration-300">About Us</a></li>
              <li><a href="/privacy-policy" class="hover:text-indigo-500 transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="/terms-condition" class="hover:text-indigo-500 transition-colors duration-300">Terms & Conditions</a></li>
            </ul>
          </div>

          <!-- Contact & Social Media -->
          <div class="text-left mt-8 sm:mt-0">
            <h3 class="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-5 tracking-wide">Contact Us</h3>
            <p class="text-sm sm:text-base md:text-base text-gray-400 leading-relaxed">
              Noroff 123, 0587 Oslo<br />
              +47 123 45 678<br />
              nirraj03327@stud.noroff.no
            </p>

            <div class="flex justify-start gap-4 sm:gap-6 mt-4 text-gray-400 text-2xl">
              <a href="https://facebook.com" target="_blank" class="hover:text-indigo-500 transition-colors duration-300">
                <i class="fa-brands fa-square-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" class="hover:text-indigo-500 transition-colors duration-300">
                <i class="fa-brands fa-square-twitter"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" class="hover:text-indigo-500 transition-colors duration-300">
                <i class="fa-brands fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="mt-12 sm:mt-16 border-t border-indigo-700 pt-6 text-center text-sm sm:text-base text-gray-400 select-none">
          <p>&copy; ${year} Auction House. All rights reserved. Designed by 
            <a href="https://www.linkedin.com/in/nirushan-rajamanoharan/" target="_blank" rel="noopener noreferrer" class="font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">NIRUSH.</a>
          </p>
        </div>
      </div>

      <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
    </footer>
  `
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById(
    'subscribe-form'
  ) as HTMLFormElement | null
  const emailInput = document.getElementById(
    'subscribe-email'
  ) as HTMLInputElement | null
  const messageEl = document.getElementById(
    'subscribe-message'
  ) as HTMLParagraphElement | null
  const subscribeButton = form?.querySelector(
    'button'
  ) as HTMLButtonElement | null

  if (!form || !emailInput || !messageEl || !subscribeButton) return

  const validateEmail = (email: string) =>
    /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email)

  form.addEventListener('submit', (e: Event) => {
    e.preventDefault()

    const email = emailInput.value.trim()
    messageEl.className =
      'mt-4 min-h-[1.5rem] px-4 py-2 rounded text-sm font-medium transition-all duration-300'
    messageEl.classList.add('hidden')

    if (!validateEmail(email)) {
      messageEl.textContent = 'Please enter a valid email address.'
      messageEl.classList.add('bg-red-600', 'text-white')
      messageEl.classList.remove('hidden')
      messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    subscribeButton.disabled = true
    subscribeButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Subscribing...`

    setTimeout(() => {
      messageEl.textContent =
        'Thank you for subscribing! You will receive alerts soon.'
      messageEl.classList.remove('bg-red-600')
      messageEl.classList.add('bg-green-600', 'text-white')
      messageEl.classList.remove('hidden')

      subscribeButton.disabled = false
      subscribeButton.innerHTML = `<i class="fa-solid fa-bell"></i> Subscribe to Alerts`

      form.reset()
      messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' })

      setTimeout(() => {
        messageEl.classList.add('hidden')
      }, 5000)
    }, 1500)
  })
})
