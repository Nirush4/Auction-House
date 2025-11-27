import { getListing, updateListing } from '../api/listings';
import { showToast } from '../utils/toast';
import { showLoadingOverlay, hideLoadingOverlay } from '../utils/overlay';

export async function openEditListingModal(listingId: string) {
  showLoadingOverlay({ message: 'Loading listing...' });

  try {
    const listing = await getListing(listingId);
    hideLoadingOverlay();

    // Create modal container
    const modal = document.createElement('div');
    modal.className =
      'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4';

    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-12 shadow-xl">
        <form id="editListingForm" class="space-y-4 rounded-lg">

          <header>
            <h2 class="text-lg sm:text-xl font-bold">Edit Listing</h2>
            <p class="text-sm sm:text-base md:text-lg text-gray-600">
              Update your listing details below.
            </p>
          </header>

          <label class="block text-sm sm:text-base md:text-base font-medium text-gray-700">
            Title
            <input id="listingTitle" type="text" required
              class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm sm:text-base md:text-base"/>
          </label>

          <label class="block text-sm sm:text-base md:text-base font-medium text-gray-700">
            Description
            <textarea id="listingDescription" rows="3"
              class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm sm:text-base md:text-base"></textarea>
          </label>

          <label class="block text-sm sm:text-base md:text-base font-medium text-gray-700">
            Image URL (optional)
            <input id="listingImageUrl" type="url"
              class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm sm:text-base md:text-base"/>
          </label>

          <label class="block text-sm sm:text-base md:text-base font-medium text-gray-700">
            Tags (comma separated)
            <input id="listingTags" type="text"
              class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm sm:text-base md:text-base"/>
          </label>

          <label class="block text-sm sm:text-base md:text-base font-medium text-gray-700 relative">
            Ends at
            <input id="listingEndsAt" type="text" readonly disabled
              class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 
                     text-sm sm:text-base md:text-base bg-gray-100 text-gray-500 cursor-not-allowed"/>
            <div id="endsAtDisabledOverlay" class="absolute inset-0 cursor-not-allowed"></div>
          </label>

          <div class="flex gap-3 pt-2">
            <button type="submit" id="listingSubmitBtn"
              class="flex-1 rounded sm:rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 flex justify-center items-center gap-2 text-sm sm:text-base md:text-base cursor-pointer">
              <span class="submitText">Save Changes</span>
              <span class="loadingSpinner hidden h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            </button>

            <button type="button" id="listingCancelBtn"
              class="flex-1 rounded sm:rounded-lg bg-gray-300 px-4 py-2 font-medium text-gray-800 hover:bg-gray-200 text-sm sm:text-base md:text-base cursor-pointer">
              Cancel
            </button>
          </div>

          <p id="listingMessage" class="hidden text-sm sm:text-base md:text-base"></p>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Set input values programmatically
    modal.querySelector<HTMLInputElement>('#listingTitle')!.value =
      listing.title ?? '';
    modal.querySelector<HTMLTextAreaElement>('#listingDescription')!.value =
      listing.description ?? '';
    modal.querySelector<HTMLInputElement>('#listingImageUrl')!.value =
      listing.media?.[0]?.url ?? '';
    modal.querySelector<HTMLInputElement>('#listingTags')!.value = (
      listing.tags ?? []
    ).join(', ');

    // Display Month, Year, and Time for "Ends at"
    const endsAtDate = new Date(listing.endsAt);
    modal.querySelector<HTMLInputElement>(
      '#listingEndsAt'
    )!.value = `${endsAtDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}, ${endsAtDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;

    // Toast for disabled date field
    modal
      .querySelector('#endsAtDisabledOverlay')
      ?.addEventListener('click', () => {
        showToast(
          'error',
          'End date cannot be changed after the listing is created.'
        );
      });

    // Cancel button closes modal
    modal
      .querySelector('#listingCancelBtn')
      ?.addEventListener('click', () => modal.remove());

    // Form submit
    modal
      .querySelector('#editListingForm')
      ?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title =
          modal.querySelector<HTMLInputElement>('#listingTitle')!.value;
        const description = modal.querySelector<HTMLTextAreaElement>(
          '#listingDescription'
        )!.value;
        const imageUrl =
          modal.querySelector<HTMLInputElement>('#listingImageUrl')!.value;
        const tags = modal
          .querySelector<HTMLInputElement>('#listingTags')!
          .value.split(',')
          .map((t) => t.trim())
          .filter(Boolean);

        const updatedPayload: any = { title, description, tags };
        if (imageUrl) {
          updatedPayload.media = [{ url: imageUrl, alt: title }];
        }

        showLoadingOverlay({ message: 'Updating listing...' });

        try {
          await updateListing(listingId, updatedPayload);

          hideLoadingOverlay();
          modal.remove();

          showToast('success', 'Listing updated successfully!');
          location.reload();
        } catch (err) {
          hideLoadingOverlay();
          showToast('error', (err as Error).message);
        }
      });
  } catch (err) {
    hideLoadingOverlay();
    showToast('error', (err as Error).message);
  }
}
