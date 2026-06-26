"use client"

import { useState } from "react"
import {
  Calendar,
  ExternalLink,
  FileText,
  LayoutGrid,
  Mail,
  MessageSquare,
  Plug,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { AuthGate } from "@/components/AuthGate"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api, ApiError } from "@/lib/api"

interface Toolkit {
  slug: string
  label: string
  icon: LucideIcon
}

const TOOLKITS: Toolkit[] = [
  { slug: "github", label: "GitHub", icon: Plug },
  { slug: "gmail", label: "Gmail", icon: Mail },
  { slug: "slack", label: "Slack", icon: MessageSquare },
  { slug: "linear", label: "Linear", icon: LayoutGrid },
  { slug: "notion", label: "Notion", icon: FileText },
  { slug: "googlecalendar", label: "Google Calendar", icon: Calendar },
]

function Connections() {
  // flip to true on a 404/405, the endpoint isn't on the gateway yet
  const [unavailable, setUnavailable] = useState(false)
  const [pending, setPending] = useState<string | null>(null)

  async function connect(slug: string) {
    setPending(slug)
    try {
      const res = await api.connectToolkit(slug)
      if (res.connect_url) {
        window.open(res.connect_url, "_blank", "noopener,noreferrer")
      } else {
        toast.error("No connect link returned for this toolkit.")
      }
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 405)) {
        setUnavailable(true)
      } else {
        toast.error(e instanceof Error ? e.message : "Could not start the connection.")
      }
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Connections</h1>
        <p className="text-muted-foreground text-sm">
          Connect an app ahead of time so scheduled tasks do not stall waiting on auth.
        </p>
      </div>

      {unavailable && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Proactive connect is not wired on the gateway yet. For now, dispatch a task
          with the toolkit named and connect it from the prompt that appears (the
          reactive path).
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {TOOLKITS.map((tk) => {
          const Icon = tk.icon
          return (
            <Card key={tk.slug}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="text-muted-foreground size-4" />
                  <CardTitle className="text-sm">{tk.label}</CardTitle>
                </div>
                <CardDescription className="font-mono text-xs">
                  {tk.slug}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={unavailable || pending === tk.slug}
                  onClick={() => connect(tk.slug)}
                >
                  <ExternalLink className="size-4" />
                  {pending === tk.slug ? "Opening..." : "Connect"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default function ConnectionsPage() {
  return (
    <AuthGate>
      <Connections />
    </AuthGate>
  )
}
