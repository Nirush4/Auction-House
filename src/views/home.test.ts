import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HomeView, listingCard } from './home'

// Mock dependencies
vi.mock('../utils/storage', () => ({ getUser: vi.fn() }))
vi.mock('../utils/overlay', () => ({
  showLoadingOverlay: vi.fn(),
  hideLoadingOverlay: vi.fn(),
}))
vi.mock('../router', () => ({ navigateTo: vi.fn() }))
vi.mock('../utils/startCountdowns', () => ({ startCountdowns: vi.fn() }))
vi.mock('../utils/toast', () => ({ showToast: vi.fn() }))
vi.mock('../components/editListingModal', () => ({
  openEditListingModal: vi.fn(),
}))
vi.mock('../components/categoryFilter', () => ({
  CategoryFilter: vi.fn(() => '<div>CategoryFilter</div>'),
  setupCategoryScroll: vi.fn(),
}))
vi.mock('./heroSection', () => ({
  HeroSection: vi.fn(() => '<div>HeroSection</div>'),
}))

describe('HomeView', () => {
  let root: HTMLElement

  beforeEach(() => {
    root = document.createElement('div')
    document.body.appendChild(root)
  })

  it('renders skeleton and sections initially', async () => {
    // Mock fetch to avoid network call
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [], meta: { totalCount: 0 } }),
        })
      )
    )

    await HomeView(root)

    expect(root.innerHTML).toContain('HeroSection')
    expect(root.innerHTML).toContain('CategoryFilter')
    expect(root.querySelector('#homeContent')).not.toBeNull()
    expect(root.querySelector('#paginationControls')).not.toBeNull()
  })
})

describe('listingCard', () => {
  it('renders a card with default values when no user', () => {
    const listing = {
      id: '1',
      title: 'Test Listing',
      created: new Date().toISOString(),
      description: 'This is a test listing',
      media: [],
      bids: [],
      _count: { bids: 0 },
      tags: ['Test'],
    } as any

    const html = listingCard(listing)

    expect(html).toContain('Test Listing')
    expect(html).toContain('This is a test listing') // fixed assertion
    expect(html).toContain('Test') // category tag
    expect(html).toContain('Highest Bid') // bid section
  })
})
