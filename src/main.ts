import { initRouter, router } from './router';
import {
  renderNavbar,
  setupNavbarActions,
  setupNavbarSearch,
} from './components/navbar';

function hydrateStaticShell(): void {
  // Render navbar dynamically
  const navbarContainer = document.getElementById('navbarContainer');
  if (navbarContainer) {
    navbarContainer.innerHTML = renderNavbar();
    setupNavbarActions(); // attach logout listeners
  }

  // Optionally, render footer here if needed
}

async function bootstrap(): Promise<void> {
  hydrateStaticShell();
  initRouter();

  // Re-render navbar whenever the hash changes (user may log in/out)
  window.addEventListener('hashchange', () => {
    const navbarContainer = document.getElementById('navbarContainer');
    if (navbarContainer) {
      navbarContainer.innerHTML = renderNavbar();
      setupNavbarActions();
      setupNavbarSearch();
    }
  });

  await router();
}

bootstrap().catch((err) => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div class="rounded border border-red-200 bg-red-50 p-4 text-red-700">
        ${(err as Error).message}
      </div>
    `;
  }
  console.error(err);
});
