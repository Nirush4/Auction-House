import {
  getListing,
  deleteListing,
  placeBid,
  updateListing,
} from '../api/listings.js';
import { getUser } from '../utils/storage.js';
import type { Listing, Bid, Profile } from '../types/index.js';
import { navigateTo, router } from '../router.js';

function listingTemplate(
  listing: Listing,
  currentUser: Profile | null
): string {
  const isOwner = currentUser?.name === listing.seller?.name;
  const heroImage =
    listing.media?.[0]?.url ??
    'https://via.placeholder.com/800x400?text=No+image';
  const ends = new Date(listing.endsAt);
  const hasEnded = ends <= new Date();

  return `
    <article class="space-y-8">
      <section class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <img src="${heroImage}" alt="${
    listing.media?.[0]?.alt ?? listing.title
  }" class="h-64 w-full object-cover" />
        <div class="space-y-6 p-6">
          <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 class="text-2xl font-semibold">${listing.title}</h1>
              <p class="text-sm text-gray-500">Listing ID: ${listing.id}</p>
            </div>
            ${
              listing.seller
                ? `<div class="rounded border border-gray-200 px-4 py-3 text-sm">
                    <p class="font-medium">Seller</p>
                    <p>${listing.seller.name}</p>
                  </div>`
                : ''
            }
          </header>

          <p class="text-gray-700">${
            listing.description ?? 'No description provided.'
          }</p>

          ${
            listing.media && listing.media.length > 1
              ? `<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  ${listing.media
                    .map(
                      (img) => `
                    <img src="${img.url}" alt="${
                        img.alt ?? listing.title
                      }" class="aspect-square rounded object-cover border border-gray-200" />`
                    )
                    .join('')}
                </div>`
              : ''
          }

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-lg border border-gray-200 p-4">
              <p class="${
                hasEnded ? 'text-red-600' : 'text-emerald-600'
              } font-semibold">
                ${hasEnded ? 'Ended' : 'Active'} – ${ends.toLocaleString()}
              </p>
              <p class="text-sm text-gray-600">Bids: ${
                listing.bids?.length ?? listing._count?.bids ?? 0
              }</p>
            </div>
            ${
              isOwner
                ? `<div class="rounded-lg border border-gray-200 p-4">
                    <p class="font-semibold text-gray-700">Owner actions</p>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <button id="editListingBtn" class="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">Edit</button>
                      <button id="deleteListingBtn" class="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500">Delete</button>
                    </div>
                  </div>`
                : `<form id="bidForm" class="space-y-3 rounded-lg border border-gray-200 p-4 ${
                    hasEnded ? 'opacity-60 pointer-events-none' : ''
                  }">
                    <p class="font-semibold text-gray-700">Place a bid</p>
                    <input id="bidAmount" type="number" min="1" step="1" class="w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none" placeholder="Enter amount" required />
                    <button type="submit" class="w-full rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500">Bid now</button>
                    <p id="bidMessage" class="hidden text-sm"></p>
                  </form>`
            }
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-gray-200 bg-white p-6">
        <header class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Bid history</h2>
          <span class="text-sm text-gray-600">${
            listing.bids?.length ?? 0
          } total</span>
        </header>
        ${
          listing.bids && listing.bids.length
            ? `<ul class="space-y-3">
                ${listing.bids
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.created).getTime() -
                      new Date(a.created).getTime()
                  )
                  .map(renderBid)
                  .join('')}
              </ul>`
            : `<p class="text-sm text-gray-600">Be the first to bid.</p>`
        }
      </section>

      ${
        currentUser?.name === listing.seller?.name
          ? editDrawerTemplate(listing)
          : ''
      }
    </article>
  `;
}

function editDrawerTemplate(listing: Listing): string {
  const mediaUrls = listing.media?.map((m) => m.url).join(', ') ?? '';
  const tags = listing.tags?.join(', ') ?? '';
  const endsAt = new Date(listing.endsAt).toISOString().slice(0, 16);

  return `
    <dialog id="editListingDialog" class="modal">
      <form method="dialog" class="modal-box max-w-3xl space-y-4">
        <h3 class="text-xl font-semibold">Edit listing</h3>
        <label class="block text-sm font-medium">
          Title
          <input id="editTitle" value="${
            listing.title
          }" required class="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none" />
        </label>
        <label class="block text-sm font-medium">
          Description
          <textarea id="editDescription" rows="4" class="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none">${
            listing.description ?? ''
          }</textarea>
        </label>
        <label class="block text-sm font-medium">
          Image URLs (comma separated)
          <input id="editMedia" value="${mediaUrls}" class="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none" />
        </label>
        <label class="block text-sm font-medium">
          Tags (comma separated)
          <input id="editTags" value="${tags}" class="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none" />
        </label>
        <label class="block text-sm font-medium">
          Ends at
          <input id="editEndsAt" type="datetime-local" value="${endsAt}" required class="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none" />
        </label>
        <div class="flex justify-end gap-3 pt-4">
          <button type="button" id="closeEditDialog" class="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
          <button id="submitEditBtn" class="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">Save changes</button>
        </div>
        <p id="editMessage" class="hidden text-sm"></p>
      </form>
    </dialog>
  `;
}

