import type { Listing } from '../types/index'
import { getUser, getToken } from '../utils/storage'
import { showLoadingOverlay, hideLoadingOverlay } from '../utils/overlay'
import { startCountdown } from '../utils/startCountdowns'
import { showToast } from '../utils/toast'
import { navigateTo } from '../router'
import { openEditListingModal } from '../components/editListingModal'
import { showConfirmModal } from '../utils/confirmModal'
import { fetchProfile } from '../api/profile'

let isClickListenerAttached = false

export async function ListingDetailsView(
  root: HTMLElement,
  listingId: string
): Promise<void> {
  root.innerHTML = `
    <section class="container mx-auto px-4 py-16 text-center">
      <p class="text-gray-400 text-lg animate-pulse">Loading listing details...</p>
    </section>
  `

  showLoadingOverlay({})

  try {
    const url = `https://v2.api.noroff.dev/auction/listings/${listingId}?_seller=true&_bids=true`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch listing')

    const json = await res.json()
    const listing: Listing = json.data

    if (!listing) {
      root.innerHTML =
        '<p class="text-gray-500 text-center text-lg">Listing not found.</p>'
      return
    }

    const currentUser = getUser() ?? undefined
    const token = getToken()
    const key = localStorage.getItem('apiKey')
    const isOwner = currentUser && listing.seller?.name === currentUser

    const startingBid = listing.startingBid ?? 0
    const highestBid =
      listing.bids && listing.bids.length
        ? Math.max(...listing.bids.map((b) => b.amount))
        : startingBid
    const bids = listing._count?.bids ?? 0
    const created = listing.created
      ? new Date(listing.created).toLocaleDateString('en-GB')
      : 'Unknown'
    const endDate = listing.endsAt ? new Date(listing.endsAt).getTime() : null
    const now = Date.now()
    const hasEnded = endDate !== null && endDate <= now

    const countdownId = `countdown-${listing.id}`

    const mainImage =
      listing.media?.[0]?.url ??
      'https://images.unsplash.com/photo-1631913290783-490324506193?auto=format&fit=crop&q=80&w=800'

    const galleryThumbnails =
      listing.media
        ?.map(
          (m, index) => `
        <img src="${m.url}" 
             alt="${m.alt ?? listing.title}" 
             class="h-24 w-24 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-indigo-500 transition"
             data-index="${index}"/>`
        )
        .join('') ?? ''

    const sellerAvatar =
      listing.seller?.avatar?.url ??
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop'
    const sellerAlt = listing.seller?.name ?? 'Seller'

    root.innerHTML = `
<section class="max-w-7xl mx-auto px-6 py-12  sm:py-25 mt-10 sm:mt-5">
  <!-- HEADER -->
  <div class="mb-10 border-b border-gray-200 pb-3 sm:pb-6">
    <h1 class="text-2xl sm:text-4xl font-extralight text-gray-900 mb-3">
      ${listing.title ?? 'Untitled listing'}
    </h1>
    <p class="text-sm sm:text-base text-gray-500">
      Listed on ${created} · Category: ${listing.category ?? 'N/A'}
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-5 gap-12">
    <!-- LEFT CONTENT -->
    <div class="lg:col-span-3 space-y-10">
      <!-- IMAGE -->
      <div class="relative">
        <img
          id="mainGalleryImg"
          src="${mainImage}"
          alt="${listing.title}"
          class="w-full h-[400px] sm:h-[520px] object-cover rounded-lg border border-gray-200"
        />

        <!-- EVENT / COUNTDOWN -->
        <div
          id="${countdownId}"
          class="absolute top-4 right-4 flex items-center gap-3
                 px-5 py-3 rounded-xl shadow-lg
                 bg-indigo-600 text-white
                 text-sm sm:text-base font-semibold tracking-wide">
          <span class="inline-flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
          <span>${hasEnded ? 'Auction ended' : 'Ending soon'}</span>
        </div>
      </div>

      ${
        listing.media && listing.media.length > 1
          ? `
          <div id="galleryThumbnails"
               class="grid grid-cols-4 sm:grid-cols-5 gap-3">
            ${galleryThumbnails}
          </div>`
          : ''
      }

      <!-- DESCRIPTION -->
      <div class="sm:space-y-4">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900">
          Description
        </h2>
        <p class="text-base sm:text-lg text-gray-700 leading-relaxed">
          ${listing.description ?? 'No description provided.'}
        </p>
      </div>

      <!-- TAGS -->
      <div class="flex flex-wrap gap-2">
        ${(listing.tags ?? [])
          .map(
            (tag) =>
              `<span class="px-3 py-1 rounded-full text-sm
                     bg-indigo-50 text-indigo-700">
                ${tag}
              </span>`
          )
          .join('')}
      </div>

      <!-- BID HISTORY -->
      <div class="pt-6 border-t border-gray-200">
        <h3 class="text-base sm:text-xl font-semibold text-gray-900 mb-4">
          Bid History
        </h3>
        <ul id="bidHistoryList" class="space-y-3"></ul>
      </div>
    </div>

    <!-- RIGHT SIDEBAR -->
    <aside class="lg:col-span-2">
      <div class="sticky top-24 space-y-6">
        <!-- PRICE BOX -->
        <div class="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-4">
          <div class="flex justify-between text-sm sm:text-base">
            <span class="text-gray-500">Starting bid</span>
            <span class="font-medium text-base sm:text-lg text-gray-900">$${startingBid}</span>
          </div>
          <div class="flex justify-between text-sm sm:text-base">
            <span class="text-gray-500">Highest bid</span>
            <span class="font-semibold text-base sm:text-lg text-indigo-600">$${highestBid}</span>
          </div>
          <div class="flex justify-between text-sm sm:text-base">
            <span class="text-gray-500">Total bids</span>
            <span class="font-medium text-base sm:text-lg text-gray-900">${bids}</span>
          </div>

          <div class="pt-4 border-t border-gray-200 space-y-3">
            ${
              isOwner
                ? `
                  <button
                    class="editListingButton w-full py-2.5 rounded-lg
                           bg-indigo-600 text-white text-sm font-medium
                           hover:bg-indigo-700 transition cursor-pointer">
                    Edit Listing
                  </button>
                  <button
                    class="deleteListingBtn w-full py-2.5 rounded-lg
                           bg-red-600 text-white text-sm font-medium
                           hover:bg-red-700 transition cursor-pointer">
                    Delete Listing
                  </button>
                `
                : hasEnded
                ? `
                  <!-- ENDED STATE -->
                  <div
                    class="w-full p-4 rounded-xl
                           bg-gray-100 border border-gray-300
                           text-gray-700 text-sm sm:text-base
                           flex items-center gap-3">
                    <span class="text-lg">🔒</span>
                    <span class="font-medium">
                      This auction has ended. Bidding is now closed.
                    </span>
                  </div>
                `
                : currentUser
                ? `
                  <!-- ACTIVE BIDDING -->
                  <input
                    id="bidAmount"
                    type="number"
                    min="${highestBid + 1}"
                    placeholder="Enter your bid"
                    class="w-full border border-gray-300 rounded-lg px-4 py-3
                           text-sm sm:text-base
                           focus:ring-2 focus:ring-indigo-500
                           focus:border-indigo-500
                           transition"
                  />
                  <button
                    id="placeBidBtn"
                    class="w-full py-3 rounded-lg
                           bg-green-600 text-white
                           text-sm sm:text-base font-semibold
                           hover:bg-green-700
                           active:scale-[0.98]
                           transition">
                    Place Bid
                  </button>
                `
                : `
                  <button
                    class="loginBtn w-full py-3 rounded-lg
                           bg-indigo-600 text-white
                           text-sm sm:text-base font-semibold
                           hover:bg-indigo-700 transition cursor-pointer">
                    Login to Bid
                  </button>
                `
            }
          </div>
        </div>

        <!-- SELLER -->
        <div
          class="flex items-center gap-4 border border-gray-200 rounded-xl p-4
                 bg-white shadow-sm hover:bg-gray-50 cursor-pointer sellerAvatar"
          data-username="${listing.seller?.name ?? ''}">
          <img
            src="${sellerAvatar}"
            alt="${sellerAlt}"
            class="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <p class="text-sm sm:text-base font-semibold text-gray-900">
              ${listing.seller?.name ?? 'Unknown seller'}
            </p>
            <p class="text-xs sm:text-sm text-gray-500">
              View seller profile
            </p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</section>
`

    setTimeout(() => startCountdown(listing), 50)

    const bidHistoryList = document.getElementById(
      'bidHistoryList'
    ) as HTMLDivElement
    if (listing.bids?.length) {
      const sortedBids = listing.bids.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      )

      bidHistoryList.innerHTML = `
        <div class="flex flex-col space-y-2 w-full">
          ${sortedBids
            .map(
              (bid) => `
              <div class="flex justify-between bg-gray-800 items-center border  rounded-lg p-3 bidderAvatar" data-username="${
                bid.bidder.name
              }">
                <div class="flex flex-col gap-1 items-start w-full sm:w-auto mb-2 sm:mb-0">
                <div class="flex ">
                  <img src="${
                    bid.bidder.avatar?.url ??
                    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop'
                  }" alt="${
                bid.bidder.name
              }" class="h-8 w-8 rounded-full flex flex-col object-cover mr-3"/>
                  <span class="font-medium text-gray-200 text-sm sm:text-base">${
                    bid.bidder.name
                  }</span>
                   </div>
                  <span class="text-gray-400 text-sm">${new Date(
                    bid.created
                  ).toLocaleString()}</span>
                </div>
                <div class="flex flex-col sm:flex-row sm:space-x-4 items-end sm:items-center w-full sm:w-auto text-right">
                  <span class="font-semibold text-gray-100 text-base sm:text-lg">$${
                    bid.amount
                  }</span>
                  
                </div>
              </div>
            `
            )
            .join('')}
        </div>
      `
    } else {
      bidHistoryList.innerHTML = `
        <p class="py-4 px-4 text-gray-500 text-center border border-gray-200 rounded-lg">No bids yet</p>
      `
    }

    // imp! EVENT LISTENER (UPDATED)

    if (!isClickListenerAttached) {
      isClickListenerAttached = true

      root.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement

        const thumb = target.closest('[data-index]') as HTMLElement
        if (thumb) {
          const idx = parseInt(thumb.dataset.index!)
          const newSrc = listing.media?.[idx]?.url
          if (newSrc) {
            const mainImg = document.getElementById(
              'mainGalleryImg'
            ) as HTMLImageElement
            mainImg.classList.add('opacity-0', 'scale-105')
            setTimeout(() => {
              mainImg.src = newSrc
              mainImg.classList.remove('opacity-0', 'scale-105')
            }, 200)
          }
          return
        }

        const sellerEl = target.closest('.sellerAvatar')
        if (sellerEl) {
          const username = sellerEl.getAttribute('data-username')
          if (username) navigateTo(`/profile/${encodeURIComponent(username)}`)
          return
        }

        const bidderEl = target.closest('.bidderAvatar')
        if (bidderEl) {
          const username = bidderEl.getAttribute('data-username')
          if (username) navigateTo(`/profile/${encodeURIComponent(username)}`)
          return
        }

        if (target.closest('.editListingButton') && isOwner) {
          openEditListingModal(listing.id)
          return
        }

        if (target.closest('.deleteListingBtn') && isOwner) {
          const confirmed = await showConfirmModal(
            'Are you sure you want to delete this listing?'
          )
          if (!confirmed) return

          try {
            showLoadingOverlay({ message: 'Deleting listing...' })

            const res = await fetch(
              `https://v2.api.noroff.dev/auction/listings/${listing.id}`,
              {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  ...(key ? { 'X-Noroff-API-Key': key } : {}),
                  Authorization: `Bearer ${token}`,
                },
              }
            )

            if (!res.ok) {
              const errData = await res.json()
              throw new Error(
                errData?.errors?.[0]?.message || 'Failed to delete listing'
              )
            }

            showToast('success', 'Listing deleted successfully!')
            navigateTo('/profile')
          } catch (err) {
            console.error(err)
            showToast('error', (err as Error).message)
          } finally {
            hideLoadingOverlay()
          }
          return
        }

        if (target.closest('.loginBtn')) {
          navigateTo('/login')
          return
        }

        if (target.id === 'placeBidBtn') {
          const currentUser = getUser() ?? ''
          const token = getToken()
          if (!currentUser || !token) return navigateTo('/login')

          const bidInput = document.getElementById(
            'bidAmount'
          ) as HTMLInputElement
          const amount = parseFloat(bidInput.value)
          if (!amount || amount <= highestBid) {
            showToast('error', `Enter a valid bid greater than $${highestBid}`)
            return
          }

          try {
            showLoadingOverlay({})

            const res = await fetch(
              `https://v2.api.noroff.dev/auction/listings/${listing.id}/bids`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(key ? { 'X-Noroff-API-Key': key } : {}),
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount }),
              }
            )

            if (!res.ok) {
              const errData = await res.json()
              throw new Error(
                errData?.errors?.[0]?.message || 'Failed to place bid'
              )
            }

            showToast('success', `Bid of $${amount} placed successfully!`)
            const profileData = await fetchProfile(currentUser)
            localStorage.setItem('user', JSON.stringify(profileData))
            bidInput.value = ''

            const newBidHtml = `
          <div class="flex flex-col sm:flex-row justify-between items-center border border-green-400 rounded-lg p-3 bg-green-50 hover:bg-green-100 transition-colors bidderAvatar cursor-pointer" data-username="${currentUser}">
            <div class="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
              <img src="${
                profileData.avatar?.url ??
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop'
              }" alt="${currentUser}" class="h-8 w-8 rounded-full object-cover mr-3"/>
              <span class="font-medium text-gray-800 text-sm sm:text-base">${currentUser}</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:space-x-4 items-end sm:items-center w-full sm:w-auto text-right">
              <span class="font-semibold text-indigo-600 text-sm sm:text-base">$${amount}</span>
              <span class="text-gray-500 text-xs sm:text-sm">${new Date().toLocaleString()}</span>
            </div>
          </div>`

            bidHistoryList.insertAdjacentHTML('afterbegin', newBidHtml)
          } catch (err) {
            console.error(err)
            showToast('error', (err as Error).message)
          } finally {
            hideLoadingOverlay()
          }
        }
      })
    }
  } catch (err) {
    console.error(err)
    root.innerHTML = `<p class="text-gray-500 text-center text-lg">Failed to load listing.</p>`
  } finally {
    hideLoadingOverlay()
  }
}
