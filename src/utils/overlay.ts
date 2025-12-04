import type { OverlayOptions } from '../types/index';

export function showLoadingOverlay({
  id = 'loadingOverlay',
  message = 'Loading...',
}: OverlayOptions = {}) {
  let overlay = document.getElementById(id) as HTMLDivElement;

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = id;
    overlay.className =
      'fixed inset-0 bg-white/50 backdrop-blur-lg flex flex-col items-center justify-center z-50 transition-opacity duration-500';

    overlay.innerHTML = `
      <div class="relative w-16 h-16 mb-4">
        <div class="absolute w-full h-full rounded-full border-4 border-t-transparent border-b-transparent border-indigo-500 animate-spin-slow"></div>
        <div class="absolute w-full h-full rounded-full border-4 border-l-transparent border-r-transparent border-pink-500 animate-spin-reverse"></div>
      </div>
      <p class="text-lg font-semibold text-gray-800 animate-pulse tracking-wide">${message}</p>
      <div class="flex space-x-1 mt-2">
        <span class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce-delay1"></span>
        <span class="w-2 h-2 bg-purple-500 rounded-full animate-bounce-delay2"></span>
        <span class="w-2 h-2 bg-pink-500 rounded-full animate-bounce-delay3"></span>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  overlay.classList.remove('hidden');
  return overlay;
}

export function hideLoadingOverlay(id = 'loadingOverlay') {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.add('hidden');
}
