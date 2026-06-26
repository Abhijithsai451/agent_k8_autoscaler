"use client"

import { useCallback, useEffect, useState } from "react"

import { api } from "@/lib/api"
import { POLL_MS, isTerminal } from "@/lib/status"
import type { TaskDetail } from "@/lib/types"

export { isTerminal }

function message(e: unknown): string {
  return e instanceof Error ? e.message : "failed to load task"
}

export function useTask(id: string, runId?: string | null) {
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  // re-arm polling, used after a cancel so we follow it to its terminal state
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
        .getTask(id, runId)
        .then((data) => {
          if (!active) return
          setTask(data)
          setError(null)
          // done working, no point polling a finished task
          if (isTerminal(data.execution_status)) stop()
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
  }, [id, runId, nonce])

  return { task, loading, error, refresh }
}
