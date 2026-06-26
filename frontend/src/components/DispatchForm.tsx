"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"

import { ConnectPrompt } from "@/components/ConnectPrompt"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api, NeedsAuthError } from "@/lib/api"

interface NeedsAuth {
  toolkit: string
  connectUrl: string | null
}

const SCHEDULE_PRESETS = [
  { label: "Daily 8am", cron: "0 8 * * *" },
  { label: "Hourly", cron: "0 * * * *" },
  { label: "Weekdays 9am", cron: "0 9 * * 1-5" },
]

export function DispatchForm({ onDispatched }: { onDispatched: () => void }) {
  const [goal, setGoal] = useState("")
  const [toolkit, setToolkit] = useState("")
  const [schedule, setSchedule] = useState("")
  const [busy, setBusy] = useState(false)
  const [needsAuth, setNeedsAuth] = useState<NeedsAuth | null>(null)

  async function dispatch() {
    setBusy(true)
    setNeedsAuth(null)
    try {
      const res = await api.dispatch({
        goal: goal.trim(),
        toolkit: toolkit.trim() || null,
        schedule: schedule.trim() || null,
      })
      toast.success(`Dispatched ${res.workflow_id}`)
      setGoal("")
      setToolkit("")
      setSchedule("")
      onDispatched()
    } catch (e) {
      if (e instanceof NeedsAuthError) {
        setNeedsAuth({ toolkit: e.toolkit, connectUrl: e.connectUrl })
      } else {
        toast.error(e instanceof Error ? e.message : "Dispatch failed")
      }
    } finally {
      setBusy(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!goal.trim()) return
    dispatch()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dispatch a task</CardTitle>
        <CardDescription>
          Describe a goal in plain language. The agent works it in the background, you
          can leave and check back later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Textarea
              id="goal"
              rows={4}
              placeholder="e.g. Summarize my next 5 calendar events for today"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="toolkit">
              Toolkit <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="toolkit"
              placeholder="e.g. googlecalendar, github, slack"
              value={toolkit}
              onChange={(e) => setToolkit(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Naming a toolkit lets us check it is connected before dispatching.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule">
              Schedule <span className="text-muted-foreground">(optional cron)</span>
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {SCHEDULE_PRESETS.map((p) => (
                <Button
                  key={p.cron}
                  type="button"
                  size="sm"
                  variant={schedule === p.cron ? "default" : "outline"}
                  onClick={() => setSchedule(schedule === p.cron ? "" : p.cron)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <Input
              id="schedule"
              placeholder="0 8 * * *  (leave blank to run once)"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Blank runs the goal once now. A cron expression asks the backend to run it
              on a schedule.
            </p>
          </div>
          <Button type="submit" disabled={busy || !goal.trim()}>
            <Send className="size-4" />
            {busy ? "Dispatching..." : "Dispatch"}
          </Button>
        </form>

        {needsAuth && (
          <ConnectPrompt
            toolkit={needsAuth.toolkit}
            connectUrl={needsAuth.connectUrl}
            onRetry={dispatch}
            retrying={busy}
          />
        )}
      </CardContent>
    </Card>
  )
}
