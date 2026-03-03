"use client"

import { useState } from "react"
import { CheckCircle2, Circle, ExternalLink } from "lucide-react"
import { useApp } from "@/context/app-context"
import type { Platform } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AmazonModal } from "@/components/modals/amazon-modal"
import { EbayModal } from "@/components/modals/ebay-modal"
import { EtsyModal } from "@/components/modals/etsy-modal"
import { VintedModal } from "@/components/modals/vinted-modal"

const PLATFORMS: {
  id: Platform
  label: string
  color: string
  textColor: string
  description: string
  devLink: string
  abbr: string
}[] = [
  {
    id: "amazon",
    label: "Amazon",
    color: "#FF9900",
    textColor: "#000",
    abbr: "AMZ",
    description: "Sell on the world's largest marketplace via SP-API.",
    devLink: "https://sellercentral.amazon.com/apps/manage",
  },
  {
    id: "ebay",
    label: "eBay",
    color: "#E53238",
    textColor: "#fff",
    abbr: "eBay",
    description: "List items for auction or fixed-price on eBay.",
    devLink: "https://developer.ebay.com",
  },
  {
    id: "etsy",
    label: "Etsy",
    color: "#F56400",
    textColor: "#fff",
    abbr: "Etsy",
    description: "Reach millions of buyers looking for handmade & unique items.",
    devLink: "https://www.etsy.com/developers",
  },
  {
    id: "vinted",
    label: "Vinted",
    color: "#09B1BA",
    textColor: "#fff",
    abbr: "V",
    description: "Second-hand fashion marketplace. API access via partnership.",
    devLink: "https://www.vinted.com",
  },
]

export default function DashboardPage() {
  const { connectedAccounts } = useApp()
  const [openModal, setOpenModal] = useState<Platform | null>(null)

  const connectedCount = Object.keys(connectedAccounts).length

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-bold text-2xl text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Manage your marketplace connections. <span className="text-primary font-medium">{connectedCount}/4 Connected</span>
        </p>
      </div>

      {/* Connection counter */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${i < connectedCount ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {connectedCount === 0
            ? "No platforms connected yet. Connect at least one to start listing."
            : connectedCount === 4
            ? "All platforms connected. You're ready to list everywhere."
            : `${connectedCount} of 4 platforms connected.`}
        </p>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLATFORMS.map(p => {
          const account = connectedAccounts[p.id]
          const isConnected = !!account

          const getAccountLabel = () => {
            if (!account) return null
            const creds = account.credentials as Record<string, string>
            return creds.sellerId || creds.appId || creds.apiKey || creds.email || "Connected"
          }

          return (
            <Card key={p.id} className="bg-card border-border relative overflow-hidden">
              {isConnected && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      <span
                        className="font-bold text-xs"
                        style={{ color: p.textColor }}
                      >
                        {p.abbr}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base font-display font-semibold">{p.label}</CardTitle>
                      {isConnected ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                          <span className="text-xs text-primary font-medium">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Circle className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Not connected</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={isConnected ? "default" : "secondary"}
                    className={isConnected ? "bg-primary/20 text-primary border-primary/30 text-xs" : "text-xs"}
                  >
                    {isConnected ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </CardDescription>

                {isConnected && (
                  <div className="rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground font-mono truncate">
                    {getAccountLabel()}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isConnected ? "secondary" : "default"}
                    className="flex-1"
                    onClick={() => setOpenModal(p.id)}
                  >
                    {isConnected ? "Reconnect" : "Connect"}
                  </Button>
                  <a href={p.devLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" className="px-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="sr-only">Developer portal</span>
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modals */}
      <AmazonModal open={openModal === "amazon"} onOpenChange={v => !v && setOpenModal(null)} />
      <EbayModal open={openModal === "ebay"} onOpenChange={v => !v && setOpenModal(null)} />
      <EtsyModal open={openModal === "etsy"} onOpenChange={v => !v && setOpenModal(null)} />
      <VintedModal open={openModal === "vinted"} onOpenChange={v => !v && setOpenModal(null)} />
    </div>
  )
}
