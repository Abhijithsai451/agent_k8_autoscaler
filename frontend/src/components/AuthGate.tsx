"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { useMounted } from "@/hooks/useMounted"
import { getToken } from "@/lib/auth"

// bounces to sign in when there's no token
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const mounted = useMounted()
  const token = mounted ? getToken() : null

  useEffect(() => {
    if (mounted && !token) router.replace("/")
  }, [mounted, token, router])

  if (!mounted || !token) return null
  return <>{children}</>
}
