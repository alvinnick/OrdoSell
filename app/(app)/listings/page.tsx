"use client"

import { useState } from "react"
import Link from "next/link"
import { PlusSquare, Store as StoreIcon } from "lucide-react"
import { useApp } from "@/context/app-context"
import type { Listing, Platform } from "@/context/app-context"
import {
  STORE_CATEGORY_LABELS,
  STORE_CATEGORY_COLORS,
} from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ListingDetailModal } from "@/components/listings/listing-detail-modal"

const STATUS_STYLES: Record<Listing["status"], string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  live:    "bg-primary/20 text-primary border-primary/30",
  failed:  "bg-destructive/20 text-red-300 border-destructive/30",
}

const PLATFORM_COLORS: Record<Platform, string> = {
  amazon:  "#FF9900",
  ebay:    "#E53238",
  etsy:    "#F56400",
  shopify: "#96BF48",
}

const PLATFORM_ABBR: Record<Platform, string> = {
  amazon:  "AMZ",
  ebay:    "eBay",
  etsy:    "Etsy",
  shopify: "SHF",
}

export default function ListingsPage() {
  const { listings, stores } = useApp()
  const [selected, setSelected] = useState<Listing | null>(null)
  const [filterStore, setFilterStore] = useState<string>("all")

  const filteredListings =
    filterStore === "all"
      ? listings
      : filterStore === "unassigned"
      ? listings.filter(l => !l.storeId)
      : listings.filter(l => l.storeId === filterStore)

  const getStoreMeta = (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    if (!store) return null
    return {
      name: store.name,
      color: STORE_CATEGORY_COLORS[store.category],
      categoryLabel: STORE_CATEGORY_LABELS[store.category],
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">My Listings</h1>
          <p className="text-muted-foreground text-sm">
            {filteredListings.length} of {listings.length} listing{listings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Store filter */}
          <Select value={filterStore} onValueChange={setFilterStore}>
            <SelectTrigger className="w-48 bg-card border-border text-sm">
              <StoreIcon className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All stores" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All stores</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {stores.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Link href="/create-listing">
            <Button size="sm" className="gap-2">
              <PlusSquare className="w-4 h-4" />
              New Listing
            </Button>
          </Link>
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <PlusSquare className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                {listings.length === 0 ? "No listings yet" : "No listings match this filter"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {listings.length === 0
                  ? "Create your first listing to get started."
                  : "Try a different store filter above."}
              </p>
            </div>
            {listings.length === 0 && (
              <Link href="/create-listing">
                <Button>Create Listing</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Title</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Store</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Price</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Platforms</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Created</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map(listing => {
                  const storeMeta = listing.storeId ? getStoreMeta(listing.storeId) : null
                  return (
                    <TableRow key={listing.id} className="border-border hover:bg-secondary/50 transition-colors">
                      <TableCell className="font-medium max-w-[180px]">
                        <p className="truncate">{listing.title || "Untitled"}</p>
                        {listing.sku && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{listing.sku}</p>
                        )}
                      </TableCell>

                      <TableCell>
                        {storeMeta ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: storeMeta.color }}
                            />
                            <span className="text-xs text-foreground truncate max-w-[100px]">
                              {storeMeta.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
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
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <ListingDetailModal listing={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
