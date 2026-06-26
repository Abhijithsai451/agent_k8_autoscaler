"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { SignInForm } from "@/components/SignInForm"
import { useMounted } from "@/hooks/useMounted"
import { getToken } from "@/lib/auth"

export default function Home() {
  const router = useRouter()
  const mounted = useMounted()
  const token = mounted ? getToken() : null

  useEffect(() => {
    if (mounted && token) router.replace("/dashboard")
  }, [mounted, token, router])

  if (!mounted || token) return null
  return <SignInForm />
}
