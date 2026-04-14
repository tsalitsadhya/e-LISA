import api from './api'

export interface UserInfo {
  id: string
  role: 'admin' | 'operator' | 'qa' | 'site_head' | 'supervisor'
  full_name: string
  username: string
  area: string
  is_active: boolean
  last_login: string | null
  created_at: string
}

export interface LoginResponse {
  token: string
  expires_at: string
  user: UserInfo
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await api.post<{ success: boolean; data: LoginResponse }>('/auth/login', {
    username,
    password,
  })
  const { token, user } = res.data.data
  localStorage.setItem('elisa_token', token)
  localStorage.setItem('elisa_user', JSON.stringify(user))
  return res.data.data
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout')
  } finally {
    localStorage.removeItem('elisa_token')
    localStorage.removeItem('elisa_user')
  }
}

export async function getMe(): Promise<UserInfo> {
  const res = await api.get<{ success: boolean; data: UserInfo }>('/auth/me')
  return res.data.data
}

export function getStoredUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem('elisa_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getToken(): string | null {
  return localStorage.getItem('elisa_token')
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
