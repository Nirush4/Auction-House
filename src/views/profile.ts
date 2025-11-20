import {
  fetchProfile,
  updateProfile,
  fetchProfileListings,
  fetchProfileBids,
} from '../api/profile';
import { createListing } from '../api/listings';
import { getUser, saveAuth } from '../utils/storage';
import type { Profile, Listing, Bid } from '../types/index';
import { navigateTo, router } from '../router';
import { showToast } from '../utils/toast';

function qs<T extends HTMLElement>(
  selector: string,
  parent: HTMLElement
): T | null {
  return parent.querySelector<T>(selector);
}

// --- Templates ---
function profileFormTemplate(profile: Profile): string {
  return `
    <form id="profileForm" class="space-y-4 rounded-lg border border-gray-200 bg-white p-6">

      <header>
        <h2 class="text-lg font-semibold">Profile details</h2>
        <p class="text-sm text-gray-600">Update your bio, avatar and banner.</p>
      </header>

      <label class="block text-sm font-medium text-gray-700">
        Bio
        <textarea id="bio"
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          rows="3"
        >${profile.bio ?? ''}</textarea>
      </label>

      <label class="block text-sm font-medium text-gray-700">
        Avatar URL
        <input id="avatarUrl" type="url"
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          value="${profile.avatar?.url ?? ''}"
        />
      </label>

      <label class="block text-sm font-medium text-gray-700">
        Avatar alt text
        <input id="avatarAlt" type="text"
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          value="${profile.avatar?.alt ?? ''}"
        />
      </label>

      <label class="block text-sm font-medium text-gray-700">
        Banner URL
        <input id="bannerUrl" type="url"
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          value="${profile.banner?.url ?? ''}"
        />
      </label>

      <label class="block text-sm font-medium text-gray-700">
        Banner alt text
        <input id="bannerAlt" type="text"
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          value="${profile.banner?.alt ?? ''}"
        />
      </label>

      <!-- BUTTON ROW -->
      <div class="flex gap-3 pt-2">

        <!-- Save button -->
        <button type="submit" id="profileSubmitBtn"
          class="flex-1 rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer">
          <span class="submitText">Save changes</span>
          <span class="loadingSpinner hidden h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        </button>

        <!-- Cancel button -->
        <button type="button" id="profileCancelBtn"
          class="flex-1 rounded bg-gray-300 px-4 py-2 font-medium text-gray-800 hover:bg-gray-200 transition cursor-pointer">
          Cancel
        </button>

      </div>

      <p id="profileMessage" class="hidden text-sm"></p>
    </form>
  `;
}

function createListingFormTemplate(): string {
  return `
    <form id="createListingForm" class="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <header>
        <h2 class="text-lg font-semibold">Create new listing</h2>
        <p class="text-sm text-gray-600">Add images and choose an end time (minimum 1 hour ahead).</p>
      </header>

      <label class="block text-sm font-medium text-gray-700">
        Title
        <input id="listingTitle" type="text" required class="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </label>

      <label class="block text-sm font-medium text-gray-700">
        Description
        <textarea id="listingDescription" rows="3" class="mt-1 w-full rounded border border-gray-300 px-3 py-2"></textarea>
      </label>

      <label class="block text-sm font-medium text-gray-700">
        Image URL (optional)
        <input id="listingImageUrl" type="url" class="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </label>

      <label class="block text-sm font-medium text-gray-700">
        Tags (comma separated)
        <input id="listingTags" type="text" class="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </label>

      <label class="block text-sm font-medium text-gray-700">
        Ends at
        <input id="listingEndsAt" type="datetime-local" required class="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
      </label>

      <button type="submit" class="w-full rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
        Publish listing
      </button>

      <p id="listingMessage" class="hidden text-sm"></p>
    </form>
  `;
}

