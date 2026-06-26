import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { StatusBadge } from "@/components/StatusBadge"
import type { TaskListItem } from "@/lib/types"

export function TaskCard({ task }: { task: TaskListItem }) {
  // run_id is what actually distinguishes recurring runs that share a workflow_id
  const short = (task.run_id ?? task.workflow_id).slice(0, 8)
  const href = task.run_id
    ? `/tasks/${task.workflow_id}?run=${task.run_id}`
    : `/tasks/${task.workflow_id}`
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted"
    >
      <div className="min-w-0">
        <p className="truncate font-mono text-sm">{task.workflow_id}</p>
        <p className="text-muted-foreground text-xs">run {short}</p>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={task.status} />
        <ChevronRight className="text-muted-foreground size-4" />
      </div>
    </Link>
  )
}
