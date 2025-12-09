import { describe, it, expect, beforeEach, vi } from 'vitest'
import { attachDeleteListingHandlers } from './profile'

describe('attachDeleteListingHandlers - extra simple tests', () => {
  let root: HTMLElement

  beforeEach(() => {
    root = document.createElement('div')
    root.innerHTML = `
      <button class="deleteListingBtn" data-listing-id="111">Delete A</button>
      <button class="deleteListingBtn" data-listing-id="222">Delete B</button>
      <button class="nonDeleteBtn">Keep Me</button>
    `
  })

  it('should allow multiple clicks on the same delete button', () => {
    const button = root.querySelector<HTMLButtonElement>('.deleteListingBtn')!
    const clicks: string[] = []
    button.addEventListener('click', () =>
      clicks.push(button.dataset.listingId!)
    )

    attachDeleteListingHandlers(root, {} as any)

    button.click()
    button.click()
    button.click()

    expect(clicks).toEqual(['111', '111', '111'])
  })

  it('should not attach listeners to buttons without deleteListingBtn class', () => {
    const otherButton = root.querySelector<HTMLButtonElement>('.nonDeleteBtn')!
    const spy = vi.fn()
    otherButton.addEventListener('click', spy)

    attachDeleteListingHandlers(root, {} as any)

    otherButton.click()
    expect(spy).toHaveBeenCalled()
  })

  it('should handle dynamically added delete buttons', () => {
    const dynamicButton = document.createElement('button')
    dynamicButton.className = 'deleteListingBtn'
    dynamicButton.dataset.listingId = '333'
    dynamicButton.textContent = 'Delete C'
    root.appendChild(dynamicButton)

    const clicks: string[] = []
    dynamicButton.addEventListener('click', () =>
      clicks.push(dynamicButton.dataset.listingId!)
    )

    attachDeleteListingHandlers(root, {} as any)

    dynamicButton.click()
    expect(clicks).toEqual(['333'])
  })

  it('should not remove or change unrelated elements', () => {
    const otherButton = root.querySelector<HTMLButtonElement>('.nonDeleteBtn')!
    const textBefore = otherButton.textContent
    attachDeleteListingHandlers(root, {} as any)
    expect(otherButton.textContent).toBe(textBefore)
  })

  it('should handle an empty root gracefully', () => {
    const emptyRoot = document.createElement('div')
    expect(() =>
      attachDeleteListingHandlers(emptyRoot, {} as any)
    ).not.toThrow()
  })
})