function listingsSectionTemplate(listings: Listing[]): string {
  if (listings.length === 0) {
    return `<p class="text-sm text-gray-600">No listings yet.</p>`;
  }
  return `
    <ul class="space-y-3">
      ${listings
        .map(
          (listing) => `
        <li class="rounded border border-gray-200 p-4 hover:border-indigo-300">
          <a href="#/listing/${
            listing.id
          }" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 class="font-medium">${listing.title}</h3>
              <p class="text-sm text-gray-600 line-clamp-2">${
                listing.description ?? ''
              }</p>
            </div>
            <div class="text-right text-sm text-gray-500">
              <p>Bids: ${listing._count?.bids ?? listing.bids?.length ?? 0}</p>
              <p>Ends: ${new Date(listing.endsAt).toLocaleString()}</p>
            </div>
          </a>
        </li>`
        )
        .join('')}
    </ul>
  `;
}

function bidsSectionTemplate(bids: Bid[]): string {
  if (bids.length === 0)
    return `<p class="text-sm text-gray-600">No bids yet.</p>`;
  return `
    <ul class="space-y-3">
      ${bids
        .slice(0, 5)
        .map(
          (bid) => `
        <li class="rounded border border-gray-200 p-4">
          <p class="font-medium">${bid.listing?.title ?? 'Listing'}</p>
          <p class="text-sm text-gray-600">Amount: ${bid.amount}</p>
          <p class="text-xs text-gray-500">Placed: ${new Date(
            bid.created
          ).toLocaleString()}</p>
        </li>`
        )
        .join('')}
    </ul>
  `;
}

function profileTemplate(
  profile: Profile,
  listings: Listing[],
  bids: Bid[]
): string {
  const avatar =
    profile.avatar?.url ?? 'https://via.placeholder.com/120?text=Avatar';
  const banner =
    profile.banner?.url ?? 'https://via.placeholder.com/1200x300?text=Banner';

  return `
  <section class="space-y-10 font-sans mt-10 md:mt-12">

    <!-- Banner -->
    <div class="relative rounded-2xl shadow-lg">
      <img src="${banner}" alt="${profile.banner?.alt ?? 'Profile banner'}"
        class="h-60 sm:h-100 w-full object-cover brightness-90 transition-transform duration-500 hover:scale-105" />

      <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

      <div class="absolute bottom-[-215px] sm:bottom-[-170px] w-full z-20 flex flex-col sm:flex-row items-start sm:justify-between sm:items-center px-5 sm:px-10 gap-4">

        <div class="flex flex-col items-start gap-4">
          <img src="${avatar}" alt="${profile.avatar?.alt ?? profile.name}"
            class="h-30 w-30 md:h-34 md:w-34 rounded-full border-4 border-white shadow-md object-cover" />

          <div class="text-black drop-shadow-md">
            <h1 class="text-xl md:text-2xl font-medium">${profile.name}</h1>
            <p class="text-base text-gray-500">${profile.email}</p>
            <p id="bioDisplay" class="text-base mt-1 opacity-80 font-bold">${
              profile.bio ?? 'No bio yet.'
            }</p>
          </div>
        </div>

        <button id="editProfileBtn"
          class="rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 transition h-fit cursor-pointer">
          Edit Profile
        </button>

      </div>
    </div>

    <!-- Stats -->
<div class="grid grid-cols-2 gap-8 lg:grid-cols-4 mt-60 sm:mt-50">

  <div class="rounded-xl bg-indigo-500 p-3 sm:p-5 text-base text-white shadow-lg
              transition-all duration-300 transform hover:scale-[1.03] hover:shadow-2xl hover:brightness-110">
    Credits: <strong class="text-base">${profile.credits}</strong>
  </div>

  <div class="rounded-xl bg-emerald-500 p-3 sm:p-5 text-base text-white shadow-lg
              transition-all duration-300 transform hover:scale-[1.03] hover:shadow-2xl hover:brightness-110">
    Listings: <strong class="text-base">${listings.length}</strong>
  </div>

  <div class="rounded-xl bg-pink-500 p-3 sm:p-5 text-base text-white shadow-lg
              transition-all duration-300 transform hover:scale-[1.03] hover:shadow-2xl hover:brightness-110">
    Bids: <strong class="text-base">${bids.length}</strong>
  </div>

  <div class="rounded-xl bg-yellow-600 p-3 sm:p-5 text-base text-white shadow-lg
              transition-all duration-300 transform hover:scale-[1.03] hover:shadow-2xl hover:brightness-110">
    Value: <strong class="text-base">${listings.reduce(
      (acc, l) => acc + (l.price ?? 0),
      0
    )}</strong>
  </div>

</div>


    <div class="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">

      <div class="space-y-8">

        <!-- HIDDEN FORM -->
        <div id="profileFormContainer" class="hidden">
          ${profileFormTemplate(profile)}
        </div>

        <section class="rounded-2xl bg-white p-6 shadow-lg">
          <header class="mb-4 flex justify-between">
            <h2 class="text-xl font-semibold">Your listings</h2>
            <span class="text-sm text-gray-600">${listings.length} total</span>
          </header>
          ${listingsSectionTemplate(listings)}
        </section>
      </div>

      <div class="space-y-8">
        ${createListingFormTemplate()}

        <section class="rounded-2xl bg-white p-6 shadow-lg">
          <header class="mb-4 flex justify-between">
            <h2 class="text-xl font-semibold">Recent bids</h2>
            <span class="text-sm text-gray-600">${bids.length}</span>
          </header>
          ${bidsSectionTemplate(bids)}
        </section>
      </div>

    </div>
  </section>
  `;
}

