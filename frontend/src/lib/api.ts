// the one place that talks to the gateway, token gets attached here

import { getToken } from "@/lib/auth"
import type {
  AgentResult,
  ConnectResponse,
  DispatchInput,
  DispatchResponse,
  HealthResponse,
  NeedsAuthDetail,
  TaskDetail,
  TaskListItem,
  TokenResponse,
} from "@/lib/types"

const BASE_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8000"

export class NeedsAuthError extends Error {
  toolkit: string
  connectUrl: string | null
  constructor(toolkit: string, connectUrl: string | null) {
    super(`toolkit ${toolkit} is not connected`)
    this.name = "NeedsAuthError"
    this.toolkit = toolkit
    this.connectUrl = connectUrl
  }
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts
  const headers: Record<string, string> = {}

  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (auth) {
    const token = getToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    // gateway wraps its 409 detail, so the connect link is under detail
    const detail = (data as { detail?: NeedsAuthDetail } | null)?.detail
    if (res.status === 409 && detail?.error === "toolkit_not_connected") {
      throw new NeedsAuthError(detail.toolkit, detail.connect_url)
    }
    const message =
      typeof detail === "string" ? detail : (data && JSON.stringify(data)) || res.statusText
    throw new ApiError(res.status, message)
  }

  return data as T
}

export const api = {
  login(userId: string): Promise<TokenResponse> {
    return request<TokenResponse>("/auth/token", {
      method: "POST",
      body: { user_id: userId },
      auth: false,
    })
  },

  dispatch(input: DispatchInput): Promise<DispatchResponse> {
    return request<DispatchResponse>("/tasks/dispatch", {
      method: "POST",
      body: {
        goal: input.goal,
        toolkit: input.toolkit ?? null,
        schedule: input.schedule ?? null,
      },
    })
  },

  listTasks(): Promise<TaskListItem[]> {
    return request<TaskListItem[]>("/tasks")
  },

  // run_id pins a specific cron run, without it the gateway uses the latest run
  getTask(id: string, runId?: string | null): Promise<TaskDetail> {
    const q = runId ? `?run_id=${encodeURIComponent(runId)}` : ""
    return request<TaskDetail>(`/tasks/${id}${q}`)
  },

  cancelTask(
    id: string,
    runId?: string | null
  ): Promise<{ workflow_id: string; status: string }> {
    const q = runId ? `?run_id=${encodeURIComponent(runId)}` : ""
    return request(`/tasks/${id}${q}`, { method: "DELETE" })
  },

  health(): Promise<HealthResponse> {
    return request<HealthResponse>("/health", { auth: false })
  },

  // proactive connect, gateway endpoint doesn't exist yet (connections page handles the 404)
  connectToolkit(toolkit: string): Promise<ConnectResponse> {
    return request<ConnectResponse>(`/connections/${toolkit}`, { method: "POST" })
  },
}

export type { AgentResult }
