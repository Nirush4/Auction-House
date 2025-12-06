import { describe, it, vi, expect, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { RegisterView } from '../views/register'
import { registerUser } from '../api/client'
import { showToast } from '../utils/toast'

vi.mock('../api/client', () => ({
  registerUser: vi.fn(),
}))

vi.mock('../router', () => ({
  navigateTo: vi.fn(),
}))

vi.mock('../utils/toast', () => ({
  showToast: vi.fn(),
}))

describe('RegisterView', () => {
  let root: HTMLElement

  beforeEach(() => {
    document.body.innerHTML = ''
    root = document.createElement('div')
    document.body.appendChild(root)
    vi.clearAllMocks()
  })

  it('renders registration form correctly', async () => {
    await RegisterView(root)

    expect(root.querySelector('#registerForm')).toBeTruthy()
    expect(root.querySelector('#name')).toBeTruthy()
    expect(root.querySelector('#email')).toBeTruthy()
    expect(root.querySelector('#password')).toBeTruthy()
    expect(root.querySelector('#avatarUrl')).toBeTruthy()
    expect(root.querySelector('#submitBtn')).toBeTruthy()
  })

  it('calls registerUser and navigates on successful registration', async () => {
    await RegisterView(root)

    // Spy on setTimeout
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')

    ;(registerUser as Mock).mockResolvedValueOnce({})

    const nameInput = root.querySelector<HTMLInputElement>('#name')!
    const emailInput = root.querySelector<HTMLInputElement>('#email')!
    const passwordInput = root.querySelector<HTMLInputElement>('#password')!
    const avatarInput = root.querySelector<HTMLInputElement>('#avatarUrl')!
    const form = root.querySelector<HTMLFormElement>('#registerForm')!

    nameInput.value = 'Test User'
    emailInput.value = 'test@stud.noroff.no'
    passwordInput.value = 'password123'
    avatarInput.value = 'https://avatar.url/img.png'

    await form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    )

    // Wait for async code
    await new Promise((r) => setTimeout(r, 10))

    expect(registerUser).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@stud.noroff.no',
      password: 'password123',
      avatar: { url: 'https://avatar.url/img.png', alt: "Test User's avatar" },
    })

    expect(showToast).toHaveBeenCalledWith(
      'success',
      expect.stringContaining('Registration successful')
    )

    // Check that redirect was scheduled
    expect(setTimeoutSpy).toHaveBeenCalled()

    // Clean up spy
    setTimeoutSpy.mockRestore()
  })

  it('shows error when registerUser fails', async () => {
    await RegisterView(root)

    ;(registerUser as Mock).mockRejectedValueOnce(
      new Error('Email already taken')
    )

    const nameInput = root.querySelector<HTMLInputElement>('#name')!
    const emailInput = root.querySelector<HTMLInputElement>('#email')!
    const passwordInput = root.querySelector<HTMLInputElement>('#password')!
    const form = root.querySelector<HTMLFormElement>('#registerForm')!
    const formError = root.querySelector<HTMLDivElement>('#formError')!

    nameInput.value = 'Test User'
    emailInput.value = 'test@stud.noroff.no'
    passwordInput.value = 'password123'

    await form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    )

    await new Promise((r) => setTimeout(r, 10))

    expect(formError.textContent).toBe('Email already taken')
    expect(formError.classList.contains('hidden')).toBe(false)
    expect(showToast).toHaveBeenCalledWith('error', 'Email already taken')
  })

  it('shows validation errors for invalid input', async () => {
    await RegisterView(root)

    const form = root.querySelector<HTMLFormElement>('#registerForm')!
    const formError = root.querySelector<HTMLDivElement>('#formError')!
    const submitBtn = root.querySelector<HTMLButtonElement>('#submitBtn')!

    // Submit empty form
    await form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    )

    expect(formError.textContent).toBe('❌ Username is required.')
    expect(formError.classList.contains('hidden')).toBe(false)
    expect(submitBtn.disabled).toBe(false)

    // Fill name but invalid email
    const nameInput = root.querySelector<HTMLInputElement>('#name')!
    const emailInput = root.querySelector<HTMLInputElement>('#email')!
    nameInput.value = 'Test User'
    emailInput.value = 'invalid-email'

    await form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    )

    expect(formError.textContent).toBe(
      '❌ Invalid email. Please use your @stud.noroff.no email.'
    )
  })
})
