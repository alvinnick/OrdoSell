"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

export type Platform = "amazon" | "ebay" | "etsy" | "shopify"

export interface AmazonCredentials {
  sellerId: string
  mwsAuthToken: string
  awsAccessKeyId: string
  awsSecretAccessKey: string
  marketplaceId: string
  refreshToken: string
}

export interface EbayCredentials {
  appId: string
  certId: string
  devId: string
  userAuthToken: string
  environment: "sandbox" | "production"
}

export interface EtsyCredentials {
  apiKey: string
  sharedSecret: string
  oauthAccessToken: string
  oauthAccessTokenSecret: string
  shopId: string
}

export interface ShopifyCredentials {
  storeName: string
  apiKey: string
  apiSecretKey: string
  accessToken: string
}

export type PlatformCredentials =
  | AmazonCredentials
  | EbayCredentials
  | EtsyCredentials
  | ShopifyCredentials

export interface ConnectedAccount {
  platform: Platform
  credentials: PlatformCredentials
  connectedAt: Date
}

export type ListingStatus = "pending" | "live" | "failed"

export interface Sale {
  id: string
  listingId: string
  platform: Platform
  amount: number
  currency: string
  soldAt: Date
}

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: string
  quantity: number
  condition: string
  category: string
  images: string[]
  weight: string
  dimensions: string
  sku: string
  tags: string
  brand: string
  freeShipping: boolean
  shippingAmount: string
  platforms: Platform[]
  status: ListingStatus
  createdAt: Date
}

export type ShipmentStatus =
  | "label_created"
  | "collected"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception"

export interface TrackingEvent {
  status: ShipmentStatus
  location: string
  timestamp: Date
  description: string
}

export interface Shipment {
  id: string
  orderId: string
  listingTitle: string
  buyer: string
  platform: Platform
  carrier: string
  trackingNumber: string
  status: ShipmentStatus
  estimatedDelivery: Date
  shippedAt: Date
  events: TrackingEvent[]
}

export interface NotificationPreferences {
  salesAlertEmail: string
}

interface AppContextType {
  connectedAccounts: Partial<Record<Platform, ConnectedAccount>>
  connectAccount: (platform: Platform, credentials: PlatformCredentials) => void
  disconnectAccount: (platform: Platform) => void
  listings: Listing[]
  addListing: (listing: Omit<Listing, "id" | "createdAt" | "status">) => void
  sales: Sale[]
  shipments: Shipment[]
  addShipment: (s: Omit<Shipment, "id">) => void
  notificationPrefs: NotificationPreferences
  setNotificationPrefs: (prefs: NotificationPreferences) => void
  isDark: boolean
  toggleDark: () => void
}

const AppContext = createContext<AppContextType | null>(null)

// Deterministic LCG pseudo-random number generator so server and client
// produce identical values — avoids React hydration mismatches.
function makePrng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function generateSeedSales(): Sale[] {
  const rand = makePrng(42)
  const platforms: Platform[] = ["amazon", "ebay", "etsy", "shopify"]
  // Fixed anchor: 2026-03-02 00:00:00 UTC — never changes
  const anchor = new Date("2026-03-02T00:00:00.000Z").getTime()
  const sales: Sale[] = []
  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(rand() * 90)
    const soldAt = new Date(anchor - daysAgo * 86400000)
    const amount = parseFloat((rand() * 120 + 5).toFixed(2))
    sales.push({
      id: `seed-${i}`,
      listingId: `seed-listing-${i % 12}`,
      platform: platforms[i % 4],
      amount,
      currency: "GBP",
      soldAt,
    })
  }
  return sales
}

