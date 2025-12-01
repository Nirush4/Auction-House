// ProfileView.ts — UPDATED WITH GLOBAL OVERLAY SYSTEM

import {
  fetchProfile,
  updateProfile,
  fetchProfileListings,
  fetchProfileBids,
} from '../api/profile';

import { createListing, deleteListing } from '../api/listings';
import { getUser, saveAuth } from '../utils/storage';

import type { Profile, Listing, Bid } from '../types/index';
import { navigateTo } from '../router';

import { showToast } from '../utils/toast';
import { showLoadingOverlay, hideLoadingOverlay } from '../utils/overlay';

import { listingCard } from '../views/home';
import { startCountdowns } from '../utils/startCountdowns';
import { showConfirmModal } from '../utils/confirmModal';
import { fetchProfileWinnings, winningsCard } from '../api/winnings';

// -------------------------------
// Helper
// -------------------------------
function qs<T extends HTMLElement>(
  selector: string,
  parent: HTMLElement
): T | null {
  return parent.querySelector<T>(selector);
}

// -------------------------------
// TEMPLATES
// -------------------------------
function profileFormTemplate(profile: Profile): string {
  return `
    <form id="profileForm" class="space-y-4 rounded-lg border border-gray-200 bg-white p-6 mt-6 sm:p-12 sm:py-25 sm:mt-20">

      <header>
        <h2 class="text-lg sm:text-xl font-bold">Profile details</h2>
        <p class="text-sm sm:text-base text-gray-600">Update your bio, avatar and banner.</p>
      </header>

      <label class="block font-medium text-gray-700 text-sm sm:text-base">
        Bio
        <textarea id="bio" rows="3"
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        >${profile.bio ?? ''}</textarea>
      </label>

      <label class="block text-sm sm:text-base font-medium text-gray-700">
        Avatar URL
        <input id="avatarUrl" type="url"
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          value="${profile.avatar?.url ?? ''}"
        />
      </label>

      <label class="block text-sm sm:text-base font-medium text-gray-700">
        Avatar alt text
        <input id="avatarAlt" type="text"
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          value="${profile.avatar?.alt ?? ''}"
        />
      </label>

      <label class="block text-sm sm:text-base font-medium text-gray-700">
        Banner URL
        <input id="bannerUrl" type="url"
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          value="${profile.banner?.url ?? ''}"
        />
      </label>

      <label class="block text-sm sm:text-base font-medium text-gray-700">
        Banner alt text
        <input id="bannerAlt" type="text"
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          value="${profile.banner?.alt ?? ''}"
        />
      </label>

      <div class="flex gap-3 pt-2">
        <button type="submit" id="profileSubmitBtn"
          class="flex-1 rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer">
          <span class="submitText">Save changes</span>
          <span class="loadingSpinner hidden h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        </button>

        <button type="button" id="profileCancelBtn"
          class="flex-1 rounded bg-gray-300 px-4 py-2 font-medium text-gray-800 hover:bg-gray-200 cursor-pointer">
          Cancel
        </button>
      </div>

      <p id="profileMessage" class="hidden text-sm"></p>
    </form>
  `;
}

