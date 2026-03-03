"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, Trash2, ExternalLink, Check, UserCircle2, LogOut, LogIn } from "lucide-react"
import { useApp } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import type { Platform } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const PLATFORM_META: Record<Platform, { label: string; color: string; abbr: string; devLink: string }> = {
  amazon: { label: "Amazon", color: "#FF9900", abbr: "AMZ", devLink: "https://sellercentral.amazon.com/apps/manage" },
  ebay:   { label: "eBay",   color: "#E53238", abbr: "eBay", devLink: "https://developer.ebay.com" },
  etsy:   { label: "Etsy",   color: "#F56400", abbr: "Etsy", devLink: "https://www.etsy.com/developers" },
  vinted: { label: "Vinted", color: "#09B1BA", abbr: "V",    devLink: "https://www.vinted.com" },
}

const ROLE_COLORS: Record<string, string> = {
  Owner:   "text-primary bg-primary/10",
  Manager: "text-[#FF9900] bg-[#FF9900]/10",
  Viewer:  "text-muted-foreground bg-secondary",
}

const ALL_PLATFORMS: Platform[] = ["amazon", "ebay", "etsy", "vinted"]

export default function SettingsPage() {
  const { connectedAccounts, disconnectAccount, notificationPrefs, setNotificationPrefs } = useApp()
  const { signedInAccounts, activeUser, switchUser, logout, logoutAll } = useAuth()
  const router = useRouter()

  const [emailValue,        setEmailValue]        = useState(notificationPrefs.salesAlertEmail)
  const [emailError,        setEmailError]        = useState("")
  const [confirmDisconnect, setConfirmDisconnect] = useState<Platform | null>(null)
  const [switchingTo,       setSwitchingTo]       = useState<string | null>(null)
  const [confirmLogoutAll,  setConfirmLogoutAll]  = useState(false)

  const handleSaveNotifications = () => {
    if (emailValue && !emailValue.includes("@")) {
      setEmailError("Please enter a valid email address.")
      return
    }
    setEmailError("")
    setNotificationPrefs({ salesAlertEmail: emailValue })
    toast.success("Notification preferences saved.")
  }

  const handleDisconnect = (platform: Platform) => {
    disconnectAccount(platform)
    toast.success(`${PLATFORM_META[platform].label} account disconnected.`)
    setConfirmDisconnect(null)
  }

  const handleSwitchAccount = (id: string) => {
    setSwitchingTo(id)
    setTimeout(() => {
      switchUser(id)
      setSwitchingTo(null)
      toast.success(`Switched to ${signedInAccounts.find(a => a.id === id)?.name ?? "account"}.`)
    }, 350)
  }

  const handleLogout = (id: string) => {
    const name = signedInAccounts.find(a => a.id === id)?.name ?? "account"
    logout(id)
    // if we logged out the active user, redirect to auth
    if (activeUser?.id === id) {
      router.replace("/auth")
    } else {
      toast.success(`Signed out of ${name}.`)
    }
  }

  const handleLogoutAll = () => {
    logoutAll()
    router.replace("/auth")
  }

  const connectedPlatforms = ALL_PLATFORMS.filter(p => !!connectedAccounts[p])

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-bold text-2xl text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your accounts, connected shops, and preferences.</p>
      </div>

      {/* ── User accounts ──────────────────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-base">User Accounts</CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-0.5">
                Signed-in accounts — switch between them or sign out individually.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-border h-8"
                onClick={() => router.push("/auth")}
              >
                <LogIn className="w-3.5 h-3.5" />
                Add account
              </Button>
              {signedInAccounts.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 text-xs text-muted-foreground hover:text-destructive h-8"
                  onClick={() => setConfirmLogoutAll(true)}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out all
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-3">
          {signedInAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No accounts signed in.{" "}
              <button onClick={() => router.push("/auth")} className="text-primary hover:underline">
                Log in or sign up
              </button>
            </div>
          ) : (
            signedInAccounts.map(account => {
              const isActive    = account.id === activeUser?.id
              const isSwitching = switchingTo === account.id
              return (
                <div
                  key={account.id}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-4 py-3 transition-colors",
                    isActive ? "border-primary/50 bg-primary/5" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold font-display",
                      isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    )}>
                      {account.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{account.name}</p>
                        <span className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide",
                          ROLE_COLORS[account.role]
                        )}>
                          {account.role}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{account.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <div className="flex items-center gap-1.5 text-primary text-xs font-medium">
                        <Check className="w-3.5 h-3.5" />
                        Active
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground text-xs h-7 px-3"
                        disabled={isSwitching}
                        onClick={() => handleSwitchAccount(account.id)}
                      >
                        {isSwitching ? (
                          <span className="flex items-center gap-1.5">
                            <UserCircle2 className="w-3.5 h-3.5 animate-pulse" />
                            Switching…
                          </span>
                        ) : "Switch"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                      onClick={() => handleLogout(account.id)}
                      title={`Sign out of ${account.name}`}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="sr-only">Sign out of {account.name}</span>
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* ── App branding ───────────────────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base">App</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold font-display text-sm">OS</span>
            </div>
            <div>
              <p className="font-display font-bold text-lg text-foreground">OrdoSell</p>
              <p className="text-xs text-muted-foreground">Multi-channel marketplace listing platform</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Connected accounts ──────────────��──────────────── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base">Connected Shops</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {connectedPlatforms.length}/4 platforms connected
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {ALL_PLATFORMS.map(p => {
            const meta      = PLATFORM_META[p]
            const account   = connectedAccounts[p]
            const isConnected = !!account

            const getAccountLabel = () => {
              if (!account) return null
              const creds = account.credentials as Record<string, string>
              return creds.sellerId || creds.appId || creds.apiKey || creds.email || "Connected"
            }

            return (
              <div key={p} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: meta.color }}
                  >
                    <span className="text-white font-bold text-xs">{meta.abbr}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{meta.label}</p>
                    {isConnected ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                        <span className="text-xs text-primary font-mono">{getAccountLabel()}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={meta.devLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" className="px-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="sr-only">Developer portal</span>
                    </Button>
                  </a>
                  {isConnected && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1.5"
                      onClick={() => setConfirmDisconnect(p)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Disconnect
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ── Notifications ──────────────────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base">Notifications</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Receive email alerts when a sale is made on any connected platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="salesEmail">Sales Alert Email</Label>
            <Input
              id="salesEmail"
              type="email"
              placeholder="you@example.com"
              value={emailValue}
              onChange={e => { setEmailValue(e.target.value); setEmailError("") }}
            />
            {emailError && <p className="text-destructive text-xs">{emailError}</p>}
            <p className="text-muted-foreground text-xs">
              You'll receive a notification whenever a listing sells on any connected marketplace.
            </p>
          </div>
          <Separator className="bg-border" />
          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications}>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>

      {/* Sign out all confirmation */}
      <AlertDialog open={confirmLogoutAll} onOpenChange={open => !open && setConfirmLogoutAll(false)}>
        <AlertDialogContent className="bg-card text-card-foreground border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Sign out of all accounts?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              You will be signed out of all {signedInAccounts.length} accounts and redirected to the login screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary text-foreground border-border hover:bg-secondary/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
              onClick={handleLogoutAll}
            >
              Sign out all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disconnect confirmation */}
      <AlertDialog open={!!confirmDisconnect} onOpenChange={open => !open && setConfirmDisconnect(null)}>
        <AlertDialogContent className="bg-card text-card-foreground border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Disconnect {confirmDisconnect ? PLATFORM_META[confirmDisconnect].label : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will remove your saved credentials. You can reconnect at any time from the Dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary text-foreground border-border hover:bg-secondary/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
              onClick={() => confirmDisconnect && handleDisconnect(confirmDisconnect)}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
