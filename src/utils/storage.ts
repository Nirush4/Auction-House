import type { Profile } from '../types'

const TOKEN_KEY = 'accessToken'
const USER_KEY = 'user'
const API_KEY_KEY = 'apiKey'
const USER_NAME = 'username'

/**
 * Save auth details to localStorage
 */
export function saveAuth(
  token: string,
  user: Profile | { name: never },
  apiKey: string | undefined
) {
  const normalizedUser = typeof user === 'string' ? { name: user } : user

  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser))

  if (apiKey) {
    localStorage.setItem(API_KEY_KEY, apiKey)
  }
}

/**
 * Clear all authentication data
 */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(API_KEY_KEY)
  localStorage.removeItem(USER_NAME)
}

/**
 * Remove only the stored user
 */
export function clearUser() {
  localStorage.removeItem(USER_KEY)
}

/**
 * Get the access token
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Get the current stored user (parsed from JSON)
 */
export function getUser() {
  const data = localStorage.getItem('username')

  if (!data || data === 'undefined' || data === 'null') return null

  return data
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export function getUserProfile() {
  try {
    const data = localStorage.getItem('user')
    if (!data || data === 'undefined' || data === 'null') return null
    return JSON.parse(data)
  } catch (err) {
    console.error('Error parsing user from localStorage', err)
    return null
  }
}

export function getLocalItem(key: string) {
  const raw = localStorage.getItem(key)
  if (!raw || raw === 'undefined' || raw === 'null') return null

  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

export function setLocalItem(key: string, value: string) {
  const val = typeof value === 'string' ? value : JSON.stringify(value)
  localStorage.setItem(key, val)
}

export function removeLocalItem(key: string) {
  localStorage.removeItem(key)
}