// --- Main View ---
export async function ProfileView(root: HTMLElement): Promise<void> {
  const userName = getUser();
  if (!userName) return navigateTo('/login');

  root.innerHTML = `
    <div class="flex justify-center py-16">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-700"></div>
    </div>
  `;

  try {
    const [profile, listings, bids] = await Promise.all([
      fetchProfile(userName),
      fetchProfileListings(userName),
      fetchProfileBids(userName),
    ]);

    saveAuth(localStorage.getItem('accessToken') ?? '', profile, undefined);
    root.innerHTML = profileTemplate(profile, listings, bids);

    attachProfileHandlers(root, profile);
  } catch (err) {
    root.innerHTML = `<div class="mt-20 p-4 bg-red-50 border border-red-200 text-red-700">${
      (err as Error).message
    }</div>`;
  }
}

// --- Handlers ---
function attachProfileHandlers(root: HTMLElement, profile: Profile) {
  const profileFormContainer = qs<HTMLDivElement>(
    '#profileFormContainer',
    root
  );
  const editBtn = qs<HTMLButtonElement>('#editProfileBtn', root);

  const profileForm = qs<HTMLFormElement>('#profileForm', root);
  const profileMessage = qs<HTMLParagraphElement>('#profileMessage', root);

  const submitBtn = qs<HTMLButtonElement>('#profileSubmitBtn', root);
  const submitText = submitBtn?.querySelector('.submitText') as HTMLElement;
  const loadingSpinner = submitBtn?.querySelector(
    '.loadingSpinner'
  ) as HTMLElement;

  const cancelBtn = qs<HTMLButtonElement>('#profileCancelBtn', root);
  const bioDisplay = qs<HTMLParagraphElement>('#bioDisplay', root);

  // Toggle Edit Form
  editBtn?.addEventListener('click', () => {
    const hidden = profileFormContainer?.classList.contains('hidden');

    if (hidden) {
      profileFormContainer?.classList.remove('hidden');
      editBtn.textContent = 'Cancel Edit';
      editBtn.classList.replace('bg-indigo-600', 'bg-gray-600');

      // scroll into view
      setTimeout(() => {
        profileFormContainer?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } else {
      profileFormContainer?.classList.add('hidden');
      profileForm?.reset();
      editBtn.textContent = 'Edit Profile';
      editBtn.classList.replace('bg-gray-600', 'bg-indigo-600');
      if (profileMessage) profileMessage.classList.add('hidden');
    }
  });

  // Cancel button
  cancelBtn?.addEventListener('click', () => {
    profileFormContainer?.classList.add('hidden');
    profileForm?.reset();

    editBtn!.textContent = 'Edit Profile';
    editBtn!.classList.replace('bg-gray-600', 'bg-indigo-600');

    if (profileMessage) profileMessage.classList.add('hidden');
  });

  profileForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!submitBtn || !submitText || !loadingSpinner) return;

    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');

    const bio = qs<HTMLTextAreaElement>('#bio', root)?.value.trim() ?? '';
    const avatarUrl =
      qs<HTMLInputElement>('#avatarUrl', root)?.value.trim() ?? '';
    const avatarAlt =
      qs<HTMLInputElement>('#avatarAlt', root)?.value.trim() ?? '';
    const bannerUrl =
      qs<HTMLInputElement>('#bannerUrl', root)?.value.trim() ?? '';
    const bannerAlt =
      qs<HTMLInputElement>('#bannerAlt', root)?.value.trim() ?? '';

    try {
      const updated = await Promise.all([
        updateProfile(profile.name, {
          bio,
          avatar: avatarUrl ? { url: avatarUrl, alt: avatarAlt } : undefined,
          banner: bannerUrl ? { url: bannerUrl, alt: bannerAlt } : undefined,
        }),
        new Promise((resolve) => setTimeout(resolve, 1000)), // min loading time
      ]).then(([updatedProfile]) => updatedProfile);

      showToast('success', '✅ Profile updated successfully!');

      profileFormContainer?.classList.add('hidden');
      editBtn!.textContent = 'Edit Profile';
      editBtn!.classList.replace('bg-gray-600', 'bg-indigo-600');

      if (bioDisplay) bioDisplay.textContent = updated.bio ?? 'No bio yet.';
      const avatarImg = root.querySelector<HTMLImageElement>(
        'img[class*="rounded-full"]'
      );
      const bannerImg = root.querySelector<HTMLImageElement>(
        'img[class*="object-cover"]'
      );

      if (avatarImg && updated.avatar) {
        avatarImg.src = updated.avatar.url ?? '';
        avatarImg.alt = updated.avatar.alt ?? updated.name;
      }
      if (bannerImg && updated.banner) {
        bannerImg.src = updated.banner.url;
        bannerImg.alt = updated.banner.alt ?? 'Profile banner';
      }

      profile.bio = updated.bio;
      profile.avatar = updated.avatar;
      profile.banner = updated.banner;
      saveAuth(localStorage.getItem('accessToken') ?? '', updated, undefined);
    } catch (err) {
      showToast('error', `❌ ${(err as Error).message}`);
    } finally {
      submitBtn.disabled = false;
      submitText.classList.remove('hidden');
      loadingSpinner.classList.add('hidden');
    }
  });

  // --- Create Listing Form ---
  const createListingForm = qs<HTMLFormElement>('#createListingForm', root);
  const listingMessage = qs<HTMLParagraphElement>('#listingMessage', root);

  createListingForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitBtn =
      createListingForm.querySelector<HTMLButtonElement>('button');
    submitBtn!.disabled = true;

    const title =
      qs<HTMLInputElement>('#listingTitle', root)?.value.trim() ?? '';
    const description =
      qs<HTMLTextAreaElement>('#listingDescription', root)?.value.trim() ?? '';
    const imageUrl =
      qs<HTMLInputElement>('#listingImageUrl', root)?.value.trim() ?? '';
    const tagsRaw =
      qs<HTMLInputElement>('#listingTags', root)?.value.trim() ?? '';
    const endsAtValue = qs<HTMLInputElement>('#listingEndsAt', root)?.value;

    listingMessage!.classList.add('hidden');

    if (!title || !endsAtValue) {
      listingMessage!.textContent = 'Title and end date are required.';
      listingMessage!.className = 'text-sm text-red-600';
      listingMessage!.classList.remove('hidden');
      submitBtn!.disabled = false;
      return;
    }

    try {
      await createListing({
        title,
        description,
        tags: tagsRaw
          ? tagsRaw
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        endsAt: new Date(endsAtValue).toISOString(),
        media: imageUrl
          ? [{ url: imageUrl, alt: `${title} image` }]
          : undefined,
      });

      listingMessage!.textContent = 'Listing created!';
      listingMessage!.className = 'text-sm text-emerald-600';
      listingMessage!.classList.remove('hidden');

      createListingForm.reset();
      await router();
    } catch (err) {
      listingMessage!.textContent = (err as Error).message;
      listingMessage!.className = 'text-sm text-red-600';
      listingMessage!.classList.remove('hidden');
    } finally {
      submitBtn!.disabled = false;
    }
  });
}
