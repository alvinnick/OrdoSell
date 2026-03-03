"use client"

import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Listing, Platform } from "@/context/app-context"

const STATUS_STYLES: Record<Listing["status"], string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  live: "bg-primary/20 text-primary border-primary/30",
  failed: "bg-destructive/20 text-red-300 border-destructive/30",
}

const PLATFORM_LABELS: Record<Platform, string> = {
  amazon: "Amazon",
  ebay: "eBay",
  etsy: "Etsy",
  vinted: "Vinted",
}

const PLATFORM_COLORS: Record<Platform, string> = {
  amazon: "#FF9900",
  ebay: "#E53238",
  etsy: "#F56400",
  vinted: "#09B1BA",
}

interface Props {
  listing: Listing | null
  onClose: () => void
}

export function ListingDetailModal({ listing, onClose }: Props) {
  if (!listing) return null

  return (
    <Dialog open={!!listing} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-lg leading-snug">{listing.title || "Untitled"}</DialogTitle>
          <DialogDescription className="sr-only">
            Full details for the listing: {listing.title || "Untitled"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-1">
          {/* Status & platforms */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`border text-xs ${STATUS_STYLES[listing.status]}`}>
              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </Badge>
            {listing.platforms.map(p => (
              <span
                key={p}
                className="text-xs px-2 py-0.5 rounded border"
                style={{ color: PLATFORM_COLORS[p], borderColor: `${PLATFORM_COLORS[p]}40`, backgroundColor: `${PLATFORM_COLORS[p]}15` }}
              >
                {PLATFORM_LABELS[p]}
              </span>
            ))}
          </div>

          <Separator className="bg-border" />

          {/* Main image */}
          {listing.images.length > 0 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full max-h-48 object-contain rounded-lg bg-secondary"
            />
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Price</p>
              <p className="font-medium">{listing.currency} {listing.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Quantity</p>
              <p className="font-medium">{listing.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Condition</p>
              <p className="font-medium">{listing.condition || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Brand</p>
              <p className="font-medium">{listing.brand || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">SKU</p>
              <p className="font-medium font-mono text-xs">{listing.sku || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Category</p>
              <p className="font-medium">{listing.category || "—"}</p>
            </div>
            {listing.weight && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Weight</p>
                <p className="font-medium">{listing.weight}</p>
              </div>
            )}
            {listing.dimensions && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Dimensions</p>
                <p className="font-medium">{listing.dimensions}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Shipping</p>
              <p className="font-medium">{listing.freeShipping ? "Free" : `${listing.currency} ${listing.shippingAmount}`}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Created</p>
              <p className="font-medium">{new Date(listing.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {listing.description && (
            <>
              <Separator className="bg-border" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground leading-relaxed">{listing.description}</p>
              </div>
            </>
          )}

          {listing.tags && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {listing.tags.split(",").map((t, i) => (
                  <span key={i} className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                    {t.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
