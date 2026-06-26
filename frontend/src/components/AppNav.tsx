"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Boxes, LogOut } from "lucide-react"

import { HealthDot } from "@/components/HealthDot"
import { Button } from "@/components/ui/button"
import { useMounted } from "@/hooks/useMounted"
import { getUserId, signOut } from "@/lib/auth"
import { cn } from "@/lib/utils"

export function AppNav() {
  const router = useRouter()
  const pathname = usePathname()
  const mounted = useMounted()
  const userId = mounted ? getUserId() : null

  function handleSignOut() {
    signOut()
    router.push("/")
  }

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Boxes className="size-5" />
          <span>kron</span>
          <span className="text-muted-foreground text-xs font-normal">
            agent control plane
          </span>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <HealthDot />
          {userId && (
            <nav className="flex items-center gap-1">
              <NavLink href="/dashboard" active={pathname === "/dashboard"}>
                Dashboard
              </NavLink>
              <NavLink href="/connections" active={pathname === "/connections"}>
                Connections
              </NavLink>
              <span className="text-muted-foreground mx-2 hidden sm:inline">
                {userId}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="size-4" />
                Sign out
              </Button>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 transition-colors hover:bg-muted",
        active ? "text-foreground font-medium" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  )
}
