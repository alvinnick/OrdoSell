import { AppProvider } from "@/context/app-context"
import { AuthGuard } from "@/components/auth/auth-guard"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { TopNavbar } from "@/components/layout/top-navbar"
import { Toaster } from "@/components/ui/sonner"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthGuard>
        <div className="flex min-h-screen bg-background">
          <SidebarNav />
          <div className="flex flex-col flex-1 min-w-0">
            <TopNavbar />
            <main className="flex-1 overflow-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
        <Toaster richColors position="top-right" />
      </AuthGuard>
    </AppProvider>
  )
}
