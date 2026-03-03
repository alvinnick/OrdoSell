"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { activeUser, isReady } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isReady && !activeUser) {
      router.replace("/auth")
    }
  }, [activeUser, isReady, router])

  // Wait for sessionStorage to hydrate before rendering anything
  if (!isReady) return null

  // Redirect in progress
  if (!activeUser) return null

  return <>{children}</>
}
