type ToastType = 'success' | 'error' | 'info';

export function showToast(type: ToastType, message: string, duration = 3000) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed top-20 right-5 flex flex-col gap-3 z-[9999]';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = `
    px-4 py-2 rounded-md shadow-md text-white font-medium
    transition-all duration-300 transform
    ${type === 'success' ? 'bg-green-500' : ''}
    ${type === 'error' ? 'bg-red-500' : ''}
    ${type === 'info' ? 'bg-blue-500' : ''}
    opacity-0 translate-y-2
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    toast.addEventListener('transitionend', () => toast.remove());
  }, duration);
}
