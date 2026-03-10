"use client"

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import type { Platform } from "@/context/app-context"

const PLATFORM_LABELS: Record<Platform, string> = {
  amazon: "Amazon",
  ebay: "eBay",
  etsy: "Etsy",
  shopify: "Shopify",
}

const PLATFORM_COLORS: Record<Platform, string> = {
  amazon: "#FF9900",
  ebay: "#E53238",
  etsy: "#F56400",
  shopify: "#96BF48",
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  price: string
  currency: string
  platforms: Platform[]
  onConfirm: () => void
}

export function PublishConfirmModal({ open, onOpenChange, title, price, currency, platforms, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Confirm Publish</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Review the details before publishing your listing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div className="rounded-lg bg-secondary p-4 flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground truncate">{title || "Untitled Listing"}</p>
            <p className="text-xs text-muted-foreground">
              {currency} {parseFloat(price || "0").toFixed(2)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Publishing to</p>
            <div className="flex flex-col gap-2">
              {platforms.map(p => (
                <div key={p} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PLATFORM_COLORS[p] }}
                  />
                  <span className="text-sm text-foreground">{PLATFORM_LABELS[p]}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary ml-auto" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={onConfirm}>Publish Now</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
