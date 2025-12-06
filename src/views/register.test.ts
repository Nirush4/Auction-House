import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RegisterView } from './register'
import * as client from '../api/client'
import * as router from '../router'
import * as toast from '../utils/toast'

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
    root = document.createElement('div')
    document.body.appendChild(root)
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    root.remove()
    vi.useRealTimers()
  })

  it('should successfully register a user', async () => {
    ;(client.registerUser as any).mockResolvedValueOnce(undefined)
    ;(toast.showToast as any).mockImplementation(() => {})
    ;(router.navigateTo as any).mockImplementation(() => {})

    await RegisterView(root)

    const nameInput = root.querySelector<HTMLInputElement>('#name')!
    const emailInput = root.querySelector<HTMLInputElement>('#email')!
    const passwordInput = root.querySelector<HTMLInputElement>('#password')!
    const avatarInput = root.querySelector<HTMLInputElement>('#avatarUrl')!
    const form = root.querySelector<HTMLFormElement>('#registerForm')!
    const submitBtn = root.querySelector<HTMLButtonElement>('#submitBtn')!

    nameInput.value = 'John Doe'
    emailInput.value = 'john@stud.noroff.no'
    passwordInput.value = 'password123'
    avatarInput.value = 'https://example.com/avatar.png'

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    // Let async timers run
    await vi.runAllTimersAsync()

    expect(client.registerUser).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@stud.noroff.no',
      password: 'password123',
      avatar: {
        url: 'https://example.com/avatar.png',
        alt: "John Doe's avatar",
      },
    })
    expect(toast.showToast).toHaveBeenCalledWith(
      'success',
      '✅ Registration successful! Redirecting to login...'
    )
    expect(router.navigateTo).toHaveBeenCalledWith('/login')
    expect(submitBtn.disabled).toBe(false)
    expect(submitBtn.textContent).toBe('Create Account')
  })

  it('should show error if email is invalid', async () => {
    await RegisterView(root)

    const nameInput = root.querySelector<HTMLInputElement>('#name')!
    const emailInput = root.querySelector<HTMLInputElement>('#email')!
    const passwordInput = root.querySelector<HTMLInputElement>('#password')!
    const form = root.querySelector<HTMLFormElement>('#registerForm')!
    const formError = root.querySelector<HTMLDivElement>('#formError')!
    const submitBtn = root.querySelector<HTMLButtonElement>('#submitBtn')!

    nameInput.value = 'John Doe'
    emailInput.value = 'john@example.com' // Invalid domain
    passwordInput.value = 'password123'

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    expect(formError.classList.contains('hidden')).toBe(false)
    expect(formError.textContent).toBe(
      '❌ Invalid email. Please use your @stud.noroff.no email.'
    )
    expect(submitBtn.disabled).toBe(false)
    expect(submitBtn.textContent).toBe('Create Account')
  })

  it('should handle registration failure', async () => {
    ;(client.registerUser as any).mockRejectedValueOnce(
      new Error('Email already exists')
    )
    ;(toast.showToast as any).mockImplementation(() => {})

    await RegisterView(root)

    const nameInput = root.querySelector<HTMLInputElement>('#name')!
    const emailInput = root.querySelector<HTMLInputElement>('#email')!
    const passwordInput = root.querySelector<HTMLInputElement>('#password')!
    const form = root.querySelector<HTMLFormElement>('#registerForm')!
    const formError = root.querySelector<HTMLDivElement>('#formError')!
    const submitBtn = root.querySelector<HTMLButtonElement>('#submitBtn')!

    nameInput.value = 'John Doe'
    emailInput.value = 'john@stud.noroff.no'
    passwordInput.value = 'password123'

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    await vi.runAllTimersAsync()

    expect(formError.classList.contains('hidden')).toBe(false)
    expect(formError.textContent).toBe('Email already exists')
    expect(toast.showToast).toHaveBeenCalledWith(
      'error',
      'Email already exists'
    )
    expect(submitBtn.disabled).toBe(false)
    expect(submitBtn.textContent).toBe('Create Account')
  })
})
