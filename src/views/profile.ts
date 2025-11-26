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
import { navigateTo, router } from '../router';

import { showToast } from '../utils/toast';
import { showLoadingOverlay, hideLoadingOverlay } from '../utils/overlay';

import { listingCard } from '../views/home';
import { startCountdowns } from '../utils/startCountdowns';
import { showConfirmModal } from '../utils/confirmModal';

// Helper for query selectors
function qs<T extends HTMLElement>(
  selector: string,
  parent: HTMLElement
): T | null {
  return parent.querySelector<T>(selector);
}

// -------------------------------
// Templates
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
          class="mt-1 w-full rounded border  border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
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
    class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base md:text-base cursor-pointer bg-white shadow-sm focus:ring-2 focus:ring-indigo-400" />

  <!-- Calendar popup -->
<div id="calendarPopup"
     class="absolute left-1/2 top-full mt-2 -translate-x-1/2 bg-white/90 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-2xl p-4 hidden z-50 w-[320px] max-w-[90vw] sm:w-[320px] transition-transform scale-95 opacity-0 origin-top">

  <div class="flex justify-between items-center mb-3">
    <button type="button" id="prevMonth" class="px-3 py-1 rounded-lg hover:bg-indigo-100 transition cursor-pointer">&lt;</button>
    <span id="monthYear" class="font-semibold text-gray-800"></span>
    <button type="button" id="nextMonth" class="px-3 py-1 rounded-lg hover:bg-indigo-100 transition cursor-pointer">&gt;</button>
  </div>

  <div id="calendarDays" class="grid grid-cols-7 gap-1 text-center text-gray-700"></div>

  <!-- Modern Time Selector -->
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

export function listingsSectionTemplate(
  listings: Listing[],
  currentUserName?: string
): string {
  if (!listings.length) {
    return `<p class="text-center text-gray-500">No listings found.</p>`;
  }

  return `
    <section class="pt-10 pb-12 space-y-10 container mx-auto">
      <header class="flex justify-between mb-1">
        <h2 class="text-lg sm:text-2xl font-bold text-gray-800">🛒 Your Listings</h2>
        <span class="text-base sm:text-lg font-bold text-gray-800">${
          listings.length
        } total</span>
      </header>

      <p class="text-gray-500 text-base md:text-lg">Manage your auctions and bids here</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${listings
          .map((listing) => listingCard(listing, currentUserName))
          .join('')}
      </div>
    </section>
  `;
}

