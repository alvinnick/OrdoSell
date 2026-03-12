"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusSquare, List, BarChart2, Truck, Settings, Store } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard",      label: "Dashboard",      icon: LayoutDashboard },
  { href: "/create-listing", label: "Create Listing", icon: PlusSquare },
  { href: "/listings",       label: "My Listings",    icon: List },
  { href: "/stores",         label: "Stores",         icon: Store },
  { href: "/dispatch",       label: "Dispatch",       icon: Truck },
  { href: "/reports",        label: "Reports",        icon: BarChart2 },
  { href: "/settings",       label: "Settings",       icon: Settings },
]

export function MobileSidebarNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold font-display">OS</span>
        </div>
        <span className="text-sidebar-foreground font-display font-bold text-lg tracking-tight">OrdoSell</span>
      </div>
      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
