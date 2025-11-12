import { HomeView } from './views/home.js';
import { LoginView } from './views/login.js';
import { RegisterView } from './views/register.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { isAuthenticated } from './utils/storage.js';
import { logout } from './api/auth.js';
import { showToast } from './utils/toast.js';

type RouteHandler = (
  root: HTMLElement,
  params: Record<string, string>
) => void | Promise<void>;

interface Route {
  path: RegExp;
  handler: RouteHandler;
  protected?: boolean;
}

function mountNavbar() {
  const header = document.getElementById('navbar');
  if (!header) return;

  header.innerHTML = renderNavbar();

  // Desktop logout button
  const logoutBtn = header.querySelector<HTMLButtonElement>('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logout();
      showToast('success', '✅ You have been logged out!');
      navigateTo('/');
    });
  }

  // Mobile logout button
  const mobileLogoutBtn =
    header.querySelector<HTMLButtonElement>('#mobileLogoutBtn');
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', async () => {
      await logout();
      showToast('success', '✅ You have been logged out!');
      navigateTo('/');
    });
  }

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
    handler: async (root) => {
      root.innerHTML = '<p>Profile page (TODO)</p>';
    },
    protected: true,
  },
  {
    path: /^\/create\/?$/,
    handler: async (root) => {
      root.innerHTML = '<p>Create listing page (TODO)</p>';
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
      root.innerHTML = '<p>Search page (TODO)</p>';
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
