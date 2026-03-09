"use client"

import { useState } from "react"
import {
  Truck, Package, CheckCircle2, AlertTriangle, Clock,
  MapPin, Search, ChevronDown, ChevronUp, Plus, X,
  ExternalLink,
} from "lucide-react"
import { useApp } from "@/context/app-context"
import type { Shipment, ShipmentStatus, Platform } from "@/context/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ShipmentStatus, { label: string; color: string; icon: React.ElementType }> = {
  label_created:     { label: "Label Created",     color: "text-muted-foreground bg-muted/40 border-muted",        icon: Package },
  collected:         { label: "Collected",          color: "text-blue-300 bg-blue-900/30 border-blue-700/40",       icon: Truck },
  in_transit:        { label: "In Transit",         color: "text-yellow-300 bg-yellow-900/30 border-yellow-700/40", icon: Truck },
  out_for_delivery:  { label: "Out for Delivery",   color: "text-primary bg-primary/10 border-primary/30",          icon: Truck },
  delivered:         { label: "Delivered",          color: "text-green-300 bg-green-900/30 border-green-700/40",    icon: CheckCircle2 },
  exception:         { label: "Exception",          color: "text-red-300 bg-red-900/30 border-red-700/40",          icon: AlertTriangle },
}

const STATUS_ORDER: ShipmentStatus[] = [
  "label_created", "collected", "in_transit", "out_for_delivery", "delivered",
]

const PLATFORM_COLORS: Record<Platform, string> = {
  amazon: "bg-yellow-900/40 text-yellow-300 border-yellow-700/40",
  ebay:   "bg-blue-900/40 text-blue-300 border-blue-700/40",
  etsy:   "bg-orange-900/40 text-orange-300 border-orange-700/40",
  shopify: "bg-green-900/40 text-green-300 border-green-700/40",
}

const CARRIERS = ["Royal Mail", "DPD", "DHL", "Evri", "Hermes", "UPS", "FedEx", "Yodel", "Parcelforce"]
const PLATFORMS: Platform[] = ["amazon", "ebay", "etsy", "shopify"]

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}
function fmtDateTime(d: Date) {
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ShipmentStatus }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border", cfg.color)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

