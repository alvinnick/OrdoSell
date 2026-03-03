"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Mode = "login" | "signup"

export default function AuthPage() {
  const router = useRouter()
  const { login, signup, activeUser, isReady } = useAuth()

  // Already logged in — go straight to the app
  useEffect(() => {
    if (isReady && activeUser) {
      router.replace("/dashboard")
    }
  }, [isReady, activeUser, router])

  const [mode,          setMode]          = useState<Mode>("login")
  const [name,          setName]          = useState("")
  const [email,         setEmail]         = useState("")
  const [password,      setPassword]      = useState("")
  const [showPassword,  setShowPassword]  = useState(false)
  const [error,         setError]         = useState("")
  const [loading,       setLoading]       = useState(false)

  const reset = (next: Mode) => {
    setMode(next)
    setError("")
    setName("")
    setEmail("")
    setPassword("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Tiny artificial delay for feel
    await new Promise(r => setTimeout(r, 300))

    const result = mode === "login"
      ? login(email, password)
      : signup(name, email, password)

    setLoading(false)

    if (!result.ok) {
      setError(result.error ?? "Something went wrong.")
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Subtle background grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm flex flex-col gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-display font-bold text-lg">OS</span>
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl text-foreground tracking-tight">OrdoSell</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Multi-channel marketplace platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {/* Tab switcher */}
          <div className="grid grid-cols-2 border-b border-border">
            {(["login", "signup"] as Mode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => reset(m)}
                className={cn(
                  "py-3 text-sm font-medium font-display transition-colors",
                  mode === m
                    ? "text-primary border-b-2 border-primary -mb-px bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Alex Johnson"
                  autoComplete="name"
                  value={name}
                  onChange={e => { setName(e.target.value); setError("") }}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError("") }}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError("") }}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full font-display font-semibold mt-1" disabled={loading}>
              {loading
                ? (mode === "login" ? "Logging in…" : "Creating account…")
                : (mode === "login" ? "Log in" : "Create account")}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => reset(mode === "login" ? "signup" : "login")}
            className="text-primary hover:underline"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  )
}
