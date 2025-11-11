export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
  bio?: string;
  avatar?: {
    url: string;
    alt?: string;
  };
}

export interface Profile {
  name: string;
  email: string;
  bio?: string;
  avatar?: {
    url?: string;
    alt?: string;
  };
  credits: number;
}

export interface AuthResponse {
  accessToken: string;
  user: Profile;
}

export interface MediaItem {
  url: string;
  alt?: string;
}

export interface Bid {
  id: string;
  amount: number;
  bidderName: string;
  created: string;
}

export interface Listing {
  id: string;
  title: string;
  description?: string;
  endsAt: string;
  media?: MediaItem[];
  _count?: {
    bids?: number;
  };
  bids?: Bid[];
  seller?: {
    name: string;
    avatar?: MediaItem;
  };
}