function createListingFormTemplate(): string {
  return `
    <form id="createListingForm" class="space-y-4 rounded-lg border border-gray-200 bg-white p-6 mt-6 sm:p-12 sm:py-25 sm:mt-20">

      <header>
        <h2 class="text-lg sm:text-xl font-bold">Create New Listing</h2>
        <p class="text-sm sm:text-base md:text-lg text-gray-600">
          Add images and choose an end time (minimum 1 hour ahead).
        </p>
      </header>

      <label class="block text-sm sm:text-base md:text-base font-medium text-gray-700">
        Title
        <input id="listingTitle" type="text" required
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm sm:text-base md:text-base" />
      </label>

      <label class="block text-sm sm:text-base md:text-base font-medium text-gray-700">
        Description
        <textarea id="listingDescription" rows="3"
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm sm:text-base md:text-base"></textarea>
      </label>

      <label class="block text-sm sm:text-base md:text-base font-medium text-gray-700">
        Image URL (optional)
        <input id="listingImageUrl" type="url"
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm sm:text-base md:text-base" />
      </label>

      <label class="block text-sm sm:text-base md:text-base font-medium text-gray-700">
        Tags (comma separated)
        <input id="listingTags" type="text"
          class="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm sm:text-base md:text-base" />
      </label>

      <label class="block text-sm sm:text-base md:text-base font-medium text-gray-700 relative">
  Ends at
  <input id="listingEndsAt" type="text" placeholder="Select date & time" readonly
    class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base md:text-base cursor-pointer bg-white shadow-sm focus:ring-2 focus:ring-indigo-400" 
    aria-label="Select listing end date and time"/>

  <div id="calendarPopup"
       class="absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-white/90 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-2xl p-4 hidden z-50 w-[320px] max-w-[90vw] sm:w-[320px] transition-transform scale-95 opacity-0 origin-top">

    <div class="flex justify-between items-center mb-3">
      <button type="button" id="prevMonth" aria-label="Previous Month" class="px-3 py-1 rounded-lg hover:bg-indigo-100 transition cursor-pointer">&lt;</button>
      <span id="monthYear" class="font-semibold text-gray-800"></span>
      <button type="button" id="nextMonth" aria-label="Next Month" class="px-3 py-1 rounded-lg hover:bg-indigo-100 transition cursor-pointer">&gt;</button>
    </div>

    <div id="calendarDays" class="grid grid-cols-7 gap-1 text-center text-gray-700"></div>

    <div class="mt-3 flex justify-between items-center gap-2">
      <input type="number" id="calendarHour" min="0" max="23" placeholder="HH"
        class="w-1/2 rounded-lg border border-gray-300 px-3 py-2 shadow-inner text-center focus:ring-2 focus:ring-indigo-400 focus:outline-none"/>
      <span class="text-gray-500 font-semibold">:</span>
      <input type="number" id="calendarMinute" min="0" max="59" placeholder="MM"
        class="w-1/2 rounded-lg border border-gray-300 px-3 py-2 shadow-inner text-center focus:ring-2 focus:ring-indigo-400 focus:outline-none"/>
    </div>

    <button type="button" id="calendarSelectBtn"
            class="mt-3 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-2 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition transform cursor-pointer">
      Select Date & Time
    </button>
  </div>
</label>

      <div class="flex gap-3 pt-2">
        <button type="submit" id="listingSubmitBtn"
          class="flex-1 rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer text-sm sm:text-base md:text-base">
          <span class="submitText">Publish Listing</span>
          <span class="loadingSpinner hidden h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        </button>

        <button type="button" id="listingCancelBtn"
          class="flex-1 rounded bg-gray-300 px-4 py-2 font-medium text-gray-800 hover:bg-gray-200 cursor-pointer text-sm sm:text-base md:text-base">
          Cancel
        </button>
      </div>

      <p id="listingMessage" class="hidden text-sm sm:text-base md:text-base"></p>
    </form>
  `;
}

// -------------------------------
// LISTINGS + BIDS SECTIONS
// -------------------------------
export function listingsSectionTemplate(
  listings: Listing[],
  currentUserName?: string
): string {
  if (!listings.length)
    return `<p class="text-center text-gray-500 text-base sm:test-lg">No listings found.</p>`;

  return `
    <section class="pt-10 pb-12 space-y-10 container mx-auto">
      <header class="flex justify-between mb-1">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">🛒 Your Listings</h2>
        <span class="text-base sm:text-lg font-bold text-gray-800">${
          listings.length
        } total</span>
      </header>
      <p class="text-gray-500 text-base md:text-lg">Manage your auctions and bids here</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${listings.map((l) => listingCard(l, currentUserName)).join('')}
      </div>
    </section>
  `;
}

