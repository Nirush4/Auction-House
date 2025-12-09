import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LoginView } from './login'
import type { Profile } from '../types/index'

vi.mock('../api/client', () => ({
  loginUser: vi.fn(),
  fetchApiKey: vi.fn(),
}))

vi.mock('../router', () => ({
  navigateTo: vi.fn(),
}))

vi.mock('../utils/storage', () => ({
  getLocalItem: vi.fn(),
  getUser: vi.fn(),
}))

vi.mock('../utils/toast', () => ({
  showToast: vi.fn(),
}))

vi.mock('../utils/overlay', () => ({
  showLoadingOverlay: vi.fn(),
  hideLoadingOverlay: vi.fn(),
}))

vi.mock('../api/profile', () => ({
  fetchProfile: vi.fn(),
}))

import * as client from '../api/client'
import * as router from '../router'
import * as storage from '../utils/storage'
import * as toast from '../utils/toast'
import * as overlay from '../utils/overlay'
import * as profileApi from '../api/profile'

describe('LoginView', () => {
  let root: HTMLElement

  beforeEach(() => {
    root = document.createElement('div')
    document.body.appendChild(root)
    vi.useFakeTimers()
    vi.clearAllMocks()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    root.remove()
  })

  it('should successfully log in a user', async () => {
    const mockProfile: Profile = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      credits: 100,
      data: {},
      _count: {},
      banner: 'banner.jpg',
      bio: 'Test bio',
      avatar: { url: 'avatar.png', alt: 'John Avatar' },
    }

    ;(client.loginUser as any).mockResolvedValueOnce(undefined)
    ;(client.fetchApiKey as any).mockResolvedValueOnce(undefined)
    ;(profileApi.fetchProfile as any).mockResolvedValueOnce(mockProfile)
    ;(router.navigateTo as any).mockImplementation(() => {})
    ;(toast.showToast as any).mockImplementation(() => {})
    ;(overlay.showLoadingOverlay as any).mockImplementation(() => {})
    ;(overlay.hideLoadingOverlay as any).mockImplementation(() => {})
    ;(storage.getLocalItem as any).mockReturnValue('fakeAccessToken')
    ;(storage.getUser as any).mockReturnValue('johndoe')

    await LoginView(root)

    const emailInput = root.querySelector<HTMLInputElement>('#email')!
    const passwordInput = root.querySelector<HTMLInputElement>('#password')!
    const form = root.querySelector<HTMLFormElement>('#loginForm')!
    const submitBtn = root.querySelector<HTMLButtonElement>('#submitBtn')!

    emailInput.value = 'john@example.com'
    passwordInput.value = 'password123'

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    await vi.runAllTimersAsync()

    expect(client.loginUser).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'password123',
    })
    expect(client.fetchApiKey).toHaveBeenCalledWith('fakeAccessToken')
    expect(profileApi.fetchProfile).toHaveBeenCalledWith('johndoe')
    expect(toast.showToast).toHaveBeenCalledWith(
      'success',
      '✅ You’re successfully logged in!'
    )
    expect(router.navigateTo).toHaveBeenCalledWith('/home')
    expect(submitBtn.disabled).toBe(false)
  })

  it('should handle login failure', async () => {
    ;(client.loginUser as any).mockRejectedValueOnce(
      new Error('Invalid credentials')
    )
    ;(toast.showToast as any).mockImplementation(() => {})
    ;(overlay.showLoadingOverlay as any).mockImplementation(() => {})
    ;(overlay.hideLoadingOverlay as any).mockImplementation(() => {})

    await LoginView(root)

    const form = root.querySelector<HTMLFormElement>('#loginForm')!
    const emailInput = root.querySelector<HTMLInputElement>('#email')!
    const passwordInput = root.querySelector<HTMLInputElement>('#password')!
    const formError = root.querySelector<HTMLDivElement>('#formError')!
    const submitBtn = root.querySelector<HTMLButtonElement>('#submitBtn')!

    emailInput.value = 'wrong@example.com'
    passwordInput.value = 'wrongpassword'

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    await vi.runAllTimersAsync()

    expect(formError.textContent).toBe('Invalid credentials')
    expect(toast.showToast).toHaveBeenCalledWith('error', '❌ Login failed.')
    expect(submitBtn.disabled).toBe(false)
  })
})
