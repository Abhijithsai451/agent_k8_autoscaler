"use client"

import { AuthGate } from "@/components/AuthGate"
import { DispatchForm } from "@/components/DispatchForm"
import { TaskList } from "@/components/TaskList"
import { useTasks } from "@/hooks/useTasks"

function Dashboard() {
  const { tasks, loading, error, refresh } = useTasks()

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <DispatchForm onDispatched={refresh} />
      <TaskList tasks={tasks} loading={loading} error={error} onRefresh={refresh} />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  )
}
