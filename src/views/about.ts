export interface AboutSection {
  title: string;
  content: string;
}

export const aboutContent: AboutSection[] = [
  {
    title: 'Our Story',
    content: `Auction House was founded with the vision of creating a trusted online marketplace where collectors,
    enthusiasts, and everyday users can discover and bid on exclusive items. From rare collectibles to high-end electronics
    and art, we bring the thrill of auctions directly to your fingertips.`,
  },
  {
    title: 'Our Mission',
    content: `Our mission is to provide a secure, transparent, and exciting online auction experience. We aim to connect
    buyers and sellers worldwide while ensuring fairness, trust, and top-notch customer service at every step.`,
  },
  {
    title: 'Our Vision',
    content: `We envision a world where everyone can access unique items and experiences through auctions.
    By leveraging technology and innovation, we strive to make online bidding accessible, fun, and rewarding for all.`,
  },
  {
    title: 'How It Works',
    content: `1. Browse Auctions: Explore our wide range of auction categories including electronics, collectibles,
    art, fashion, and vehicles.  
    2. Place Bids: Register, place your bids, and compete in real-time for exclusive items.  
    3. Win & Secure: If you win, securely complete your purchase through our platform.  
    4. Enjoy Your Items: Receive your items safely and join our community of satisfied bidders.`,
  },
  {
    title: 'Why Choose Us',
    content: `- Trusted Platform: Safe and secure online auctions with verified sellers.  
    - Wide Selection: Access to a diverse range of high-quality items.  
    - Transparent Bidding: Real-time bidding with clear rules.  
    - Excellent Support: Our team is available to assist you at every step.`,
  },
];

export function RenderAboutPage(root: HTMLElement): void {
  root.innerHTML = `
    <section class="container mx-auto px-6 pb-12 sm:pb-30 mt-20 sm:mt-45">

      <!-- Header -->
      <header class="mb-10">
        <h1 class="text-xl sm:text-3xl font-bold mb-3">About Auction House</h1>
        <p class="mt-4 text-sm sm:text-lg text-gray-500">
          Discover, bid, and win exclusive items in our trusted online auction marketplace.
        </p>
      </header>

      ${aboutContent
        .map(
          (section, index) => `
        <section class="mt-10">
          <h2 class="text-lg sm:text-2xl font-semibold mb-3">${index + 1}. ${
            section.title
          }</h2>
          <p class="text-sm sm:text-base leading-relaxed">${section.content
            .trim()
            .replace(/\n/g, '<br/>')}</p>
        </section>
      `
        )
        .join('')}
    </section>
  `;
}
