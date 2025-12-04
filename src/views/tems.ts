export function showTermsModal(onAccepted: () => void): void {
  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'termsModal';
  modal.className =
    'fixed inset-0 bg-black/50 flex items-center justify-center z-50';

  // Modal content
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-2xl p-6 sm:p-10 shadow-lg overflow-y-auto max-h-[90vh]">
      <h2 class="text-2xl font-bold mb-4">Terms and Conditions</h2>
      <p class="text-sm mb-6">
        Please read and accept our Terms and Conditions to continue using the website.
      </p>
      <div class="overflow-y-auto text-sm sm:text-base mb-6" style="max-height: 50vh;">
        <p>Welcome to [Your Auction House Name] (“Website”, “we”, “us”, or “our”). By accessing or using our Website, you agree to comply with and be bound by the following Terms and Conditions (“Terms”). If you do not agree with any part of these Terms, you must not use our Website.</p>
        <ul class="list-disc ml-6 mt-3 space-y-1">
          <li>Eligibility: You must be at least 18 years old.</li>
          <li>Account Registration: Provide accurate info and keep credentials secure.</li>
          <li>Auctions & Bidding: All bids are binding, items sold “as-is”.</li>
          <li>Payments & Fees: Full payment required for winning bids.</li>
          <li>Intellectual Property: All content owned or licensed by us.</li>
          <li>User Content: You grant us a license to display your submissions.</li>
          <li>Liability: Website provided “as-is”, we are not liable for damages.</li>
          <li>Termination: Accounts may be suspended for violations.</li>
          <li>Governing Law: [Your Country/State].</li>
        </ul>
        <p class="mt-4">
          For full Terms and Conditions, visit our 
          <a href="/terms" class="text-indigo-600 underline">Terms Page</a>.
        </p>
      </div>
      <div class="flex justify-end gap-4">
        <button id="rejectTermsBtn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Reject</button>
        <button id="acceptTermsBtn" class="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">Accept</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Button event listeners
  const acceptBtn = document.getElementById('acceptTermsBtn');
  const rejectBtn = document.getElementById('rejectTermsBtn');

  acceptBtn?.addEventListener('click', () => {
    localStorage.setItem('termsAccepted', 'true');
    modal.remove();
    onAccepted();
  });

  rejectBtn?.addEventListener('click', () => {
    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-md p-6 shadow-lg text-center">
        <p class="text-lg mb-4">
          You must accept the Terms and Conditions to use this website.
        </p>
      </div>
    `;
  });
}
