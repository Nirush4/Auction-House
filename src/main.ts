import { initRouter, router } from './router.js';

function hydrateStaticShell(): void {
  // Initial navbar/footer rendering happens inside router()
}

async function bootstrap(): Promise<void> {
  hydrateStaticShell();
  initRouter();
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
  // eslint-disable-next-line no-console
  console.error(err);
});
