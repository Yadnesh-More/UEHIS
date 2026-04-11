'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { AuthSession, AuthRole } from '@/lib/auth-types'
import { AUTH_SESSION_STORAGE_KEY } from '@/lib/auth-types'

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const o = parsed as Record<string, unknown>
    const role = o.role
    const email = o.email
    if (
      role !== 'hospital' &&
      role !== 'blood_bank' &&
      role !== 'civilian'
    ) {
      return null
    }
    if (typeof email !== 'string' || !email.trim()) return null
    const organizationName =
      o.organizationName === null || o.organizationName === undefined
        ? null
        : typeof o.organizationName === 'string'
          ? o.organizationName.trim() || null
          : null
    return {
      role,
      email: email.trim(),
      organizationName,
    }
  } catch {
    return null
  }
}

interface AuthContextValue {
  session: AuthSession | null
  /** false until client has read localStorage (avoid flash / wrong redirect). */
  hydrated: boolean
  signIn: (payload: {
    email: string
    role: AuthRole
    organizationName?: string
  }) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setSession(readStoredSession())
    setHydrated(true)
  }, [])

  const signIn = useCallback(
    (payload: {
      email: string
      role: AuthRole
      organizationName?: string
    }) => {
      const org =
        payload.role === 'civilian'
          ? null
          : (payload.organizationName?.trim() || null)
      const next: AuthSession = {
        role: payload.role,
        email: payload.email.trim(),
        organizationName: org,
      }
      setSession(next)
      try {
        window.localStorage.setItem(
          AUTH_SESSION_STORAGE_KEY,
          JSON.stringify(next)
        )
      } catch {
        /* ignore quota / private mode */
      }
    },
    []
  )

  const signOut = useCallback(() => {
    setSession(null)
    try {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ session, hydrated, signIn, signOut }),
    [session, hydrated, signIn, signOut]
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