function TrackingTimeline({ events, currentStatus }: { events: Shipment["events"]; currentStatus: ShipmentStatus }) {
  const isException = currentStatus === "exception"

  return (
    <div className="mt-4">
      {/* Progress bar (non-exception) */}
      {!isException && (
        <div className="flex items-center gap-0 mb-6">
          {STATUS_ORDER.map((s, i) => {
            const reached = STATUS_ORDER.indexOf(currentStatus) >= i
            const isCurrent = s === currentStatus
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors text-xs",
                  reached
                    ? isCurrent
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-primary/20 border-primary/50 text-primary"
                    : "bg-muted/20 border-border text-muted-foreground"
                )}>
                  {(() => { const Icon = STATUS_CONFIG[s].icon; return <Icon className="w-3 h-3" /> })()}
                </div>
                {i < STATUS_ORDER.length - 1 && (
                  <div className={cn(
                    "h-0.5 flex-1 mx-1 rounded transition-colors",
                    STATUS_ORDER.indexOf(currentStatus) > i ? "bg-primary/50" : "bg-border"
                  )} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Event log */}
      <div className="flex flex-col gap-3">
        {[...events].reverse().map((ev, i) => {
          const cfg = STATUS_CONFIG[ev.status]
          const Icon = cfg.icon
          return (
            <div key={i} className="flex gap-3">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 border mt-0.5", cfg.color)}>
                <Icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{ev.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">{ev.location}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">{fmtDateTime(ev.timestamp)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ShipmentCard({ shipment, onClick }: { shipment: Shipment; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left"
    >
      <Card className={cn(
        "bg-card border-border hover:border-primary/40 transition-colors cursor-pointer",
        shipment.status === "exception" && "border-red-700/40"
      )}>
        <CardContent className="px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">{shipment.orderId}</span>
                <span className={cn("text-[11px] font-semibold px-1.5 py-0.5 rounded border capitalize", PLATFORM_COLORS[shipment.platform])}>
                  {shipment.platform}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground mt-1 truncate">{shipment.listingTitle}</p>
              <p className="text-xs text-muted-foreground">Buyer: {shipment.buyer}</p>
            </div>
            <StatusBadge status={shipment.status} />
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3 h-3" />
              {shipment.carrier}
            </span>
            <span className="font-mono">{shipment.trackingNumber}</span>
            <span className="ml-auto">
              {shipment.status === "delivered"
                ? `Delivered ${fmtDate(shipment.events.at(-1)!.timestamp)}`
                : `Est. ${fmtDate(shipment.estimatedDelivery)}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </button>
  )
}

// ── Add Shipment Form ──────────────────────────────────────────────────────

const EMPTY_FORM = {
  orderId: "", listingTitle: "", buyer: "", platform: "" as Platform | "",
  carrier: "", trackingNumber: "", estimatedDelivery: "",
}

function AddShipmentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addShipment } = useApp()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({})

  const set = (k: keyof typeof EMPTY_FORM, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: "" }))
  }

  const validate = () => {
    const e: Partial<typeof EMPTY_FORM> = {}
    if (!form.orderId.trim())         e.orderId        = "Required"
    if (!form.listingTitle.trim())     e.listingTitle   = "Required"
    if (!form.buyer.trim())            e.buyer          = "Required"
    if (!form.platform)                e.platform       = "Required"
    if (!form.carrier)                 e.carrier        = "Required"
    if (!form.trackingNumber.trim())   e.trackingNumber = "Required"
    if (!form.estimatedDelivery)       e.estimatedDelivery = "Required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const now = new Date()
    addShipment({
      orderId: form.orderId,
      listingTitle: form.listingTitle,
      buyer: form.buyer,
      platform: form.platform as Platform,
      carrier: form.carrier,
      trackingNumber: form.trackingNumber,
      status: "label_created",
      shippedAt: now,
      estimatedDelivery: new Date(form.estimatedDelivery),
      events: [
        { status: "label_created", location: "—", timestamp: now, description: "Shipping label created" },
      ],
    })
    toast.success(`Shipment ${form.orderId} added.`)
    setForm(EMPTY_FORM)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { setForm(EMPTY_FORM); setErrors({}); onClose() } }}>
      <DialogContent className="bg-card text-card-foreground border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add Shipment</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Enter the dispatch details to start tracking a new shipment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-1">
          {/* Order ID */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Order ID</Label>
            <Input value={form.orderId} onChange={e => set("orderId", e.target.value)}
              placeholder="ORD-12345" className="bg-secondary border-border text-foreground h-9 text-sm" />
            {errors.orderId && <p className="text-xs text-red-400">{errors.orderId}</p>}
          </div>
          {/* Platform */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Platform</Label>
            <Select value={form.platform} onValueChange={v => set("platform", v)}>
              <SelectTrigger className="bg-secondary border-border text-foreground h-9 text-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {PLATFORMS.map(p => (
                  <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.platform && <p className="text-xs text-red-400">{errors.platform}</p>}
          </div>
          {/* Listing title */}
          <div className="col-span-2 flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Listing Title</Label>
            <Input value={form.listingTitle} onChange={e => set("listingTitle", e.target.value)}
              placeholder="e.g. Vintage Leather Jacket" className="bg-secondary border-border text-foreground h-9 text-sm" />
            {errors.listingTitle && <p className="text-xs text-red-400">{errors.listingTitle}</p>}
          </div>
          {/* Buyer */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Buyer Name</Label>
            <Input value={form.buyer} onChange={e => set("buyer", e.target.value)}
              placeholder="Jamie R." className="bg-secondary border-border text-foreground h-9 text-sm" />
            {errors.buyer && <p className="text-xs text-red-400">{errors.buyer}</p>}
          </div>
          {/* Carrier */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Carrier</Label>
            <Select value={form.carrier} onValueChange={v => set("carrier", v)}>
              <SelectTrigger className="bg-secondary border-border text-foreground h-9 text-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {CARRIERS.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.carrier && <p className="text-xs text-red-400">{errors.carrier}</p>}
          </div>
          {/* Tracking number */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Tracking Number</Label>
            <Input value={form.trackingNumber} onChange={e => set("trackingNumber", e.target.value)}
              placeholder="RM491028374GB" className="bg-secondary border-border text-foreground h-9 text-sm font-mono" />
            {errors.trackingNumber && <p className="text-xs text-red-400">{errors.trackingNumber}</p>}
          </div>
          {/* Est. delivery */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Est. Delivery</Label>
            <Input type="date" value={form.estimatedDelivery} onChange={e => set("estimatedDelivery", e.target.value)}
              className="bg-secondary border-border text-foreground h-9 text-sm" />
            {errors.estimatedDelivery && <p className="text-xs text-red-400">{errors.estimatedDelivery}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" className="text-muted-foreground" onClick={() => { setForm(EMPTY_FORM); setErrors({}); onClose() }}>
            Cancel
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSubmit}>
            Add Shipment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: "all",              label: "All" },
  { value: "label_created",    label: "Label Created" },
  { value: "collected",        label: "Collected" },
  { value: "in_transit",       label: "In Transit" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered",        label: "Delivered" },
  { value: "exception",        label: "Exception" },
]

export default function DispatchPage() {
  const { shipments } = useApp()
  const [search,        setSearch]        = useState("")
  const [statusFilter,  setStatusFilter]  = useState<string>("all")
  const [platformFilter,setPlatformFilter]= useState<string>("all")
  const [selected,      setSelected]      = useState<Shipment | null>(null)
  const [addOpen,       setAddOpen]       = useState(false)

  const filtered = shipments.filter(s => {
    const matchStatus   = statusFilter   === "all" || s.status   === statusFilter
    const matchPlatform = platformFilter === "all" || s.platform === platformFilter
    const q = search.toLowerCase()
    const matchSearch   = !q ||
      s.orderId.toLowerCase().includes(q) ||
      s.listingTitle.toLowerCase().includes(q) ||
      s.buyer.toLowerCase().includes(q) ||
      s.trackingNumber.toLowerCase().includes(q)
    return matchStatus && matchPlatform && matchSearch
  })

  // Summary counts
  const counts = {
    active:    shipments.filter(s => !["delivered","exception"].includes(s.status)).length,
    delivered: shipments.filter(s => s.status === "delivered").length,
    exception: shipments.filter(s => s.status === "exception").length,
    total:     shipments.length,
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dispatch</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track packages shipped to your customers</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Shipment
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active",    value: counts.active,    color: "text-primary" },
          { label: "Delivered", value: counts.delivered, color: "text-green-400" },
          { label: "Exception", value: counts.exception, color: "text-red-400" },
          { label: "Total",     value: counts.total,     color: "text-foreground" },
        ].map(c => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="px-5 py-4">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className={cn("text-3xl font-display font-bold mt-0.5", c.color)}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by order, title, buyer or tracking no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border text-foreground h-9 text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-secondary border-border text-foreground h-9 text-sm w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            {STATUS_FILTERS.map(f => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="bg-secondary border-border text-foreground h-9 text-sm w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            <SelectItem value="all">All Platforms</SelectItem>
            {PLATFORMS.map(p => (
              <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Shipment list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
          <Truck className="w-10 h-10 opacity-30" />
          <p className="text-sm">No shipments match your filters.</p>
          <Button variant="ghost" className="text-primary text-sm" onClick={() => { setSearch(""); setStatusFilter("all"); setPlatformFilter("all") }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(s => (
            <ShipmentCard key={s.id} shipment={s} onClick={() => setSelected(s)} />
          ))}
        </div>
      )}

      {/* Shipment detail dialog */}
      <Dialog open={!!selected} onOpenChange={v => { if (!v) setSelected(null) }}>
        {selected && (
          <DialogContent className="bg-card text-card-foreground border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <DialogTitle className="font-display text-base">
                  {selected.listingTitle}
                </DialogTitle>
                <StatusBadge status={selected.status} />
              </div>
              <DialogDescription className="sr-only">
                Tracking details for order {selected.orderId}
              </DialogDescription>
            </DialogHeader>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-1 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Order</p>
                <p className="font-mono text-foreground">{selected.orderId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Platform</p>
                <span className={cn("inline-block text-[11px] font-semibold px-2 py-0.5 rounded border capitalize mt-0.5", PLATFORM_COLORS[selected.platform])}>
                  {selected.platform}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Buyer</p>
                <p className="text-foreground">{selected.buyer}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Carrier</p>
                <p className="text-foreground">{selected.carrier}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Tracking Number</p>
                <p className="font-mono text-foreground text-sm flex items-center gap-2">
                  {selected.trackingNumber}
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Shipped</p>
                <p className="text-foreground">{fmtDate(selected.shippedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {selected.status === "delivered" ? "Delivered" : "Est. Delivery"}
                </p>
                <p className="text-foreground">{fmtDate(selected.estimatedDelivery)}</p>
              </div>
            </div>

            <div className="border-t border-border mt-3 pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tracking History</p>
              <TrackingTimeline events={selected.events} currentStatus={selected.status} />
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Add shipment dialog */}
      <AddShipmentDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
