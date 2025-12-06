import { describe, it, vi, expect, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { LoginView } from '../views/login';
import { loginUser, fetchApiKey } from '../api/client';
import { fetchProfile } from '../api/profile';
import { getLocalItem, getUser } from '../utils/storage';
import { navigateTo } from '../router';
import { showToast } from '../utils/toast';

// Mock all dependencies
vi.mock('../api/client', () => ({
  loginUser: vi.fn(),
  fetchApiKey: vi.fn(),
}));

vi.mock('../api/profile', () => ({
  fetchProfile: vi.fn(),
}));

vi.mock('../utils/storage', () => ({
  getLocalItem: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock('../router', () => ({
  navigateTo: vi.fn(),
}));

vi.mock('../utils/toast', () => ({
  showToast: vi.fn(),
}));

vi.mock('../utils/overlay', () => ({
  showLoadingOverlay: vi.fn(),
  hideLoadingOverlay: vi.fn(),
}));

describe('LoginView', () => {
  let root: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    root = document.createElement('div');
    document.body.appendChild(root);

    vi.clearAllMocks();
  });

  it('renders login form correctly', async () => {
    await LoginView(root);

    expect(root.querySelector('#loginForm')).toBeTruthy();
    expect(root.querySelector('#email')).toBeTruthy();
    expect(root.querySelector('#password')).toBeTruthy();
    expect(root.querySelector('#submitBtn')).toBeTruthy();
  });

  it('calls loginUser and navigates on successful login', async () => {
    (loginUser as Mock).mockResolvedValueOnce({});
    (getLocalItem as Mock).mockReturnValueOnce('dummy-token');
    (getUser as Mock).mockReturnValueOnce('testUser');
    (fetchProfile as Mock).mockResolvedValueOnce({ username: 'testUser' });

    await LoginView(root);

    const emailInput = root.querySelector<HTMLInputElement>('#email')!;
    const passwordInput = root.querySelector<HTMLInputElement>('#password')!;
    const form = root.querySelector<HTMLFormElement>('#loginForm')!;

    emailInput.value = 'test@example.com';
    passwordInput.value = 'password123';

    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    await new Promise((r) => setTimeout(r, 1600));

    expect(loginUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(fetchApiKey).toHaveBeenCalledWith('dummy-token');
    expect(fetchProfile).toHaveBeenCalledWith('testUser');
    expect(showToast).toHaveBeenCalledWith(
      'success',
      expect.stringContaining('successfully logged in')
    );
    expect(navigateTo).toHaveBeenCalledWith('/home');
  });

  it('shows error when loginUser fails', async () => {
    (loginUser as Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

    await LoginView(root);

    const emailInput = root.querySelector<HTMLInputElement>('#email')!;
    const passwordInput = root.querySelector<HTMLInputElement>('#password')!;
    const form = root.querySelector<HTMLFormElement>('#loginForm')!;
    const formError = root.querySelector<HTMLDivElement>('#formError')!;

    emailInput.value = 'wrong@example.com';
    passwordInput.value = 'wrongpass';

    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );

    await new Promise((r) => setTimeout(r, 1000));

    expect(formError.textContent).toBe('Invalid credentials');
    expect(formError.classList.contains('hidden')).toBe(false);
    expect(showToast).toHaveBeenCalledWith(
      'error',
      expect.stringContaining('Login failed')
    );
  });
});
