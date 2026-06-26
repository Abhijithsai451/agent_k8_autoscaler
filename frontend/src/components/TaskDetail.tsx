"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Ban, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { isTerminal } from "@/lib/status"
import type { AgentStep, TaskDetail as TaskDetailType } from "@/lib/types"
import { cn } from "@/lib/utils"

interface Props {
  task: TaskDetailType | null
  loading: boolean
  error: string | null
  onRefresh: () => void
}

export function TaskDetail({ task, loading, error, onRefresh }: Props) {
  const [raw, setRaw] = useState(false)
  const [canceling, setCanceling] = useState(false)

  const running = task !== null && !isTerminal(task.execution_status)

  async function cancel() {
    if (!task) return
    setCanceling(true)
    try {
      await api.cancelTask(task.workflow_id, task.run_id)
      toast.success("Cancellation requested")
      onRefresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not cancel the task")
    } finally {
      setCanceling(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
        <div className="flex items-center gap-1">
          {running && (
            <Button
              variant="ghost"
              size="sm"
              onClick={cancel}
              disabled={canceling}
              className="text-red-600 hover:text-red-700"
            >
              <Ban className="size-4" />
              {canceling ? "Canceling..." : "Cancel"}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading && !task ? (
        <Skeleton className="h-40 w-full" />
      ) : task ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <CardTitle className="font-mono text-sm break-all">
                    {task.workflow_id}
                  </CardTitle>
                  <CardDescription>
                    agent status {task.status ?? "n/a"}
                    {task.run_id && (
                      <span className="font-mono"> · run {task.run_id.slice(0, 8)}</span>
                    )}
                  </CardDescription>
                </div>
                <StatusBadge status={task.execution_status} />
              </div>
            </CardHeader>

            {task.result ? (
              <CardContent className="space-y-4">
                <div>
                  <p className="text-muted-foreground text-xs font-medium">Summary</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {task.result.summary}
                  </p>
                </div>
                <p className="text-muted-foreground text-xs">
                  {task.result.steps_taken} step
                  {task.result.steps_taken === 1 ? "" : "s"} taken
                </p>
              </CardContent>
            ) : (
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  No result yet. This task is still working, refresh to check again.
                </p>
              </CardContent>
            )}
          </Card>

          {task.result && task.result.steps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">Steps</h2>
                <Button variant="ghost" size="sm" onClick={() => setRaw((v) => !v)}>
                  {raw ? "Readable" : "Raw JSON"}
                </Button>
              </div>

              {raw ? (
                <pre className="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-xs">
                  {JSON.stringify(task.result, null, 2)}
                </pre>
              ) : (
                <div className="space-y-2">
                  {task.result.steps.map((step) => (
                    <StepRow key={step.turn} step={step} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}

function StepRow({ step }: { step: AgentStep }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Turn {step.turn}</span>
        {step.stop_reason && (
          <span className="text-muted-foreground font-mono text-xs">
            {step.stop_reason}
          </span>
        )}
      </div>

      {step.tool_calls.length > 0 ? (
        <>
          <Separator className="my-3" />
          <div className="space-y-2">
            {step.tool_calls.map((call, i) => (
              <div key={i} className="text-sm">
                <span className="font-mono text-xs">{call.name}</span>
                {Object.keys(call.input).length > 0 && (
                  <pre className="text-muted-foreground mt-1 overflow-x-auto rounded bg-muted p-2 font-mono text-xs">
                    {JSON.stringify(call.input, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-muted-foreground mt-2 text-xs">no tool calls this turn</p>
      )}
    </div>
  )
}