function bidsSectionTemplate(bids: Bid[]): string {
  if (!bids.length) {
    return `<p class="text-sm text-gray-600">No bids yet.</p>`;
  }

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
  const avatarUrl =
    profile.avatar?.url ?? 'https://via.placeholder.com/120?text=Avatar';
  const bannerUrl =
    profile.banner?.url ?? 'https://via.placeholder.com/1200x300?text=Banner';

  return `
   <section class="mt-16 pb-12 space-y-10 container mx-auto px-6">

  <!-- Banner -->
  <div class="relative rounded-2xl shadow-lg">
    <img src="${bannerUrl}" alt="${profile.banner?.alt ?? 'Profile banner'}"
      class="w-full h-[15rem] sm:h-[20rem] object-cover object-center brightness-90 transition-transform" />
    <div class="absolute bottom-[-215px] sm:bottom-[-170px] w-full z-20 flex flex-col sm:flex-row items-start sm:justify-between sm:items-center px-5 sm:px-10 gap-4">

      <div class="flex flex-col items-start gap-4">
        <img src="${avatarUrl}" alt="${profile.avatar?.alt ?? profile.name}"
          class="h-30 w-30 md:h-34 md:w-34 rounded-full border-4 border-white shadow-md object-cover" />

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

  <!-- Stats -->
  <div class="grid grid-cols-2 gap-5 lg:grid-cols-4 mt-60">
    <div class="rounded-md sm:rounded-xl bg-indigo-500 p-2 sm:p-4 text-white shadow-lg">Credits: <strong>${
      profile.credits
    }</strong></div>
    <div class="rounded-md sm:rounded-xl bg-orange-800 p-2 sm:p-4 text-white shadow-lg">Listings: <strong>${
      listings.length
    }</strong></div>
    <div class="rounded-md sm:rounded-xl bg-pink-500 p-2 sm:p-4 text-white shadow-lg">Bids: <strong>${
      bids.length
    }</strong></div>
    <div class="rounded-md sm:rounded-xl bg-yellow-600 p-2 sm:p-4 text-white shadow-lg">
      Value: <strong>${listings.reduce(
        (acc, l) => acc + (l.price ?? 0),
        0
      )}</strong>
    </div>
  </div>

  <div class="space-y-8">

    <!-- Profile Edit Form -->
    <div id="profileFormContainer" class="hidden">
      ${profileFormTemplate(profile)}
    </div>

   <!-- Create Listing Form and Button -->
<div id="createListingFormContainer" class="hidden">
  ${createListingFormTemplate()}
</div>

<button id="createListingBtn"
  class="w-full rounded-md sm:rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 cursor-pointer
         text-sm sm:text-base md:text-lg">
  Create New Listing
</button>


    <!-- Listings Section -->
    <section class="">
      <div id="profileListingsContainer">
        ${listingsSectionTemplate(listings, profile.name)}
      </div>
    </section>

    <!-- Recent Bids Section -->
    <section class="">
      <header class="flex justify-between mb-1">
        <h2 class="text-xl font-semibold">Recent bids</h2>
        <span class="text-sm text-gray-600">${bids.length}</span>
      </header>
      ${bidsSectionTemplate(bids)}
    </section>

  </div>

</section>

  `;
}

// -------------------------------
// MAIN VIEW
// -------------------------------
export async function ProfileView(root: HTMLElement): Promise<void> {
  const userName = getUser();
  if (!userName) return navigateTo('/login');

  // Show global overlay
  showLoadingOverlay({ message: 'Loading your profile...' });

  try {
    // Fetch profile data + listings + bids
    const [profile, listings, bids] = await Promise.all([
      fetchProfile(userName),
      fetchProfileListings(userName),
      fetchProfileBids(userName),
    ]);

    // Save auth info
    saveAuth(localStorage.getItem('accessToken') ?? '', profile, undefined);

    // Render profile page
    root.innerHTML = profileTemplate(profile, listings, bids);

    // Start countdowns for listings
    startCountdowns(listings);

    // Attach handlers for profile actions
    attachProfileHandlers(root, profile);
    attachDeleteListingHandlers(root, profile);
  } catch (err) {
    root.innerHTML = `
      <div class="mt-20 p-4 bg-red-50 border border-red-200 text-red-700">
        ${(err as Error).message}
      </div>
    `;
  } finally {
    // Hide overlay only after API + DOM is ready
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

    // Validation
    if (!title || !endsAtValue) {
      listingMessage!.textContent = 'Title and end date are required.';
      listingMessage!.className = 'text-sm text-red-600';
      listingMessage!.classList.remove('hidden');
      submitBtn!.disabled = false;
      hideLoadingOverlay();
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

      showToast('success', '🎉 Listing created successfully!');
      createListingForm.reset();

      // Hide form and reset button
      createListingFormContainer?.classList.add('hidden');
      createListingBtn!.textContent = 'Create New Listing';
      createListingBtn!.classList.replace('bg-gray-600', 'bg-emerald-600');

      setTimeout(() => {
        hideLoadingOverlay();
        router();
      }, 900);
    } catch (err) {
      listingMessage!.textContent = (err as Error).message;
      listingMessage!.className = 'text-sm text-red-600';
      listingMessage!.classList.remove('hidden');
      showToast('error', '❌ Create new post failed.');
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
