"use client"

import { Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"

import { AuthGate } from "@/components/AuthGate"
import { TaskDetail } from "@/components/TaskDetail"
import { useTask } from "@/hooks/useTask"

function TaskView() {
  const params = useParams<{ id: string }>()
  const runId = useSearchParams().get("run")
  const { task, loading, error, refresh } = useTask(params.id, runId)

  return (
    <TaskDetail task={task} loading={loading} error={error} onRefresh={refresh} />
  )
}

export default function TaskPage() {
  return (
    <AuthGate>
      <Suspense>
        <TaskView />
      </Suspense>
    </AuthGate>
  )
}
