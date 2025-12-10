export function showConfirmModal(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = `fixed inset-0 bg-black/40 flex items-center justify-center z-50`

    const modal = document.createElement('div')
    modal.className = `bg-white rounded-lg p-6 mx-4 max-w-sm w-full shadow-lg text-center`

    modal.innerHTML = `
      <p class="mb-4 text-gray-800 text-sm sm:text-base">${message}</p>
      <div class="flex justify-center gap-4">
        <button class="confirmBtn bg-red-600 text-white text-sm sm:text-base px-4 py-2 rounded hover:bg-red-500 cursor-pointer">
          Delete
        </button>
        <button class="cancelBtn bg-gray-300 text-gray-700 px-4 py-2 text-sm sm:text-base rounded hover:bg-gray-200 cursor-pointer">
          Cancel
        </button>
      </div>
    `

    overlay.appendChild(modal)
    document.body.appendChild(overlay)

    modal
      .querySelector<HTMLButtonElement>('.confirmBtn')
      ?.addEventListener('click', () => {
        document.body.removeChild(overlay)
        resolve(true)
      })

    modal
      .querySelector<HTMLButtonElement>('.cancelBtn')
      ?.addEventListener('click', () => {
        document.body.removeChild(overlay)
        resolve(false)
      })
  })
}
