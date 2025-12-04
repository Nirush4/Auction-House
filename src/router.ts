import { HomeView } from './views/home';
import { LoginView } from './views/login';
import { RegisterView } from './views/register';
import { renderNavbar, setupNavbarSearch } from './components/navbar';
import { renderFooter } from './components/footer';
import { isAuthenticated, getUser } from './utils/storage';
import { logout } from './api/auth';
import { showToast } from './utils/toast';
import { ProfileView } from './views/profile';
import { showLoadingOverlay, hideLoadingOverlay } from './utils/overlay';
import { SearchView } from './views/search';
import { ListingDetailsView } from './views/listingDetails';
import { PrivacyPolicyView } from './views/privacyPolicy';
import { TermsConditionView } from './views/termsCondition';
import { RenderAboutPage } from './views/about';

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
  }

  const logoutBtn = header.querySelector<HTMLButtonElement>('#logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  const mobileLogoutBtn =
    header.querySelector<HTMLButtonElement>('#mobileLogoutBtn');
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

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

const routes: Route[] = [
  {
    path: /^\/$/,
    handler: (root) => {
      if (isAuthenticated()) navigateTo('/home');
      else HomeView(root);
    },
  },
  { path: /^\/home\/?$/, handler: (root) => HomeView(root) },
  { path: /^\/login\/?$/, handler: (root) => LoginView(root) },
  { path: /^\/register\/?$/, handler: (root) => RegisterView(root) },
  {
    path: /^\/privacy-policy\/?$/,
    handler: (root) => PrivacyPolicyView(root),
  },
  {
    path: /^\/terms-condition\/?$/,
    handler: (root) => TermsConditionView(root),
  },
  {
    path: /^\/about\/?$/,
    handler: (root) => RenderAboutPage(root),
  },

  // ✅ Profile route with optional username
  {
    path: /^\/profile(?:\/([^/]+))?\/?$/,
    handler: async (root, params) => {
      const requestedProfileName = params.id || null;
      await ProfileView(root, requestedProfileName);
    },
    protected: true, // optionally keep protected
  },

  // ✅ Create Listing (opens form after rendering profile)
  {
    path: /^\/create\/?$/,
    handler: async (root) => {
      const username = getUser();
      if (!username) {
        navigateTo('/login');
        return;
      }

      await ProfileView(root, username);

      const form = document.getElementById('createListingFormContainer');
      const button = document.getElementById('createListingBtn');

      if (form) {
        form.classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (button) {
        button.textContent = 'Create New Listing';
        button.classList.remove('bg-gray-600');
        button.classList.add('bg-emerald-600');
      }
    },
    protected: true,
  },

  // Listing Details
  {
    path: /^\/listing\/([^/]+)\/?$/,
    handler: async (root, params) => {
      if (params.id) await ListingDetailsView(root, params.id);
      else
        root.innerHTML = `<p class="text-gray-500 text-center">Invalid listing ID.</p>`;
    },
  },

  // Search
  {
    path: /^\/search\/?$/,
    handler: async (root) => SearchView(root),
  },
];

export function navigateTo(path: string) {
  history.pushState({}, '', path);
  router();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export async function router(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  mountNavbar();
  mountFooter();
  setupNavbarSearch();

  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';

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
  router().then(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
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
