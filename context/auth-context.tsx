"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar: string
  role: "Owner" | "Manager" | "Viewer"
}

// Stored only in the registry, never exposed to consumers
interface RegisteredUser extends AuthUser {
  passwordHash: string
}

interface AuthContextType {
  signedInAccounts: AuthUser[]
  activeUser: AuthUser | null
  login: (email: string, password: string) => { ok: boolean; error?: string }
  signup: (name: string, email: string, password: string) => { ok: boolean; error?: string }
  switchUser: (id: string) => void
  logout: (id: string) => void
  logoutAll: () => void
  isReady: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const REGISTRY_KEY  = "ordosell_registry"
const SESSION_KEY   = "ordosell_session"
const ACTIVE_KEY    = "ordosell_active"

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

// Trivial hash so we never store plaintext (good practice even in demos)
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return hash.toString(36)
}

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady,         setIsReady]         = useState(false)
  const [registry,        setRegistry]        = useState<RegisteredUser[]>([])
  const [signedInAccounts,setSignedInAccounts] = useState<AuthUser[]>([])
  const [activeUserId,    setActiveUserId]    = useState<string | null>(null)

  // Hydrate from sessionStorage on mount (client only)
  useEffect(() => {
    const savedRegistry  = loadJSON<RegisteredUser[]>(REGISTRY_KEY, [])
    const savedSession   = loadJSON<AuthUser[]>(SESSION_KEY, [])
    const savedActiveId  = loadJSON<string | null>(ACTIVE_KEY, null)

    setRegistry(savedRegistry)
    setSignedInAccounts(savedSession)
    setActiveUserId(savedActiveId)
    setIsReady(true)
  }, [])

  // Persist registry whenever it changes
  useEffect(() => {
    if (!isReady) return
    saveJSON(REGISTRY_KEY, registry)
  }, [registry, isReady])

  // Persist session whenever it changes
  useEffect(() => {
    if (!isReady) return
    saveJSON(SESSION_KEY, signedInAccounts)
    saveJSON(ACTIVE_KEY, activeUserId)
  }, [signedInAccounts, activeUserId, isReady])

  const activeUser = signedInAccounts.find(a => a.id === activeUserId) ?? null

  const login = (email: string, password: string): { ok: boolean; error?: string } => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed.includes("@")) return { ok: false, error: "Enter a valid email address." }
    if (!password)              return { ok: false, error: "Password is required." }

    // Look up in the registered users registry
    const registered = registry.find(r => r.email === trimmed)
    if (!registered) {
      return { ok: false, error: "No account found with that email. Please sign up first." }
    }
    if (registered.passwordHash !== simpleHash(password)) {
      return { ok: false, error: "Incorrect password." }
    }

    // Already signed in? Just switch to them
    const alreadyIn = signedInAccounts.find(a => a.id === registered.id)
    if (alreadyIn) {
      setActiveUserId(alreadyIn.id)
      return { ok: true }
    }

    // Add to signed-in session
    const { passwordHash: _, ...user } = registered
    setSignedInAccounts(prev => [...prev, user])
    setActiveUserId(user.id)
    return { ok: true }
  }

  const signup = (name: string, email: string, password: string): { ok: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName  = name.trim()

    if (!trimmedName)                  return { ok: false, error: "Full name is required." }
    if (!trimmedEmail.includes("@"))   return { ok: false, error: "Enter a valid email address." }
    if (password.length < 6)           return { ok: false, error: "Password must be at least 6 characters." }
    if (registry.find(r => r.email === trimmedEmail)) {
      return { ok: false, error: "An account with this email already exists. Please log in." }
    }

    const newUser: RegisteredUser = {
      id:           `user-${Date.now()}`,
      name:         trimmedName,
      email:        trimmedEmail,
      avatar:       getInitials(trimmedName),
      role:         registry.length === 0 ? "Owner" : "Manager",
      passwordHash: simpleHash(password),
    }

    setRegistry(prev => [...prev, newUser])

    const { passwordHash: _, ...sessionUser } = newUser
    setSignedInAccounts(prev => [...prev, sessionUser])
    setActiveUserId(sessionUser.id)
    return { ok: true }
  }

  const switchUser = (id: string) => {
    if (signedInAccounts.find(a => a.id === id)) setActiveUserId(id)
  }

  const logout = (id: string) => {
    setSignedInAccounts(prev => prev.filter(a => a.id !== id))
    if (activeUserId === id) {
      const remaining = signedInAccounts.filter(a => a.id !== id)
      setActiveUserId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const logoutAll = () => {
    setSignedInAccounts([])
    setActiveUserId(null)
  }

  return (
    <AuthContext.Provider value={{
      signedInAccounts,
      activeUser,
      login,
      signup,
      switchUser,
      logout,
      logoutAll,
      isReady,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
