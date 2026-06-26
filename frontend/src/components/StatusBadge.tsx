import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const STYLES: Record<string, string> = {
  RUNNING: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  TERMINATED: "bg-red-50 text-red-700 border-red-200",
  TIMED_OUT: "bg-red-50 text-red-700 border-red-200",
  CANCELED: "bg-zinc-100 text-zinc-600 border-zinc-200",
  DISPATCHED: "bg-blue-50 text-blue-700 border-blue-200",
  NEEDS_AUTH: "bg-violet-50 text-violet-700 border-violet-200",
}

export function StatusBadge({ status }: { status: string | null }) {
  const key = (status ?? "UNKNOWN").toUpperCase()
  const style = STYLES[key] ?? "bg-zinc-100 text-zinc-600 border-zinc-200"
  return (
    <Badge className={cn("border font-medium", style)}>
      {status ?? "unknown"}
    </Badge>
  )
}
