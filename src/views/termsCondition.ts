export function TermsConditionView(root: HTMLElement): void {
  root.innerHTML = `
    <section class="container mx-auto px-6 pb-12 sm:pb-30 mt-20 sm:mt-45">

      <!-- Header -->
      <header class="mb-10">
        <h1 class="text-xl sm:text-3xl font-bold mb-3">Terms and Conditions</h1>
        <p class="text-gray-500">Last updated: ${new Date().toLocaleDateString()}</p>
        <p class="mt-4 text-sm sm:text-lg">
          Welcome to Auction House. By accessing or using our website and services, 
          you agree to be bound by these Terms and Conditions. Please read them carefully. 
          If you do not agree with any part of these Terms, you must not use our website.
        </p>
      </header>

      <!-- Section 1 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">1. Eligibility</h2>
        <p class="text-sm sm:text-base">
          You must be at least 18 years of age to create an account, participate in auctions, 
          or use any of our services. By registering, you represent and warrant that you meet this requirement.
        </p>
      </section>

      <!-- Section 2 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">2. Account Registration and Security</h2>
        <p class="text-sm sm:text-base">
          When creating an account, you must provide accurate, complete, and up-to-date information. 
          You are responsible for maintaining the confidentiality of your account credentials 
          and are fully responsible for all activities that occur under your account.
        </p>
        <p class="mt-2 text-sm sm:text-base">
          You must notify us immediately of any unauthorized access or security breach. We reserve the right 
          to suspend or terminate accounts suspected of fraudulent or illegal activity.
        </p>
      </section>

      <!-- Section 3 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">3. Auctions, Bidding, and Item Listings</h2>
        <p class="text-sm sm:text-base">
          All bids placed on our platform are legally binding and final. 
          Auction items are sold "as-is" without warranties unless explicitly stated. 
          Auction House does not guarantee the authenticity, quality, or condition of items beyond the description provided.
        </p>
        <p class="mt-2 text-sm sm:text-base">
          We reserve the right to cancel, modify, or reject any bid or listing for any reason, 
          including suspected fraud, violations of law, or violation of these Terms.
        </p>
      </section>

      <!-- Section 4 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">4. Payments, Fees, and Refunds</h2>
        <p class="text-sm sm:text-base">
          Full payment must be completed within the specified timeframe for any winning bid. 
          Payment methods accepted will be displayed during checkout. Additional charges such as 
          taxes, shipping, or handling fees may apply.
        </p>
        <p class="mt-2 text-sm sm:text-base">
          Failure to pay may result in account suspension, legal action, or forfeiture of bidding privileges. 
          Refunds, if applicable, will be handled in accordance with our Refund Policy.
        </p>
      </section>

      <!-- Section 5 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">5. Intellectual Property Rights</h2>
        <p class="text-sm sm:text-base">
          All content on this website, including text, images, graphics, logos, and software, 
          is the property of Auction House or licensed to us. You may not copy, modify, reproduce, 
          distribute, or create derivative works from any content without prior written consent.
        </p>
      </section>

      <!-- Section 6 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">6. User Content and Conduct</h2>
        <p class="text-sm sm:text-base">
          By posting content, including listings, comments, or other materials, you grant Auction House 
          a non-exclusive, royalty-free, worldwide license to use, display, and distribute such content. 
          You represent that you have all necessary rights to submit the content.
        </p>
        <p class="mt-2 text-sm sm:text-base">
          Users agree not to engage in unlawful, fraudulent, offensive, or harmful behavior on the platform. 
          Violation of these rules may result in account termination or legal action.
        </p>
      </section>

      <!-- Section 7 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">7. Limitation of Liability</h2>
        <p class="text-sm sm:text-base">
          Auction House and its services are provided "as-is" without warranties of any kind. 
          We are not liable for any direct, indirect, incidental, or consequential damages 
          arising from the use of our website, including loss of profits, data, or items purchased.
        </p>
      </section>

      <!-- Section 8 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">8. Indemnification</h2>
        <p class="text-sm sm:text-base">
          You agree to indemnify, defend, and hold harmless Auction House, its affiliates, officers, 
          and employees from any claims, damages, or expenses arising from your use of the website, 
          violation of these Terms, or infringement of any rights of third parties.
        </p>
      </section>

      <!-- Section 9 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">9. Termination</h2>
        <p class="text-sm sm:text-base">
          We may suspend or terminate your account at any time for violations of these Terms, 
          fraudulent activity, or other reasons deemed appropriate. Termination does not relieve you 
          of obligations incurred prior to termination.
        </p>
      </section>

      <!-- Section 10 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">10. Governing Law and Dispute Resolution</h2>
        <p class="text-sm sm:text-base">
          These Terms are governed by the laws of [Your Country/State]. Any disputes arising from these Terms 
          shall be resolved in the competent courts of [Your Jurisdiction]. Users agree to submit to the 
          exclusive jurisdiction of these courts.
        </p>
      </section>

      <!-- Section 11 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">11. Changes to Terms</h2>
        <p class="text-sm sm:text-base">
          Auction House may revise these Terms at any time. Updates will be posted on this page with the 
          revised “Last Updated” date. Continued use of the website constitutes acceptance of the updated Terms.
        </p>
      </section>

      <!-- Section 12 -->
      <section class="mt-10">
        <h2 class="text-lg sm:text-2xl font-semibold mb-3">12. Contact Information</h2>
        <p class="text-sm sm:text-base">
          For any questions regarding these Terms, please contact our support team:
        </p>
        <p class="mt-3 font-medium text-sm sm:text-base">
          Email: <span class="text-indigo-600">nirraj03327@stud.noroff.no</span>
        </p>
      </section>

    </section>
  `
}
