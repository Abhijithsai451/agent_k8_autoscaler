"use client"

import { useSyncExternalStore } from "react"

const noop = () => () => {}

// false on server, true on client. lets us read localStorage without a hydration mismatch
export function useMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
}
