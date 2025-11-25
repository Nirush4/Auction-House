// src/components/ProfileCreateListing.ts

import { createListing } from '../api/listings';

export function CreateListingForm(): string {
  return `
    <section class="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 class="text-2xl font-bold mb-6">Create a New Listing</h2>
      <form id="createListingForm" class="space-y-4">

        <div>
          <label for="title" class="block font-medium mb-1">Title *</label>
          <input id="title" name="title" type="text" required
            class="w-full border px-3 py-2 rounded" />
        </div>

        <div>
          <label for="description" class="block font-medium mb-1">Description</label>
          <textarea id="description" name="description" rows="3"
            class="w-full border px-3 py-2 rounded"></textarea>
        </div>

        <div>
          <label for="tags" class="block font-medium mb-1">Tags (comma separated)</label>
          <input id="tags" name="tags" type="text"
            class="w-full border px-3 py-2 rounded" />
        </div>

        <div>
          <label for="mediaUrl" class="block font-medium mb-1">Image URL</label>
          <input id="mediaUrl" name="mediaUrl" type="url"
            placeholder="https://example.com/image.jpg"
            class="w-full border px-3 py-2 rounded" />
        </div>

        <div>
          <label for="mediaAlt" class="block font-medium mb-1">Image Alt Text</label>
          <input id="mediaAlt" name="mediaAlt" type="text"
            placeholder="Image description"
            class="w-full border px-3 py-2 rounded" />
        </div>

        <div>
          <label for="endsAt" class="block font-medium mb-1">Ends At *</label>
          <input id="endsAt" name="endsAt" type="datetime-local" required
            class="w-full border px-3 py-2 rounded" />
        </div>

        <button type="submit"
          class="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition">
          Create Listing
        </button>

        <div id="formMessage" class="mt-4 text-sm"></div>
      </form>
    </section>
  `;
}

export function setupCreateListingForm(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('#createListingForm');
  const message = root.querySelector<HTMLDivElement>('#formMessage');

  if (!form || !message) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    message.textContent = '';
    message.className = 'mt-4 text-sm';

    const formData = new FormData(form);
    const title = formData.get('title')?.toString().trim() || '';
    const description =
      formData.get('description')?.toString().trim() || undefined;
    const tagsRaw = formData.get('tags')?.toString().trim() || '';
    const mediaUrl = formData.get('mediaUrl')?.toString().trim() || undefined;
    const mediaAlt = formData.get('mediaAlt')?.toString().trim() || '';
    const endsAtRaw = formData.get('endsAt')?.toString();

    if (!title) {
      message.textContent = 'Title is required.';
      message.classList.add('text-red-600');
      return;
    }

    if (!endsAtRaw) {
      message.textContent = 'End date/time is required.';
      message.classList.add('text-red-600');
      return;
    }

    const endsAt = new Date(endsAtRaw);
    if (isNaN(endsAt.getTime())) {
      message.textContent = 'Invalid end date/time.';
      message.classList.add('text-red-600');
      return;
    }

    const tags = tagsRaw
      ? tagsRaw
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const payload = {
      title,
      description,
      tags,
      endsAt: endsAt.toISOString(),
      media: mediaUrl ? [{ url: mediaUrl, alt: mediaAlt }] : undefined,
    };

    try {
      await createListing(payload);
      message.textContent = 'Listing created successfully!';
      message.classList.add('text-green-600');
      form.reset();
      // Optional: refresh user's listings or navigate
    } catch (error) {
      message.textContent = `Error: ${(error as Error).message}`;
      message.classList.add('text-red-600');
    }
  });
}
