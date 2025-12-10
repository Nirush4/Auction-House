import { registerUser } from '../api/client'
import { navigateTo } from '../router'
import { showToast } from '../utils/toast'

function template(): string {
  return `
    <section class="flex justify-center pt-35 md:pt-50 px-4">
      <div class="w-full max-w-md mb-18 sm:mb-30 rounded-3xl bg-white shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-200">
        <div class="text-center mb-8">
          <h1 class="text-2xl md:text-3xl font-medium text-gray-800 tracking-tight">
            Auction House
          </h1>
          <p class="mt-2 text-gray-500 text-base sm:text-lg">
            Create your account to participate in auctions
          </p>
        </div>

        <form id="registerForm" class="space-y-8" novalidate>
          <div class="relative">
            <input type="text" id="name" placeholder=" " required class="peer w-full rounded-xl border border-gray-300 bg-gray-50 px-4 pt-5 pb-2 leading-[2.2] text-gray-900 placeholder-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition text-base sm:text-lg"/>
            <label for="name" class="absolute left-4 top-2.5 text-gray-400 text-xs sm:text-base transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-gray-600 peer-focus:text-sm">Username</label>
            <p id="nameError" class="mt-1 text-xs sm:text-sm text-red-500 hidden"></p>
          </div>

          <div class="relative">
            <input type="email" id="email" placeholder=" " required class="peer w-full rounded-xl border border-gray-300 bg-gray-50 px-4 pt-5 pb-2 leading-[2.2] text-gray-900 placeholder-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition text-base sm:text-lg"/>
            <label for="email" class="absolute left-4 top-2.5 text-gray-400 text-xs sm:text-base transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-gray-600 peer-focus:text-sm">Email</label>
            <p class="mt-1 text-gray-400 text-xs sm:text-sm">Only <strong class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">@stud.noroff.no</strong> emails are allowed to register.</p>
            <p id="emailError" class="mt-1 text-xs sm:text-sm text-red-500 hidden"></p>
          </div>

          <div class="relative">
            <input type="password" id="password" placeholder=" " required class="peer w-full rounded-xl border border-gray-300 bg-gray-50 px-4 pt-5 pb-2 leading-[2.2] text-gray-900 placeholder-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition text-base sm:text-lg"/>
            <label for="password" class="absolute left-4 top-2.5 text-gray-400 text-xs sm:text-base transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-gray-600 peer-focus:text-sm">Password</label>
            <p id="passwordError" class="mt-1 text-xs sm:text-sm text-red-500 hidden"></p>
          </div>

          <div class="relative">
            <input type="url" id="avatarUrl" placeholder=" " class="peer w-full rounded-xl border border-gray-300 bg-gray-50 px-4 pt-5 pb-2 leading-[2.2] text-gray-900 placeholder-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition text-base sm:text-lg"/>
            <label for="avatarUrl" class="absolute left-4 top-2.5 text-gray-400 text-xs sm:text-base transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-gray-600 peer-focus:text-sm">Avatar URL (optional)</label>
          </div>

          <button type="submit" id="submitBtn" class="w-full rounded-xl bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 px-4 py-3 font-bold text-white shadow-lg hover:scale-105 transform transition duration-300 disabled:opacity-50 cursor-pointer text-sm sm:text-base md:text-base">
            Create Account
          </button>

          <div id="formError" class="hidden rounded-md border border-red-200 bg-red-50 p-3 text-xs sm:text-sm md:text-sm text-red-700"></div>
        </form>

        <p class="text-center text-sm md:text-base text-gray-500">
          Already have an account?
          <a href="/login" class="font-semibold text-indigo-500 hover:text-indigo-400">Login</a>
        </p>
      </div>
    </section>
  `
}

export async function RegisterView(root: HTMLElement): Promise<void> {
  root.innerHTML = template()

  const form = root.querySelector<HTMLFormElement>('#registerForm')!
  const submitBtn = root.querySelector<HTMLButtonElement>('#submitBtn')!
  const formError = root.querySelector<HTMLDivElement>('#formError')!
  const nameEl = root.querySelector<HTMLInputElement>('#name')!
  const emailEl = root.querySelector<HTMLInputElement>('#email')!
  const passwordEl = root.querySelector<HTMLInputElement>('#password')!
  const avatarEl = root.querySelector<HTMLInputElement>('#avatarUrl')!

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    formError.classList.add('hidden')
    submitBtn.disabled = true
    submitBtn.textContent = 'Creating account...'

    const name = nameEl.value.trim()
    const email = emailEl.value.trim()
    const password = passwordEl.value
    const avatar = avatarEl.value.trim()

    if (!name) {
      formError.textContent = '❌ Username is required.'
      formError.classList.remove('hidden')
      submitBtn.disabled = false
      submitBtn.textContent = 'Create Account'
      return
    }

    if (!email) {
      formError.textContent = '❌ Email is required.'
      formError.classList.remove('hidden')
      submitBtn.disabled = false
      submitBtn.textContent = 'Create Account'
      return
    }

    if (!email.includes('@') || !email.endsWith('@stud.noroff.no')) {
      formError.textContent =
        '❌ Invalid email. Please use your @stud.noroff.no email.'
      formError.classList.remove('hidden')
      submitBtn.disabled = false
      submitBtn.textContent = 'Create Account'
      return
    }

    if (!password || password.length < 8) {
      formError.textContent =
        '❌ Password is required and must be at least 8 characters.'
      formError.classList.remove('hidden')
      submitBtn.disabled = false
      submitBtn.textContent = 'Create Account'
      return
    }

    const registerData: {
      name: string
      email: string
      password: string
      avatar?: { url: string; alt: string }
    } = {
      name,
      email,
      password,
    }
    if (avatar) {
      registerData.avatar = { url: avatar, alt: `${name}'s avatar` }
    }

    try {
      await registerUser(registerData)
      showToast(
        'success',
        '✅ Registration successful! Redirecting to login...'
      )

      setTimeout(() => {
        navigateTo('/login')
      }, 2000)
    } catch (err) {
      formError.textContent = (err as Error).message
      formError.classList.remove('hidden')
      showToast('error', (err as Error).message)
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = 'Create Account'
    }
  })
}
