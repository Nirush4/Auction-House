import type {
  AuthCredentials,
  RegisterPayload,
  AuthResponse,
} from '../types/index'
import { saveAuth } from '../utils/storage'

const API_BASE = 'https://v2.api.noroff.dev'
const AUTH_BASE = `${API_BASE}/auth`

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const message =
      (data && (data.errors?.[0]?.message || data.message)) || res.statusText
    throw new Error(message)
  }

  return data as T
}

export async function register(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await handleResponse<AuthResponse>(res)

  const user = data.user ?? data.data ?? data
  const userObj = typeof user === 'string' ? { name: user } : user

  saveAuth(data.accessToken, userObj, undefined)
  return data
}

export async function login(
  credentials: AuthCredentials
): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  const data = await handleResponse<AuthResponse>(res)

  const user = data.user ?? data.data ?? data
  const userObj = typeof user === 'string' ? { name: user } : user

  saveAuth(data.accessToken, userObj, undefined)
  return data
}

export async function logout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
  localStorage.removeItem('apiKey')
  localStorage.removeItem('username')
}
