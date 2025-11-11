import { loginUser, fetchApiKey } from '../api/client.js';
import { getLocalItem } from '../utils/storage.js';

function template(): string {
  return `
    <section class=" flex justify-center pt-35">
      <div class="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-200">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
            Auction House
          </h1>
          <p class="mt-2 text-gray-500 text-base sm:text-lg">
            Sign in to access exclusive auctions and bids
          </p>
        </div>

        <!-- Form -->
        <form id="loginForm" class="space-y-6" novalidate>
          <!-- Email -->
          <div class="relative">
            <input
              type="email"
              id="email"
              name="email"
              placeholder=" "
              required
              class="peer w-full rounded-xl border border-gray-300 bg-gray-50 px-4 pt-5 pb-2 leading-[2.2] text-gray-900 placeholder-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition text-base sm:text-lg"
            />
            <label
              for="email"
              class="absolute left-4 top-2.5 text-gray-400 text-xs sm:text-base transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-gray-600 peer-focus:text-sm"
            >
              Email
            </label>
            <p id="emailError" class="mt-1 text-xs sm:text-sm md:text-sm text-red-500 hidden"></p>
          </div>

          <!-- Password -->
          <div class="relative">
            <input
              type="password"
              id="password"
              name="password"
              placeholder=" "
              required
              class="peer w-full rounded-xl border border-gray-300 bg-gray-50 px-4 leading-[2.2] pt-5 pb-2 text-gray-900 placeholder-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition text-sm sm:text-base "
            />
            <label
              for="password"
              class="absolute left-4 top-2.5 text-gray-400 text-xs sm:text-base transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-gray-600 peer-focus:text-sm"
            >
              Password
            </label>
            <p id="passwordError" class="mt-1 text-xs sm:text-sm md:text-sm text-red-500 hidden"></p>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            id="submitBtn"
            class="w-full rounded-xl bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 px-4 py-3 font-bold text-white shadow-lg hover:scale-105 transform transition duration-300 disabled:opacity-50 cursor-pointer text-sm sm:text-base md:text-base cursor-pointer"
          >
            Login
          </button>

          <!-- Form Error -->
          <div id="formError" class="hidden rounded-md border border-red-200 bg-red-50 p-3 text-xs sm:text-sm md:text-sm text-red-700"></div>
        </form>

        <!-- Footer -->
        <p class="mt-8 text-center text-sm md:text-base text-gray-500">
          Don’t have an account?
          <a href="/register" class="font-semibold text-indigo-500 hover:text-indigo-400">Register</a>
        </p>
      </div>
    </section>
  `;
}

export async function LoginView(root: HTMLElement): Promise<void> {
  root.innerHTML = template();

  // Form elements
  const form = root.querySelector<HTMLFormElement>('#loginForm')!;
  const submitBtn = root.querySelector<HTMLButtonElement>('#submitBtn')!;
  const formError = root.querySelector<HTMLDivElement>('#formError')!;
  const emailEl = root.querySelector<HTMLInputElement>('#email')!;
  const passwordEl = root.querySelector<HTMLInputElement>('#password')!;

  root.querySelector<HTMLParagraphElement>('#passwordError')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // ... your existing validation ...

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      await loginUser({
        email: emailEl.value.trim(),
        password: passwordEl.value,
      });

      // Optional: create per-user API key once
      const accessToken = getLocalItem<string>('accessToken');
      if (accessToken) {
        try {
          await fetchApiKey(accessToken);
        } catch {}
      }

      window.location.hash = '/';
    } catch (err) {
      formError.textContent = (err as Error).message;
      formError.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  });
}
