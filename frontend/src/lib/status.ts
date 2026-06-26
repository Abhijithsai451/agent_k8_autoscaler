export const TERMINAL_STATUSES = [
  "COMPLETED",
  "FAILED",
  "CANCELED",
  "TERMINATED",
  "TIMED_OUT",
]

export function isTerminal(status: string | null): boolean {
  return status !== null && TERMINAL_STATUSES.includes(status)
}

export const POLL_MS = 3000
