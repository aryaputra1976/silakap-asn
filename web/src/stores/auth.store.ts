import axios from "axios"
import { create } from "zustand"
import { env } from "@/core/utils/env"
import type {
  AuthSession,
  LogoutResponse,
  RefreshResponse,
  User,
} from "@/features/auth/types"
import {
  createUserFromToken,
  decodeAccessToken,
} from "@/features/auth/token"
import type { CurrentUserResponse } from "@/features/account/types"

const authTransport = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  withCredentials: true,
})

interface AuthState {
  user: User | null
  accessToken: string | null
  permissions: string[]
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (data: AuthSession) => void
  clearSession: () => void
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

function mapCurrentUserToSessionUser(
  currentUser: CurrentUserResponse,
  accessToken: string,
): User {
  const payload = decodeAccessToken(accessToken)

  return createUserFromToken(payload, {
    id: currentUser.id,
    username: currentUser.username,
    pegawaiId: currentUser.pegawaiId ?? null,
    pegawai: currentUser.pegawai ?? null,
  })
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,

  setAuth: ({ user, accessToken, permissions }) => {
    set({
      user,
      accessToken,
      permissions,
      isAuthenticated: true,
      isLoading: false,
    })
  },

  clearSession: () => {
    set({
      user: null,
      accessToken: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
    })
  },

  logout: async () => {
    try {
      await authTransport.post<LogoutResponse>("/auth/logout", {})
    } finally {
      useAuthStore.getState().clearSession()
    }
  },

  initialize: async () => {
    set({ isLoading: true })

    try {
      const refreshResponse = await authTransport.post<RefreshResponse>(
        "/auth/refresh",
        {},
      )
      const accessToken = refreshResponse.data.access_token
      const payload = decodeAccessToken(accessToken)
      const currentUserResponse =
        await authTransport.get<CurrentUserResponse>("/users/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

      set({
        user: mapCurrentUserToSessionUser(
          currentUserResponse.data,
          accessToken,
        ),
        accessToken,
        permissions: payload.permissions,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      useAuthStore.getState().clearSession()
    } finally {
      set({ isLoading: false })
    }
  },
}))