function renderBid(bid: Bid): string {
  const created = new Date(bid.created).toLocaleString();
  return `
    <li class="rounded border border-gray-200 p-4">
      <p class="font-semibold">${
        bid.bidderName ?? bid.bidder?.name ?? 'Anonymous'
      }</p>
      <p class="text-gray-700">Amount: ${bid.amount}</p>
      <p class="text-xs text-gray-500">${created}</p>
    </li>
  `;
}

export async function ListingDetailsView(
  root: HTMLElement,
  params: { id: string }
): Promise<void> {
  const currentUser = getUser();
  root.innerHTML = `
    <div class="flex justify-center py-16">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-500"></div>
    </div>
  `;

  try {
    const listing = await getListing(params.id);
    root.innerHTML = listingTemplate(
      listing,
      currentUser as unknown as Profile | null
    );
    attachHandlers(root, listing, currentUser as unknown as Profile | null);
  } catch (err) {
    root.innerHTML = `
      <div class="rounded border border-red-200 bg-red-50 p-4 text-red-700">
        ${(err as Error).message}
      </div>
    `;
  }
}

function attachHandlers(
  root: HTMLElement,
  listing: Listing,
  currentUser: Profile | null
) {
  const deleteBtn = root.querySelector<HTMLButtonElement>('#deleteListingBtn');
  const editBtn = root.querySelector<HTMLButtonElement>('#editListingBtn');
  const dialog = root.querySelector<HTMLDialogElement>('#editListingDialog');
  const closeDialogBtn =
    root.querySelector<HTMLButtonElement>('#closeEditDialog');
  const submitEditBtn = root.querySelector<HTMLButtonElement>('#submitEditBtn');
  const editMessage = root.querySelector<HTMLParagraphElement>('#editMessage');

  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const confirmation = confirm(
        'Delete this listing? This cannot be undone.'
      );
      if (!confirmation) return;
      try {
        await deleteListing(listing.id);
        window.location.hash = '/profile';
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }

  if (editBtn && dialog) {
    editBtn.addEventListener('click', () => dialog.showModal());
  }

  if (closeDialogBtn && dialog) {
    closeDialogBtn.addEventListener('click', () => dialog.close());
  }

  if (submitEditBtn && dialog && editMessage) {
    submitEditBtn.addEventListener('click', async (event) => {
      event.preventDefault();

      const title = (
        root.querySelector<HTMLInputElement>('#editTitle')?.value ?? ''
      ).trim();
      const description = (
        root.querySelector<HTMLTextAreaElement>('#editDescription')?.value ?? ''
      ).trim();
      const mediaRaw = (
        root.querySelector<HTMLInputElement>('#editMedia')?.value ?? ''
      ).trim();
      const tagsRaw = (
        root.querySelector<HTMLInputElement>('#editTags')?.value ?? ''
      ).trim();
      const endsAtValue =
        root.querySelector<HTMLInputElement>('#editEndsAt')?.value;

      editMessage.classList.add('hidden');

      if (!title || !endsAtValue) {
        editMessage.textContent = 'Title and end date are required.';
        editMessage.className = 'text-sm text-red-600';
        editMessage.classList.remove('hidden');
        return;
      }

      try {
        await updateListing(listing.id, {
          title,
          description,
          media: mediaRaw
            ? mediaRaw
                .split(',')
                .map((url) => url.trim())
                .filter(Boolean)
                .map((url) => ({ url }))
            : undefined,
          tags: tagsRaw
            ? tagsRaw
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
            : undefined,
          endsAt: new Date(endsAtValue).toISOString(),
        });

        editMessage.textContent = 'Listing updated.';
        editMessage.className = 'text-sm text-emerald-600';
        editMessage.classList.remove('hidden');
        await router();
        dialog.close();
      } catch (err) {
        editMessage.textContent = (err as Error).message;
        editMessage.className = 'text-sm text-red-600';
        editMessage.classList.remove('hidden');
      }
    });
  }

  const bidForm = root.querySelector<HTMLFormElement>('#bidForm');
  const bidMessage = root.querySelector<HTMLParagraphElement>('#bidMessage');
  const bidInput = root.querySelector<HTMLInputElement>('#bidAmount');

  if (bidForm && bidMessage && bidInput) {
    bidForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!currentUser) {
        navigateTo('/profile');

        return;
      }

      const amount = Number(bidInput.value);
      bidMessage.classList.add('hidden');

      if (!Number.isFinite(amount) || amount <= 0) {
        bidMessage.textContent = 'Enter a valid bid amount.';
        bidMessage.className = 'text-sm text-red-600';
        bidMessage.classList.remove('hidden');
        return;
      }

      try {
        await placeBid(listing.id, { amount });
        bidMessage.textContent = 'Bid placed!';
        bidMessage.className = 'text-sm text-emerald-600';
        bidMessage.classList.remove('hidden');
        bidForm.reset();
        await router();
      } catch (err) {
        bidMessage.textContent = (err as Error).message;
        bidMessage.className = 'text-sm text-red-600';
        bidMessage.classList.remove('hidden');
      }
    });
  }
}
