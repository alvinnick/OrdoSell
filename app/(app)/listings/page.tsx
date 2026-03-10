"use client"

import { useState } from "react"
import Link from "next/link"
import { PlusSquare } from "lucide-react"
import { useApp } from "@/context/app-context"
import type { Listing, Platform } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ListingDetailModal } from "@/components/listings/listing-detail-modal"

const STATUS_STYLES: Record<Listing["status"], string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  live: "bg-primary/20 text-primary border-primary/30",
  failed: "bg-destructive/20 text-red-300 border-destructive/30",
}

const PLATFORM_COLORS: Record<Platform, string> = {
  amazon: "#FF9900",
  ebay: "#E53238",
  etsy: "#F56400",
  shopify: "#96BF48",
}

const PLATFORM_ABBR: Record<Platform, string> = {
  amazon: "AMZ",
  ebay: "eBay",
  etsy: "Etsy",
  shopify: "SHF",
}

export default function ListingsPage() {
  const { listings } = useApp()
  const [selected, setSelected] = useState<Listing | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">My Listings</h1>
          <p className="text-muted-foreground text-sm">
            {listings.length} listing{listings.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/create-listing">
          <Button size="sm" className="gap-2">
            <PlusSquare className="w-4 h-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <PlusSquare className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">No listings yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first listing to get started.</p>
            </div>
            <Link href="/create-listing">
              <Button>Create Listing</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Title</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Price</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Platforms</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Created</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map(listing => (
                  <TableRow key={listing.id} className="border-border hover:bg-secondary/50 transition-colors">
                    <TableCell className="font-medium max-w-[200px]">
                      <p className="truncate">{listing.title || "Untitled"}</p>
                      {listing.sku && (
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{listing.sku}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {listing.currency} {listing.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {listing.platforms.map(p => (
                          <span
                            key={p}
                            className="text-xs px-1.5 py-0.5 rounded font-medium"
                            style={{
                              backgroundColor: `${PLATFORM_COLORS[p]}20`,
                              color: PLATFORM_COLORS[p],
                            }}
                          >
                            {PLATFORM_ABBR[p]}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border text-xs ${STATUS_STYLES[listing.status]}`}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelected(listing)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <ListingDetailModal listing={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