const SEED_SHIPMENTS: Shipment[] = [
  {
    id: "shp-1",
    orderId: "ORD-20482",
    listingTitle: "Vintage Leather Jacket",
    buyer: "Jamie R.",
    platform: "ebay",
    carrier: "Royal Mail",
    trackingNumber: "RM491028374GB",
    status: "in_transit",
    shippedAt: new Date("2026-02-28T09:15:00Z"),
    estimatedDelivery: new Date("2026-03-04T18:00:00Z"),
    events: [
      { status: "label_created",    location: "London, UK",       timestamp: new Date("2026-02-27T14:00:00Z"), description: "Shipping label created" },
      { status: "collected",        location: "London, UK",       timestamp: new Date("2026-02-28T09:15:00Z"), description: "Parcel collected by carrier" },
      { status: "in_transit",       location: "Midlands Hub, UK", timestamp: new Date("2026-03-01T03:42:00Z"), description: "Arrived at sorting facility" },
    ],
  },
  {
    id: "shp-2",
    orderId: "ORD-20491",
    listingTitle: "Handmade Ceramic Mug Set",
    buyer: "Casey T.",
    platform: "etsy",
    carrier: "DPD",
    trackingNumber: "DPD15609284730",
    status: "out_for_delivery",
    shippedAt: new Date("2026-02-27T11:00:00Z"),
    estimatedDelivery: new Date("2026-03-03T18:00:00Z"),
    events: [
      { status: "label_created",       location: "Bristol, UK",      timestamp: new Date("2026-02-26T10:00:00Z"), description: "Shipping label created" },
      { status: "collected",           location: "Bristol, UK",      timestamp: new Date("2026-02-27T11:00:00Z"), description: "Parcel collected by carrier" },
      { status: "in_transit",          location: "Bristol Hub, UK",  timestamp: new Date("2026-02-28T02:10:00Z"), description: "In transit to destination" },
      { status: "out_for_delivery",    location: "Manchester, UK",   timestamp: new Date("2026-03-03T07:30:00Z"), description: "Out for delivery" },
    ],
  },
  {
    id: "shp-3",
    orderId: "ORD-20455",
    listingTitle: "Retro Graphic Tee - XL",
    buyer: "Morgan S.",
    platform: "shopify",
    carrier: "Evri",
    trackingNumber: "EVR9920183746",
    status: "delivered",
    shippedAt: new Date("2026-02-20T14:00:00Z"),
    estimatedDelivery: new Date("2026-02-24T18:00:00Z"),
    events: [
      { status: "label_created",    location: "Leeds, UK",       timestamp: new Date("2026-02-19T16:00:00Z"), description: "Shipping label created" },
      { status: "collected",        location: "Leeds, UK",       timestamp: new Date("2026-02-20T14:00:00Z"), description: "Parcel collected by carrier" },
      { status: "in_transit",       location: "National Hub",    timestamp: new Date("2026-02-21T04:00:00Z"), description: "In transit" },
      { status: "out_for_delivery", location: "Edinburgh, UK",   timestamp: new Date("2026-02-24T08:00:00Z"), description: "Out for delivery" },
      { status: "delivered",        location: "Edinburgh, UK",   timestamp: new Date("2026-02-24T13:22:00Z"), description: "Delivered — left with neighbour" },
    ],
  },
  {
    id: "shp-4",
    orderId: "ORD-20510",
    listingTitle: "Wireless Mechanical Keyboard",
    buyer: "Taylor K.",
    platform: "amazon",
    carrier: "DHL",
    trackingNumber: "DHL5500293847",
    status: "label_created",
    shippedAt: new Date("2026-03-02T16:00:00Z"),
    estimatedDelivery: new Date("2026-03-06T18:00:00Z"),
    events: [
      { status: "label_created", location: "Birmingham, UK", timestamp: new Date("2026-03-02T16:00:00Z"), description: "Shipping label created, awaiting collection" },
    ],
  },
  {
    id: "shp-5",
    orderId: "ORD-20388",
    listingTitle: "Stainless Steel Water Bottle",
    buyer: "Jordan P.",
    platform: "ebay",
    carrier: "Royal Mail",
    trackingNumber: "RM882756103GB",
    status: "exception",
    shippedAt: new Date("2026-02-18T10:00:00Z"),
    estimatedDelivery: new Date("2026-02-22T18:00:00Z"),
    events: [
      { status: "label_created", location: "London, UK",    timestamp: new Date("2026-02-17T09:00:00Z"), description: "Shipping label created" },
      { status: "collected",     location: "London, UK",    timestamp: new Date("2026-02-18T10:00:00Z"), description: "Parcel collected" },
      { status: "in_transit",    location: "National Hub",  timestamp: new Date("2026-02-19T03:00:00Z"), description: "In transit" },
      { status: "exception",     location: "Cardiff, UK",   timestamp: new Date("2026-02-21T11:45:00Z"), description: "Delivery attempted — address issue. Action required." },
    ],
  },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [connectedAccounts, setConnectedAccounts] = useState<Partial<Record<Platform, ConnectedAccount>>>({})
  const [listings, setListings] = useState<Listing[]>([])
  const [sales] = useState<Sale[]>(generateSeedSales)
  const [shipments, setShipments] = useState<Shipment[]>(SEED_SHIPMENTS)
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({ salesAlertEmail: "" })
  const [isDark, setIsDark] = useState(false)

  const connectAccount = (platform: Platform, credentials: PlatformCredentials) => {
    setConnectedAccounts(prev => ({
      ...prev,
      [platform]: { platform, credentials, connectedAt: new Date() },
    }))
  }

  const disconnectAccount = (platform: Platform) => {
    setConnectedAccounts(prev => {
      const next = { ...prev }
      delete next[platform]
      return next
    })
  }

  const addShipment = (s: Omit<Shipment, "id">) => {
    setShipments(prev => [{ ...s, id: crypto.randomUUID() }, ...prev])
  }

  const addListing = (listing: Omit<Listing, "id" | "createdAt" | "status">) => {
    const newListing: Listing = {
      ...listing,
      id: crypto.randomUUID(),
      status: "pending",
      createdAt: new Date(),
    }
    setListings(prev => [newListing, ...prev])
  }

  const toggleDark = () => {
    setIsDark(prev => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      return next
    })
  }

  return (
    <AppContext.Provider
      value={{
        connectedAccounts,
        connectAccount,
        disconnectAccount,
        listings,
        addListing,
        sales,
        shipments,
        addShipment,
        notificationPrefs,
        setNotificationPrefs,
        isDark,
        toggleDark,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
