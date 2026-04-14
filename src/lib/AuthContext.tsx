import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { UserInfo } from './auth'
import { getStoredUser, isLoggedIn, logout as authLogout } from './auth'

interface AuthContextType {
  user: UserInfo | null
  isAuthenticated: boolean
  setUser: (user: UserInfo | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    if (isLoggedIn()) {
      setUser(getStoredUser())
    }
  }, [])

  const logout = async () => {
    await authLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
