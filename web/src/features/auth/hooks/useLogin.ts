import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../api/login.api"
import { useAuthStore } from "@/stores/auth.store"
import type { AuthSession, LoginRequest } from "../types"
import { showToast } from "@/core/toast/toast.hook"
import type { HttpError } from "@/core/http/httpError"

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (payload: LoginRequest) => {
    setLoading(true)
    setError(null)

    try {
      const response = await login(payload)
      const session: AuthSession = {
        user: response.user,
        accessToken: response.access_token,
        permissions: response.permissions,
      }

      setAuth(session)
      showToast("Login berhasil", "success")
      navigate("/", { replace: true })
    } catch (error: unknown) {
      const httpError = error as HttpError
      const message =
        httpError.message || "Username atau password salah"

      setError(message)
      showToast(message, "error")
    } finally {
      setLoading(false)
    }
  }

  return {
    handleLogin,
    loading,
    error,
  }
}
