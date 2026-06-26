"use client"

import { useCallback, useEffect, useState } from "react"

import { api } from "@/lib/api"
import { POLL_MS, isTerminal } from "@/lib/status"
import type { TaskListItem } from "@/lib/types"

function message(e: unknown): string {
  return e instanceof Error ? e.message : "failed to load tasks"
}

export function useTasks() {
  const [tasks, setTasks] = useState<TaskListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  // bumping the nonce re-arms polling, so a fresh dispatch starts it back up
  const refresh = useCallback(() => {
    setLoading(true)
    setNonce((n) => n + 1)
  }, [])

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setInterval> | null = null

    const stop = () => {
      if (timer) clearInterval(timer)
      timer = null
    }

    const tick = () => {
      api
        .listTasks()
        .then((data) => {
          if (!active) return
          setTasks(data)
          setError(null)
          // ease off once nothing is still running
          if (data.every((t) => isTerminal(t.status))) stop()
        })
        .catch((e) => active && setError(message(e)))
        .finally(() => active && setLoading(false))
    }

    tick()
    timer = setInterval(tick, POLL_MS)

    return () => {
      active = false
      stop()
    }
  }, [nonce])

  return { tasks, loading, error, refresh }
}
