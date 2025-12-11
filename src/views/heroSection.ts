export function HeroSection(): string {
  return `
  <section class="relative w-full h-[95dvh] mb-15 sm:mb-25 mt-14 lg:mt-20 flex items-center justify-center overflow-hidden 
  bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-700 text-white">

    <!-- Decorative floating circles - repositioned for better balance -->
    <div class="absolute top-[-50px] left-[-50px] w-52 h-52 bg-purple-500/30 rounded-full 
         animate-pulse mix-blend-multiply filter blur-2xl"></div>

    <div class="absolute bottom-[-70px] right-[-40px] w-64 h-64 bg-pink-400/25 rounded-full 
         animate-spin-slow mix-blend-multiply filter blur-2xl"></div>

  <div class="absolute top-1/2 sm:top-1/4 right-10 w-44 h-44 
     bg-indigo-300/40 rounded-full 
     animate-float-slow filter blur-md brightness-110"></div>


    <div class="absolute bottom-1/3 left-16 w-24 h-24 bg-purple-300/20 rounded-full 
         animate-bounce-slow mix-blend-multiply filter blur-lg"></div>

    <!-- Floating small accent dots -->
    <div class="absolute top-1/7  sm:top-1/6 left-1/6 w-7 h-7 md:w-15 md:h-15 bg-yellow-400 rounded-full animate-bounce-slow"></div>
    <div class="absolute  bottom-1/9 right-1/2 w-6 h-6 md:w-12 md:h-12 bg-green-300 rounded-full animate-bounce-slow delay-500"></div>
    <div class="absolute top-1/2 sm:top-1/3 right-1/7 sm:right-1/6 w-4 h-4 md:w-8 md:h-8 bg-white/80 rounded-full animate-bounce-slow delay-1000"></div>

    <!-- Hero content -->
    <div class="relative z-10 flex flex-col items-center text-center px-6">
      <h1 class="text-2xl sm:text-5xl font-bold leading-tight 
                 drop-shadow-[0_5px_15px_rgba(0,0,0,0.45)]">
      🎯 Bid on Items You Love <br class="hidden sm:block"> <h2 class="text-2xl sm:text-4xl font-bold mb-6 text-yellow-300">Anytime. Anywhere.</h2>
      </h1>

      <p class="text-sm sm:text-xl max-w-3xl font-normal mb-10 text-white/90 drop-shadow">
        Discover rare items, participate in live auctions, and place bids confidently from anywhere.
      </p>

      <div class="flex flex-col sm:flex-row gap-6">
        <a href="#listItems"
           class="px-5 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white text-indigo-700 font-bold shadow-xl 
           hover:scale-105 transform transition-all hover:shadow-2xl">
          Browse Auctions
        </a>

        <a href="/login"
           class="sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-white text-white font-bold shadow-xl 
           hover:bg-white/20 hover:scale-105 transition-all">
          Login to Bid
        </a>
      </div>

      <!-- Scroll down -->
      <div class="mt-20 animate-bounce">
        <a href="#listItems" id="viewlist" class="flex flex-col items-center text-white/80 hover:text-white">
          <span class="text-sm sm:text-base mb-2">Scroll Down</span>
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>

    </div>
  </section>
  `
}
