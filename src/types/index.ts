export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterPayload extends AuthCredentials {
  name: string
  bio?: string
  avatar?: {
    url: string
    alt?: string
  }
}

export interface Profile {
  id: string
  data: any
  _count: any
  banner: any
  name: string
  email: string
  bio?: string
  avatar?: {
    url?: string
    alt?: string
  }
  credits: number
}

export interface AuthResponse {
  data: Profile
  accessToken: string
  user: Profile
}

export interface User {
  name: string
  email: string
  bio?: string
  avatar?: Record<string, any>
  banner?: Record<string, any>
  credits?: number
  _count?: {
    listings?: number
    wins?: number
  }
  [key: string]: any
}

export interface MediaItem {
  url: string
  alt?: string
}

export interface Bid {
  date: string | number | Date
  listingTitle: any
  bidder: any
  listing: any
  id: string
  amount: number
  bidderName: string
  created: string
}

export interface Listing {
  success: any
  message: string | undefined
  category: string
  startingBid: any
  id: string
  title: string
  description?: string
  created: string
  endsAt: string
  price: number
  tags?: string[]
  media?: MediaItem[]
  _count?: {
    bids?: number
  }
  bids?: Bid[]
  seller?: {
    id: string
    name: string
    avatar?: MediaItem
  }
}

export interface OverlayOptions {
  id?: string
  message?: string
}
