"use client"

import { useMemo, useState } from "react"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts"
import { TrendingUp, ShoppingBag, DollarSign, Store, CalendarDays, ChevronDown } from "lucide-react"
import { useApp } from "@/context/app-context"
import type { Platform, Sale } from "@/context/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

type QuickFilter = "7d" | "30d" | "90d" | "mtd" | "ytd" | "custom"

const QUICK_FILTERS: { label: string; value: QuickFilter }[] = [
  { label: "Last 7 days",   value: "7d" },
  { label: "Last 30 days",  value: "30d" },
  { label: "Last 90 days",  value: "90d" },
  { label: "Month to date", value: "mtd" },
  { label: "Year to date",  value: "ytd" },
  { label: "Custom range",  value: "custom" },
]

const PLATFORM_COLORS: Record<Platform, string> = {
  amazon: "#FF9900",
  ebay:   "#E53238",
  etsy:   "#F56400",
  vinted: "#09B1BA",
}

const PLATFORM_LABELS: Record<Platform, string> = {
  amazon: "Amazon",
  ebay:   "eBay",
  etsy:   "Etsy",
  vinted: "Vinted",
}

const ALL_PLATFORMS: Platform[] = ["amazon", "ebay", "etsy", "vinted"]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDateRange(filter: QuickFilter, customFrom: string, customTo: string): { from: Date; to: Date } {
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  if (filter === "7d") {
    const from = new Date(today); from.setDate(from.getDate() - 6); from.setHours(0, 0, 0, 0)
    return { from, to: today }
  }
  if (filter === "30d") {
    const from = new Date(today); from.setDate(from.getDate() - 29); from.setHours(0, 0, 0, 0)
    return { from, to: today }
  }
  if (filter === "90d") {
    const from = new Date(today); from.setDate(from.getDate() - 89); from.setHours(0, 0, 0, 0)
    return { from, to: today }
  }
  if (filter === "mtd") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from, to: today }
  }
  if (filter === "ytd") {
    const from = new Date(now.getFullYear(), 0, 1)
    return { from, to: today }
  }
  // custom
  const from = customFrom ? new Date(customFrom + "T00:00:00") : new Date(today.getTime() - 30 * 86400000)
  const to   = customTo   ? new Date(customTo   + "T23:59:59") : today
  return { from, to }
}

function filterSales(sales: Sale[], from: Date, to: Date, platforms: Platform[]): Sale[] {
  return sales.filter(s => {
    const d = new Date(s.soldAt)
    return d >= from && d <= to && (platforms.length === 0 || platforms.includes(s.platform))
  })
}

function groupByDay(
  sales: Sale[],
  from: Date,
  to: Date,
): { date: string; revenue: number; count: number }[] {
  const map = new Map<string, { revenue: number; count: number }>()

  // Determine bucket size based on span
  const spanDays = Math.round((to.getTime() - from.getTime()) / 86400000)
  const bucket: "day" | "week" | "month" = spanDays <= 31 ? "day" : spanDays <= 91 ? "week" : "month"

  const keyFor = (d: Date) => {
    if (bucket === "day")   return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    if (bucket === "week") {
      // ISO week start (Monday)
      const day  = d.getDay() === 0 ? 6 : d.getDay() - 1
      const mon  = new Date(d); mon.setDate(d.getDate() - day)
      return mon.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    }
    return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" })
  }

  // Pre-populate all buckets
  const cur = new Date(from)
  while (cur <= to) {
    map.set(keyFor(cur), { revenue: 0, count: 0 })
    if (bucket === "day")   cur.setDate(cur.getDate() + 1)
    else if (bucket === "week")  cur.setDate(cur.getDate() + 7)
    else cur.setMonth(cur.getMonth() + 1)
  }

  for (const sale of sales) {
    const key = keyFor(new Date(sale.soldAt))
    const entry = map.get(key)
    if (entry) {
      entry.revenue = parseFloat((entry.revenue + sale.amount).toFixed(2))
      entry.count  += 1
    }
  }

  return Array.from(map.entries()).map(([date, v]) => ({ date, ...v }))
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-foreground">£{payload[0].value.toFixed(2)}</p>
    </div>
  )
}

function SalesTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-foreground">{payload[0].value} sale{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ title, value, sub, icon: Icon, accent }: {
  title: string; value: string; sub: string; icon: React.ElementType; accent: string
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-display font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}20` }}>
            <Icon className="w-5 h-5" style={{ color: accent }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { sales } = useApp()

  // Time filter state
  const [quickFilter, setQuickFilter]   = useState<QuickFilter>("30d")
  const [customFrom,  setCustomFrom]    = useState("")
  const [customTo,    setCustomTo]      = useState("")
  const [showCustom,  setShowCustom]    = useState(false)

  // Platform filter state (empty = all)
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([])

  const { from, to } = useMemo(
    () => getDateRange(quickFilter, customFrom, customTo),
    [quickFilter, customFrom, customTo]
  )

  const filtered = useMemo(
    () => filterSales(sales, from, to, selectedPlatforms),
    [sales, from, to, selectedPlatforms]
  )

  const chartData = useMemo(() => groupByDay(filtered, from, to), [filtered, from, to])

  const totalRevenue  = useMemo(() => filtered.reduce((sum, s) => sum + s.amount, 0), [filtered])
  const totalSales    = filtered.length
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

  const platformBreakdown = useMemo(() => {
    const map = new Map<Platform, { revenue: number; count: number }>()
    for (const sale of filtered) {
      const e = map.get(sale.platform) ?? { revenue: 0, count: 0 }
      map.set(sale.platform, {
        revenue: parseFloat((e.revenue + sale.amount).toFixed(2)),
        count: e.count + 1,
      })
    }
    return ALL_PLATFORMS.map(p => ({
      platform: p,
      label:    PLATFORM_LABELS[p],
      color:    PLATFORM_COLORS[p],
      revenue:  map.get(p)?.revenue ?? 0,
      count:    map.get(p)?.count   ?? 0,
    }))
  }, [filtered])

  const bestPlatform = [...platformBreakdown].sort((a, b) => b.revenue - a.revenue)[0]

  const quickLabel = QUICK_FILTERS.find(f => f.value === quickFilter)?.label ?? "Custom range"

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const xInterval = chartData.length <= 14 ? 0 : chartData.length <= 31 ? 4 : 7

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Reports</h1>
          <p className="text-muted-foreground text-sm">Sales performance across your connected platforms</p>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Platform filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-border bg-secondary text-foreground gap-1.5 h-8 text-xs">
                <Store className="w-3.5 h-3.5" />
                {selectedPlatforms.length === 0
                  ? "All shops"
                  : selectedPlatforms.map(p => PLATFORM_LABELS[p]).join(", ")}
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border w-44">
              <DropdownMenuItem
                className="text-sm cursor-pointer"
                onClick={() => setSelectedPlatforms([])}
              >
                <span className={cn("mr-2 text-primary", selectedPlatforms.length === 0 ? "opacity-100" : "opacity-0")}>✓</span>
                All shops
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              {ALL_PLATFORMS.map(p => (
                <DropdownMenuItem
                  key={p}
                  className="text-sm cursor-pointer"
                  onClick={() => togglePlatform(p)}
                >
                  <span className={cn("mr-2", selectedPlatforms.includes(p) ? "text-primary" : "opacity-0")}>✓</span>
                  <span
                    className="w-2 h-2 rounded-full mr-1.5 shrink-0 inline-block"
                    style={{ backgroundColor: PLATFORM_COLORS[p] }}
                  />
                  {PLATFORM_LABELS[p]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Time cycle filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-border bg-secondary text-foreground gap-1.5 h-8 text-xs">
                <CalendarDays className="w-3.5 h-3.5" />
                {quickLabel}
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border w-44">
              {QUICK_FILTERS.map(({ label, value }) => (
                <DropdownMenuItem
                  key={value}
                  className="text-sm cursor-pointer"
                  onClick={() => {
                    setQuickFilter(value)
                    setShowCustom(value === "custom")
                  }}
                >
                  <span className={cn("mr-2 text-primary", quickFilter === value ? "opacity-100" : "opacity-0")}>✓</span>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Custom date range inputs */}
      {showCustom && (
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="from-date" className="text-xs text-muted-foreground">From</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={customFrom}
                  onChange={e => setCustomFrom(e.target.value)}
                  className="h-8 text-sm bg-secondary border-border w-40"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="to-date" className="text-xs text-muted-foreground">To</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={customTo}
                  onChange={e => setCustomTo(e.target.value)}
                  className="h-8 text-sm bg-secondary border-border w-40"
                />
              </div>
              <p className="text-xs text-muted-foreground self-center">
                Showing{" "}
                <span className="text-foreground font-medium">
                  {from.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {" "}—{" "}
                <span className="text-foreground font-medium">
                  {to.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`£${totalRevenue.toFixed(2)}`}
          sub="across selected platforms"
          icon={DollarSign}
          accent="var(--primary)"
        />
        <StatCard
          title="Total Sales"
          value={totalSales.toString()}
          sub="orders completed"
          icon={ShoppingBag}
          accent="#09B1BA"
        />
        <StatCard
          title="Avg. Order Value"
          value={`£${avgOrderValue.toFixed(2)}`}
          sub="per transaction"
          icon={TrendingUp}
          accent="#FF9900"
        />
        <StatCard
          title="Top Platform"
          value={totalSales > 0 ? bestPlatform.label : "—"}
          sub={totalSales > 0 ? `£${bestPlatform.revenue.toFixed(2)} revenue` : "No sales yet"}
          icon={Store}
          accent={totalSales > 0 ? bestPlatform.color : "var(--muted-foreground)"}
        />
      </div>

      {/* Revenue chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display font-semibold text-foreground">Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} interval={xInterval} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `£${v}`} />
              <Tooltip content={<RevenueTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sales volume chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display font-semibold text-foreground">Sales Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} interval={xInterval} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<SalesTooltip />} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill="var(--primary)" fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Platform breakdown */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display font-semibold text-foreground">Breakdown by Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {platformBreakdown.map(({ platform, label, color, revenue, count }) => {
              const pct = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
              const isFiltered = selectedPlatforms.length > 0 && !selectedPlatforms.includes(platform)
              return (
                <div key={platform} className={cn("flex flex-col gap-1.5 transition-opacity", isFiltered && "opacity-30")}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="font-medium text-foreground">{label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>{count} sale{count !== 1 ? "s" : ""}</span>
                      <span className="font-semibold text-foreground w-20 text-right">£{revenue.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
