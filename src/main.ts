import { initRouter, router } from './router'
import {
  renderNavbar,
  setupNavbarActions,
  setupNavbarSearch,
} from './components/navbar'

import { initCookieConsent } from '../src/views/cookieConsentView'

function hydrateStaticShell(): void {
  const navbarContainer = document.getElementById('navbarContainer')
  if (navbarContainer) {
    navbarContainer.innerHTML = renderNavbar()
    setupNavbarActions()
    setupNavbarSearch()
  }
}

async function bootstrap(): Promise<void> {
  hydrateStaticShell()

  const modalRoot = document.getElementById('modal-root')
  if (modalRoot) {
    initCookieConsent(modalRoot)
  }

  initRouter()

  window.addEventListener('popstate', () => {
    hydrateStaticShell()
  })

  await router()
}

bootstrap().catch((err) => {
  const app = document.getElementById('app')
  if (app) {
    app.innerHTML = `
      <div class="rounded border border-red-200 bg-red-50 p-4 text-red-700">
        ${(err as Error).message}
      </div>
    `
  }
  console.error(err)
})
