export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface DispatchInput {
  goal: string
  toolkit?: string | null
  schedule?: string | null
}

export interface DispatchResponse {
  workflow_id: string
  status: string
}

export interface TaskListItem {
  workflow_id: string
  run_id: string | null
  status: string | null
}

export interface ToolCall {
  name: string
  input: Record<string, unknown>
}

export interface AgentStep {
  turn: number
  stop_reason: string | null
  tool_calls: ToolCall[]
}

export interface AgentResult {
  status: string
  summary: string
  steps_taken: number
  steps: AgentStep[]
}

// status is agent-level (often null early), execution_status is the Temporal one
export interface TaskDetail {
  workflow_id: string
  run_id: string | null
  status: string | null
  execution_status: string | null
  result: AgentResult | null
}

export interface NeedsAuthDetail {
  error: string
  message: string
  toolkit: string
  connect_url: string | null
}

export interface ConnectResponse {
  toolkit: string
  connect_url: string | null
}

export interface HealthResponse {
  status: string
}