function bidsSectionTemplate(bids: Bid[]): string {
  if (!bids.length) {
    return `<p class="text-base sm:text-lg text-gray-600">No bids yet.</p>`;
  }

  return `
    <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      ${bids
        .slice(0, 5)
        .map((bid) => {
          const { listing } = bid;
          if (!listing) return '';

          const {
            id,
            title = 'Untitled',
            description: rawDescription = '',
            media = [],
            bids: listingBids = [],
            created,
            seller,
            tags = [],
          } = listing;

          // Fallback if seller is missing or nested differently
          const actualSeller =
            seller ??
            listing?.user ?? // sometimes seller data might be under user
            {};

          const sellerName = actualSeller?.name ?? 'Seller';
          const sellerAvatar =
            actualSeller?.avatar?.url ??
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop';
          const sellerAlt = actualSeller?.avatar?.alt ?? sellerName;

          const listingDescription = rawDescription.trim()
            ? rawDescription.trim().slice(0, 35) +
              (rawDescription.trim().length > 35 ? '…' : '')
            : 'No description provided.';

          const highestBid = listingBids.length
            ? Math.max(
                ...listingBids.map(
                  (b: { amount: any }) => Number(b.amount) || 0
                )
              )
            : 0;

          const createdDate = created
            ? new Date(created).toLocaleDateString('en-GB')
            : 'Unknown';

          const mediaUrl =
            media[0]?.url ??
            'https://images.unsplash.com/photo-1631913290783-490324506193?auto=format&fit=crop&q=80&w=800';
          const mediaAlt = media[0]?.alt ?? title;

          const category = tags[0] ?? null;

          return `
            <div class="group relative rounded-2xl border-7 border-gray-100 bg-white/60 backdrop-blur-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">

              <!-- Seller info with gradient badge -->
              <div class="flex items-center gap-3 pt-1 mx-5 my-3">
                <img src="${sellerAvatar}" alt="${sellerAlt}" class="h-8 w-8 rounded-full object-cover border" />
                <p class="text-sm sm:text-base">
                  <span class="font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                               px-2 py-1 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all">
                    ${sellerName}
                  </span>
                </p>
              </div>

              <!-- Listing image with category tag -->
              <a href="/listing/${id}">
                <div class="relative aspect-video overflow-hidden">
                  <img src="${mediaUrl}" alt="${mediaAlt}" class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity"></div>
                  ${
                    category
                      ? `<div class="absolute top-3 left-3 bg-indigo-600/90 text-white text-xs font-medium px-2 py-1 rounded shadow">
                           ${category}
                         </div>`
                      : ''
                  }
                </div>
              </a>

              <!-- Inner content following listingCard style -->
              <div class="p-5 space-y-3">
                <a href="/listing/${id}">
                  <h3 class="font-medium text-xl sm:text-lg text-gray-900 line-clamp-1 transition-colors">
                    ${title}
                  </h3>
                </a>

                <p class="text-sm sm:text-[14px] text-gray-600 line-clamp-2 leading-snug">
                  ${listingDescription}
                </p>

                <div class="flex justify-between items-center text-sm sm:text-xs text-gray-600">
                  <p class="text-gray-500 text-xs sm:text-[14px]">Created: <span class="font-medium text-gray-800">${createdDate}</span></p>
                  <p class="text-gray-700 text-xs sm:text-[14px] font-bold">
                    Highest Bid: <span class="font-bold text-indigo-600 text-lg sm:text-base">$${highestBid}</span>
                  </p>
                </div>

                <p class="text-xs sm:text-[14px] text-gray-600">
                  Your Bid: <span class="font-semibold text-indigo-600">$${
                    bid.amount
                  }</span>
                </p>

                <div class="mt-3">
                  <a href="/listing/${id}" class="w-full text-center rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 transition-colors block">
                    View Listing
                  </a>
                </div>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

// -------------------------------
// PROFILE PAGE TEMPLATE
// -------------------------------
export function profileTemplate(
  profile: Profile,
  listings: Listing[],
  bids: Bid[],
  winnings: Listing[]
): string {
  const avatarUrl =
    profile.avatar?.url ?? 'https://via.placeholder.com/120?text=Avatar';
  const bannerUrl =
    profile.banner?.url ?? 'https://via.placeholder.com/1200x300?text=Banner';

  return `
  <section class="mt-14 md:mt-28 pb-12 sm:pb-30 space-y-10 container mx-auto sm:px-6">

    <div class="relative rounded-2xl shadow-lg">
      <img src="${bannerUrl}" alt="${profile.banner?.alt ?? 'Profile banner'}"
        class="w-full h-[15rem] sm:h-[20rem] object-cover object-center brightness-90 transition-transform" />
      <div class="absolute bottom-[-215px] sm:bottom-[-170px] w-full z-20 flex flex-col sm:flex-row items-start sm:justify-between sm:items-center px-5 sm:px-10 gap-4">
        <div class="flex flex-col items-start gap-4">
          <img src="${avatarUrl}" alt="${profile.avatar?.alt ?? profile.name}"
            class="h-30 w-30 md:h-34 md:w-34 rounded-full border-4 bg-white border-white shadow-md object-cover" />
          <div class="text-black drop-shadow-md">
            <h1 class="text-xl md:text-2xl font-medium">${profile.name}</h1>
            <p class="text-base text-gray-500">${profile.email}</p>
            <p id="bioDisplay" class="text-base sm:text-lg mt-1 opacity-80 font-bold">${
              profile.bio ?? 'No bio yet.'
            }</p>
          </div>
        </div>

        <button id="editProfileBtn"
          class="rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 cursor-pointer">
          Edit Profile
        </button>
      </div>
    </div>

    <div class="grid px-6 grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-4 mt-65 sm:mt-55">
      <div class="rounded-md sm:rounded-xl bg-gray-700 p-2 sm:p-4 text-white shadow-lg">Credits: <strong>${
        profile.credits
      }</strong></div>
      <div class="rounded-md sm:rounded-xl bg-gray-600 p-2 sm:p-4 text-white shadow-lg">Listings: <strong>${
        listings.length
      }</strong></div>
      <div class="rounded-md sm:rounded-xl bg-gray-500 p-2 sm:p-4 text-white shadow-lg">Bids: <strong>${
        bids.length
      }</strong></div>
      <div class="rounded-md sm:rounded-xl bg-gray-400 p-2 sm:p-4 text-white shadow-lg">Wins: <strong>${
        winnings.length
      }</strong></div>
    </div>

    <div class="space-y-8 px-6">
      <div id="profileFormContainer" class="hidden">${profileFormTemplate(
        profile
      )}</div>
      <div id="createListingFormContainer" class="hidden">${createListingFormTemplate()}</div>

     <button id="createListingBtn"
        class="w-full flex items-center justify-center gap-2 rounded-md sm:rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 cursor-pointer
               text-sm sm:text-base md:text-lg">
  <i class="fa-solid fa-plus"></i>
  Create New Listing
</button>

      <section><div id="profileListingsContainer">${listingsSectionTemplate(
        listings,
        profile.name
      )}</div></section>

      <section class="">
        <header class="flex gap-5 align-middle mb-1">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-10">Recent bids</h2>
        </header>
        ${bidsSectionTemplate(bids)}
      </section>

      <!-- Winnings Section -->
      <section id="winningsSection" class="mt-6">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-10">Your Winnings</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${
            winnings.length > 0
              ? winnings.map((win) => winningsCard(win)).join('')
              : `<p class="text-base sm:text-lg text-gray-600">No winnings yet.</p>`
          }
        </div>
      </section>
    </div>
  </section>
  `;
}

// -------------------------------
// MAIN VIEW
// -------------------------------
export async function ProfileView(
  root: HTMLElement,
  _profileData?: any
): Promise<void> {
  const userName = getUser();
  if (!userName) return navigateTo('/login');

  showLoadingOverlay({ message: 'Loading your profile...' });

  try {
    const [profile, listings, bids, winnings] = await Promise.all([
      fetchProfile(userName),
      fetchProfileListings(userName),
      fetchProfileBids(userName),
      fetchProfileWinnings(userName),
    ]);

    saveAuth(localStorage.getItem('accessToken') ?? '', profile, undefined);

    // Pass Listing[] directly to template
    root.innerHTML = profileTemplate(profile, listings, bids, winnings);

    startCountdowns(listings);
    attachProfileHandlers(root, profile);
    attachDeleteListingHandlers(root, profile);
  } catch (err) {
    root.innerHTML = `<div class="mt-20 p-4 bg-red-50 border border-red-200 text-red-700">${
      (err as Error).message
    }</div>`;
  } finally {
    hideLoadingOverlay();
  }
}

// -------------------------------
// EVENT HANDLERS
// -------------------------------

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

  // -------------------------------
  // Edit Profile Toggle
  // -------------------------------
  editBtn?.addEventListener('click', () => {
    const hidden = profileFormContainer?.classList.contains('hidden');
    if (hidden) {
      profileFormContainer?.classList.remove('hidden');
      editBtn.textContent = 'Cancel Edit';
      editBtn.classList.replace('bg-indigo-600', 'bg-gray-600');

      profileFormContainer?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      profileFormContainer?.classList.add('hidden');
      profileForm?.reset();
      editBtn.textContent = 'Edit Profile';
      editBtn.classList.replace('bg-gray-600', 'bg-indigo-600');
      profileMessage?.classList.add('hidden');
    }
  });

  // Edit Profile Cancel
  cancelBtn?.addEventListener('click', () => {
    profileFormContainer?.classList.add('hidden');
    profileForm?.reset();
    editBtn!.textContent = 'Edit Profile';
    editBtn!.classList.replace('bg-gray-600', 'bg-indigo-600');
    profileMessage?.classList.add('hidden');
  });

  // -------------------------------
  // Profile Update Handler
  // -------------------------------
  profileForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!submitBtn || !submitText || !loadingSpinner) return;

    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');

    showLoadingOverlay({ message: 'Updating profile...' });

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
      const updated = await updateProfile(profile.name, {
        bio,
        avatar: avatarUrl ? { url: avatarUrl, alt: avatarAlt } : undefined,
        banner: bannerUrl ? { url: bannerUrl, alt: bannerAlt } : undefined,
      });

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
      hideLoadingOverlay();
      submitBtn.disabled = false;
      submitText.classList.remove('hidden');
      loadingSpinner.classList.add('hidden');
    }
  });

  // -------------------------------
  // Create Listing Elements
  // -------------------------------
  const createListingFormContainer = qs<HTMLDivElement>(
    '#createListingFormContainer',
    root
  );
  const createListingBtn = qs<HTMLButtonElement>('#createListingBtn', root);
  const createListingForm = qs<HTMLFormElement>('#createListingForm', root);
  const listingMessage = qs<HTMLParagraphElement>('#listingMessage', root);
  const listingCancelBtn = qs<HTMLButtonElement>('#listingCancelBtn', root);

  // Toggle form on Create Listing button
  createListingBtn?.addEventListener('click', () => {
    // Show the form (idempotent: if already visible, nothing breaks)
    if (createListingFormContainer?.classList.contains('hidden')) {
      createListingFormContainer.classList.remove('hidden');

      // Scroll into view smoothly
      createListingFormContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }

    // Do NOT disable the button — user can click again if needed
  });

  // Cancel button inside form
  listingCancelBtn?.addEventListener('click', () => {
    createListingFormContainer?.classList.add('hidden');
    createListingForm?.reset();
    createListingBtn!.textContent = 'Create New Listing';
    createListingBtn!.classList.replace('bg-gray-600', 'bg-emerald-600');
    listingMessage?.classList.add('hidden');
  });

  // -------------------------------
  // Create Listing Form Submission
  // -------------------------------
  createListingForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitBtn =
      createListingForm.querySelector<HTMLButtonElement>('button');

    submitBtn!.disabled = true;
    showLoadingOverlay({ message: 'Creating your listing...' });

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

    // -----------------------------
    // VALIDATION
    // -----------------------------
    if (!title || !endsAtValue) {
      listingMessage!.textContent = 'Title and end date are required.';
      listingMessage!.className = 'text-sm text-red-600';
      listingMessage!.classList.remove('hidden');
      submitBtn!.disabled = false;
      hideLoadingOverlay();
      return;
    }

    try {
      // -----------------------------
      // API CALL
      // -----------------------------
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

      // Success toast
      showToast('success', '🎉 Listing created successfully!');

      // Reset form
      createListingForm.reset();

      // Hide form UI
      createListingFormContainer?.classList.add('hidden');
      createListingBtn!.textContent = 'Create New Listing';
      createListingBtn!.classList.replace('bg-gray-600', 'bg-emerald-600');

      // -----------------------------
      // REDIRECT TO PROFILE
      // -----------------------------
      setTimeout(() => {
        hideLoadingOverlay();
        navigateTo('/profile'); // <<--- FIXED
      }, 900);
    } catch (err) {
      listingMessage!.textContent = (err as Error).message;
      listingMessage!.className = 'text-sm text-red-600';
      listingMessage!.classList.remove('hidden');

      showToast('error', '❌ Failed to create listing.');

      setTimeout(() => hideLoadingOverlay(), 800);
    } finally {
      submitBtn!.disabled = false;
    }
  });

  // -------------------------------
  // Custom Calendar for Ends At
  // -------------------------------
  const endsAtInput = qs<HTMLInputElement>('#listingEndsAt', root);
  const calendarPopup = qs<HTMLDivElement>('#calendarPopup', root);
  const calendarDays = qs<HTMLDivElement>('#calendarDays', root);
  const monthYear = qs<HTMLSpanElement>('#monthYear', root);
  const prevMonthBtn = qs<HTMLButtonElement>('#prevMonth', root);
  const nextMonthBtn = qs<HTMLButtonElement>('#nextMonth', root);

  let selectedDate: Date | null = null;
  let currentMonth: number;
  let currentYear: number;

  function initCalendar() {
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    renderCalendar(currentYear, currentMonth);
  }

  function renderCalendar(year: number, month: number) {
    if (!calendarDays || !monthYear) return;
    calendarDays.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    monthYear.textContent = `${todayMonthName(month)} ${year}`;

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      calendarDays.appendChild(emptyCell);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayBtn = document.createElement('button');
      dayBtn.type = 'button';
      dayBtn.textContent = d.toString();
      dayBtn.className = 'p-2 rounded hover:bg-indigo-100 cursor-pointer';
      dayBtn.addEventListener('click', () => {
        selectedDate = new Date(year, month, d);
        calendarDays
          .querySelectorAll('button')
          .forEach((b) => b.classList.remove('bg-indigo-200'));
        dayBtn.classList.add('bg-indigo-200');
      });
      calendarDays.appendChild(dayBtn);
    }
  }

  function todayMonthName(monthIndex: number) {
    return [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ][monthIndex];
  }

  prevMonthBtn?.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
  });

  nextMonthBtn?.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
  });

  endsAtInput?.addEventListener('click', () => {
    if (!calendarPopup) return;
    calendarPopup.classList.toggle('hidden');
    if (!calendarPopup.classList.contains('hidden')) {
      requestAnimationFrame(() => calendarPopup.classList.add('show'));
    } else {
      calendarPopup.classList.remove('show');
    }
  });

  const hourInput = qs<HTMLInputElement>('#calendarHour', root);
  const minuteInput = qs<HTMLInputElement>('#calendarMinute', root);
  const selectBtn = qs<HTMLButtonElement>('#calendarSelectBtn', root);

  // ---------------------------
  // Real-time input clamping
  // ---------------------------
  hourInput?.addEventListener('input', () => {
    if (!hourInput) return;
    let val = parseInt(hourInput.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 23) val = 23;
    hourInput.value = val.toString().slice(0, 2);
  });

  minuteInput?.addEventListener('input', () => {
    if (!minuteInput) return;
    let val = parseInt(minuteInput.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 59) val = 59;
    minuteInput.value = val.toString().slice(0, 2);
  });

  // ---------------------------
  // Set selected date on click
  // ---------------------------
  selectBtn?.addEventListener('click', () => {
    if (!selectedDate || !hourInput || !minuteInput) return;

    // Parse hour and minute
    let hour = parseInt(hourInput.value || '0', 10);
    let minute = parseInt(minuteInput.value || '0', 10);

    if (isNaN(hour) || hour < 0) hour = 0;
    if (hour > 23) hour = 23;
    if (isNaN(minute) || minute < 0) minute = 0;
    if (minute > 59) minute = 59;

    selectedDate.setHours(hour);
    selectedDate.setMinutes(minute);

    // Human-readable format: "26 Nov 2025, 23:59"
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    endsAtInput!.value = selectedDate.toLocaleString('en-US', options);

    // Animate and hide popup
    calendarPopup?.classList.add('hidden');
    calendarPopup?.classList.remove('show');
  });

  // Hide calendar if clicked outside
  document.addEventListener('click', (e) => {
    if (!calendarPopup || !endsAtInput) return;
    if (
      !(
        calendarPopup.contains(e.target as Node) ||
        endsAtInput.contains(e.target as Node)
      )
    ) {
      calendarPopup.classList.add('hidden');
    }
  });

  initCalendar();
}

export function attachDeleteListingHandlers(
  root: HTMLElement,
  _profile: Profile
) {
  const deleteButtons =
    root.querySelectorAll<HTMLButtonElement>('.deleteListingBtn');

  deleteButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const listingId = btn.dataset.listingId;
      if (!listingId) return;

      // Show confirmation modal
      const confirmed = await showConfirmModal(
        'Are you sure you want to delete this listing?'
      );

      if (!confirmed) return; // User canceled

      // Show loading overlay while deleting
      showLoadingOverlay({ message: 'Deleting listing...' });

      try {
        await deleteListing(listingId);
        showToast('success', 'Listing deleted successfully!');
        await ProfileView(root); // refresh profile view
      } catch (err) {
        showToast('error', `❌ ${(err as Error).message}`);
      } finally {
        hideLoadingOverlay();
      }
    });
  });
}
