"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

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
import { api } from "@/lib/api"
import { setToken } from "@/lib/auth"

export function SignInForm() {
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId.trim()) return
    setBusy(true)
    try {
      const res = await api.login(userId.trim())
      setToken(res.access_token)
      router.push("/dashboard")
    } catch {
      toast.error("Could not reach the gateway. Is it running on the configured URL?")
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Dev identity, just a name. There is no password, this only scopes your
            tasks. Not a real login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User id</Label>
              <Input
                id="userId"
                placeholder="e.g. alice"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy || !userId.trim()}>
              {busy ? "Signing in..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
