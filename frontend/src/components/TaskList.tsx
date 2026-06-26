"use client"

import { Inbox, RefreshCw } from "lucide-react"

import { TaskCard } from "@/components/TaskCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { TaskListItem } from "@/lib/types"
import { cn } from "@/lib/utils"

interface Props {
  tasks: TaskListItem[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}

export function TaskList({ tasks, loading, error, onRefresh }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Your tasks</h2>
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading && tasks.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
          <Inbox className="text-muted-foreground size-6" />
          <p className="text-sm font-medium">No tasks yet</p>
          <p className="text-muted-foreground text-xs">
            Dispatch a goal and it will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <TaskCard key={t.run_id ?? t.workflow_id} task={t} />
          ))}
        </div>
      )}
    </div>
  )
}
