"use client"

import { ExternalLink, KeyRound } from "lucide-react"

import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"

interface Props {
  toolkit: string
  connectUrl: string | null
  onRetry: () => void
  retrying: boolean
}

// shown when a dispatch fails because the toolkit isn't connected
export function ConnectPrompt({ toolkit, connectUrl, onRetry, retrying }: Props) {
  return (
    <div className="space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4">
      <div className="flex items-center gap-2">
        <KeyRound className="size-4 text-violet-700" />
        <span className="text-sm font-medium text-violet-900">
          Connect {toolkit} first
        </span>
        <StatusBadge status="needs_auth" />
      </div>
      <p className="text-sm text-violet-800">
        This goal needs {toolkit}, which is not connected for your account yet. Connect
        it, then retry the dispatch.
      </p>
      <div className="flex flex-wrap gap-2">
        {connectUrl ? (
          <Button
            size="sm"
            render={
              <a href={connectUrl} target="_blank" rel="noopener noreferrer" />
            }
          >
            <ExternalLink className="size-4" />
            Connect {toolkit}
          </Button>
        ) : (
          <span className="text-sm text-violet-800">
            No connect link was returned, check the gateway logs.
          </span>
        )}
        <Button size="sm" variant="outline" onClick={onRetry} disabled={retrying}>
          {retrying ? "Retrying..." : "I have connected, retry"}
        </Button>
      </div>
    </div>
  )
}
