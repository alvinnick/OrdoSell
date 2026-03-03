"use client"

import { Moon, Sun, Menu } from "lucide-react"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { MobileSidebarNav } from "./mobile-sidebar-nav"

export function TopNavbar() {
  const { isDark, toggleDark } = useApp()

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card shrink-0">
      {/* Mobile menu + logo */}
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-foreground">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60 bg-sidebar border-sidebar-border">
            <VisuallyHidden>
              <SheetTitle>Navigation menu</SheetTitle>
              <SheetDescription>Main navigation links for OrdoSell</SheetDescription>
            </VisuallyHidden>
            <MobileSidebarNav />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2 md:hidden">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold font-display">OS</span>
          </div>
          <span className="text-foreground font-display font-bold text-base tracking-tight">OrdoSell</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDark}
          className="text-foreground"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
