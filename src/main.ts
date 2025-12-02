import { initRouter, router } from './router';
import {
  renderNavbar,
  setupNavbarActions,
  setupNavbarSearch,
} from './components/navbar';

function hydrateStaticShell(): void {
  const navbarContainer = document.getElementById('navbarContainer');
  if (navbarContainer) {
    navbarContainer.innerHTML = renderNavbar();
    setupNavbarActions();
    setupNavbarSearch();
  }
}

async function bootstrap(): Promise<void> {
  // Initial navbar
  hydrateStaticShell();

  // Initialize SPA router (handles all <a href="/..."> internal navigation)
  initRouter();

  // Re-render navbar when browser back/forward is used
  window.addEventListener('popstate', () => {
    hydrateStaticShell();
  });

  // Initial route load
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
