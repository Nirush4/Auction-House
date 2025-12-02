export function PrivacyPolicyView(root: HTMLElement): void {
  root.innerHTML = `
    <section class="container mx-auto px-6 mt-20 sm:mt-45 mb-12 sm:mb-30">

      <!-- Header -->
      <header class="mb-10">
        <h1 class="text-xl sm:text-3xl font-bold mb-3">Privacy Policy</h1>
        <p class="text-gray-500">Last updated: ${new Date().toLocaleDateString()}</p>
        <p class="mt-4 text-sm sm:text-lg">
          Your privacy is important to us. This Privacy Policy explains how we collect,
          use, and protect your information when you interact with our online auction
          platform.
        </p>
      </header>
      

      <!-- Section 1 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">1. Information We Collect</h2>
        <p class="text-sm sm:text-base">We collect information to provide and improve our services, ensure security,
           and comply with legal requirements.</p>

        <h3 class=" text-lg sm:text-xl font-semibold mt-6">1.1 Personal Information</h3>
        <p class="mt-2 text-sm sm:text-base">This includes information you voluntarily provide:</p>
        <ul class="list-disc ml-6 mt-3 space-y-1 text-sm sm:text-base">
          <li>Name, email address, and phone number</li>
          <li>Billing and shipping addresses</li>
          <li>Account details and user preferences</li>
          <li>Images, descriptions, or content you upload to listings</li>
        </ul>

        <h3 class="text-lg sm:text-xl font-semibold mt-6">1.2 Automatically Collected Data</h3>
        <p class="mt-2 text-sm sm:text-base">When you use our website, we automatically collect:</p>
        <ul class="list-disc ml-6 mt-3 space-y-1 text-sm sm:text-base">
          <li>IP address and approximate location</li>
          <li>Browser type, device information, and operating system</li>
          <li>Usage data such as pages viewed and time spent</li>
          <li>Cookies, session data, and unique identifiers</li>
        </ul>
      </section>

      <!-- Section 2 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
        <p class="mt-2 text-sm sm:text-base">Your information helps us deliver a secure and personalized experience.</p>
        <ul class="list-disc ml-6 mt-3 space-y-1 text-sm sm:text-base">
          <li>Create and manage your account</li>
          <li>Process bids, purchases, and payments</li>
          <li>Authenticate users and prevent fraud</li>
          <li>Provide customer support and respond to inquiries</li>
          <li>Improve website functionality, performance, and security</li>
          <li>Send updates, confirmations, and important notifications</li>
          <li>Comply with legal and regulatory requirements (GDPR, CCPA, etc.)</li>
        </ul>
      </section>

      <!-- Section 3 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">3. How We Share Information</h2>
        <p class="text-sm sm:text-base">
          We do <span class="font-semibold">not sell</span> your personal information.
          However, we may share some data in the following cases:
        </p>
        <ul class="list-disc ml-6 mt-3 space-y-1 text-sm sm:text-base">
          <li><strong>Service Providers:</strong> hosting, analytics, payment processors</li>
          <li><strong>Other Users:</strong> shipping info shared after a successful auction</li>
          <li><strong>Legal Obligations:</strong> when required by law or to protect our rights</li>
          <li><strong>Business Transfers:</strong> in case of a merger, acquisition, or restructuring</li>
        </ul>
      </section>

      <!-- Section 4 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">4. Cookies & Tracking Technologies</h2>
        <p class="text-sm sm:text-base">
          Cookies help us personalize your experience, maintain secure sessions,
          and analyze website traffic. You may disable cookies in your browser
          settings, but certain features may not function properly without them.
        </p>
      </section>

      <!-- Section 5 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">5. Your Rights</h2>
        <p class="mt-2 text-sm sm:text-base">Depending on your location, you may have the right to:</p>
        <ul class="list-disc ml-6 mt-3 space-y-1 text-sm sm:text-base">
          <li>Access and request a copy of your personal data</li>
          <li>Correct inaccurate or outdated information</li>
          <li>Delete your data (“right to be forgotten”)</li>
          <li>Restrict or object to processing</li>
          <li>Withdraw consent at any time</li>
          <li>Request data portability</li>
        </ul>
        <p class="mt-3 text-sm sm:text-base">To exercise these rights, contact us using the details below.</p>
      </section>

      <!-- Section 6 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">6. Data Retention & Security</h2>
        <p class="text-sm sm:text-base">
          We store your data only as long as necessary for legal, transactional,
          or security purposes. We use industry-standard safeguards to protect
          your information, but no online system can guarantee complete security.
        </p>
      </section>

      <!-- Section 7 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">7. Contact Us</h2>
        <p class="text-sm sm:text-base">
          If you have questions about this Privacy Policy or how your information
          is handled, please contact us:
        </p>
        <p class="mt-3 font-medium text-sm sm:text-base">
          Email: <span class="text-indigo-600">nirraj03327@stud.noroff.no</span>
        </p>
      </section>

      <!-- Footer spacing -->
      <div class="h-10"></div>

    </section>
  `;
}
