// localStorage is fine for a dev tool, a real app would use an httpOnly cookie

const TOKEN_KEY = "kron.token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function signOut(): void {
  window.localStorage.removeItem(TOKEN_KEY)
}

// decode the jwt sub for display, no verification
export function getUserId(): string | null {
  const token = getToken()
  if (!token) return null
  try {
    const payload = token.split(".")[1]
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    const data = JSON.parse(json) as { sub?: string }
    return data.sub ?? null
  } catch {
    return null
  }
}
