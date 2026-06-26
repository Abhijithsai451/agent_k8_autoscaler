"use client"

import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

type Health = "checking" | "ok" | "down"

const HEALTH_MS = 15000

const DOT: Record<Health, string> = {
  checking: "bg-zinc-300",
  ok: "bg-emerald-500",
  down: "bg-red-500",
}

const LABEL: Record<Health, string> = {
  checking: "Checking gateway...",
  ok: "Gateway reachable",
  down: "Gateway unreachable",
}

export function HealthDot() {
  const [health, setHealth] = useState<Health>("checking")

  useEffect(() => {
    let active = true

    const tick = () => {
      api
        .health()
        .then((res) => active && setHealth(res.status === "ok" ? "ok" : "down"))
        .catch(() => active && setHealth("down"))
    }

    tick()
    const timer = setInterval(tick, HEALTH_MS)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  return (
    <span className="flex items-center gap-1.5" title={LABEL[health]}>
      <span className={cn("size-2 rounded-full", DOT[health])} />
      <span className="text-muted-foreground hidden text-xs sm:inline">gateway</span>
    </span>
  )
}
