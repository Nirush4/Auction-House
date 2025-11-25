import { HomeView } from './views/home';
import { LoginView } from './views/login';
import { RegisterView } from './views/register';
import { renderNavbar, setupNavbarSearch } from './components/navbar';
import { renderFooter } from './components/footer';
import { isAuthenticated } from './utils/storage';
import { logout } from './api/auth';
import { showToast } from './utils/toast';
import { ProfileView } from './views/profile';
import { showLoadingOverlay, hideLoadingOverlay } from './utils/overlay';
import { SearchView } from './views/search';

type RouteHandler = (
  root: HTMLElement,
  params: Record<string, string>
) => void | Promise<void>;

interface Route {
  path: RegExp;
  handler: RouteHandler;
  protected?: boolean;
}

export function mountNavbar() {
  const header = document.getElementById('navbar');
  if (!header) return;

  header.innerHTML = renderNavbar();

  // Logout handler with loading overlay
  async function handleLogout() {
    showLoadingOverlay({ message: 'Logging you out...' });

    try {
      await logout();
      showToast('success', '✅ You have been logged out!');
      setTimeout(() => {
        hideLoadingOverlay();
        navigateTo('/login');
      }, 1000);
    } catch (err) {
      showToast('error', '❌ Logout failed.');
      hideLoadingOverlay();
    }

    document.querySelectorAll('a[href="/create"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('/create'); // pushes state and triggers router
      });
    });
  }

  // Desktop logout button
  const logoutBtn = header.querySelector<HTMLButtonElement>('#logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // Mobile logout button
  const mobileLogoutBtn =
    header.querySelector<HTMLButtonElement>('#mobileLogoutBtn');
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

  // Mobile menu toggle
  const menuBtn = header.querySelector<HTMLButtonElement>('#menuBtn');
  const mobileMenu = header.querySelector<HTMLDivElement>('#mobileMenu');

  if (menuBtn && mobileMenu) {
    const [line1, line2, line3] =
      menuBtn.querySelectorAll<HTMLSpanElement>('span');

    menuBtn.addEventListener('click', () => {
      if (mobileMenu.classList.contains('max-h-0')) {
        mobileMenu.classList.remove('max-h-0');
        mobileMenu.classList.add('max-h-96');
      } else {
        mobileMenu.classList.add('max-h-0');
        mobileMenu.classList.remove('max-h-96');
      }

      line1.classList.toggle('rotate-45');
      line3.classList.toggle('-rotate-45');
      line2.classList.toggle('opacity-0');
      line1.classList.toggle('translate-y-1.5');
      line3.classList.toggle('-translate-y-1.5');
    });
  }
}

function mountFooter() {
  const footer = document.getElementById('footer');
  if (footer) footer.innerHTML = renderFooter();
}

function parseParams(
  match: RegExpMatchArray | null,
  keys: string[]
): Record<string, string> {
  if (!match) return {};
  const values = match.slice(1);
  const params: Record<string, string> = {};
  for (let i = 0; i < keys.length; i++) {
    params[keys[i]] = values[i];
  }
  return params;
}

// 🧭 Define routes without #
const routes: Route[] = [
  {
    path: /^\/$/,
    handler: (root) => {
      if (isAuthenticated()) {
        navigateTo('/home');
      } else {
        HomeView(root);
      }
    },
  },
  { path: /^\/home\/?$/, handler: (root) => HomeView(root) },
  { path: /^\/login\/?$/, handler: (root) => LoginView(root) },
  { path: /^\/register\/?$/, handler: (root) => RegisterView(root) },
  {
    path: /^\/profile\/?$/,
    handler: async (root) => ProfileView(root),
    protected: true,
  },
  // Removed the extra comma
  {
    path: /^\/create\/?$/,
    handler: async (root) => {
      // Load the profile page view first (so the form exists in DOM)
      await ProfileView(root);

      // After DOM is ready, trigger the "Create Listing" form
      const createListingFormContainer = document.getElementById(
        'createListingFormContainer'
      );
      const createListingBtn = document.getElementById('createListingBtn');

      if (createListingFormContainer && createListingBtn) {
        createListingFormContainer.classList.remove('hidden');
        createListingFormContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        // Ensure the button is in correct style
        createListingBtn.textContent = 'Create New Listing';
        createListingBtn.classList.remove('bg-gray-600');
        createListingBtn.classList.add('bg-emerald-600');
      }

      // Attach profile handlers so the form submission works
      attachProfileHandlers(root, getUserProfileData()); // <-- getUserProfileData() should return the Profile object
    },
    protected: true,
  },
  {
    path: /^\/listing\/([^/]+)\/?$/,
    handler: async (root, params) => {
      root.innerHTML = `<p>Listing details for ${params.id} (TODO)</p>`;
    },
  },
  {
    path: /^\/search\/?$/,
    handler: async (root) => {
      await SearchView(root);
    },
  },
];

export function navigateTo(path: string) {
  history.pushState({}, '', path);
  router();
}

export async function router(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  mountNavbar();
  mountFooter();
  setupNavbarSearch();

  const currentPath = window.location.pathname;
  for (const route of routes) {
    const keys: string[] = route.path.source.includes('([^/]+)') ? ['id'] : [];
    const match = currentPath.match(route.path);
    if (match) {
      if (route.protected && !isAuthenticated()) {
        navigateTo('/login');
        return;
      }
      const params = parseParams(match, keys);
      await route.handler(app, params);
      return;
    }
  }

  app.innerHTML = `
    <div class="rounded border border-yellow-200 mt-20 bg-yellow-50 p-4 text-yellow-800">
      <p>Page not found.</p>
      <a class="text-indigo-600 hover:text-indigo-500" href="/">Go home</a>
    </div>
  `;
}

window.addEventListener('popstate', () => {
  router();
});

export function initRouter(): void {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLAnchorElement;
    if (target.matches('a[href]')) {
      const href = target.getAttribute('href');
      if (href && href.startsWith('/')) {
        event.preventDefault();
        navigateTo(href);
      }
    }
  });

  router();
}
function attachProfileHandlers(root: HTMLElement, arg1: any) {
  throw new Error('Function not implemented.');
}

function getUserProfileData(): any {
  throw new Error('Function not implemented.');
}
