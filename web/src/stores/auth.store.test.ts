import { act } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const transportMocks = vi.hoisted(() => {
  return {
    post: vi.fn(),
    get: vi.fn(),
  }
})

vi.mock("axios", () => {
  return {
    default: {
      create: vi.fn(() => ({
        post: transportMocks.post,
        get: transportMocks.get,
      })),
    },
  }
})

function createAccessToken(): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = btoa(
    JSON.stringify({
      sub: "1",
      id: "1",
      name: "superadmin",
      role: "SUPER_ADMIN",
      roles: ["SUPER_ADMIN"],
      unitKerjaId: "10",
      permissions: ["SYSTEM.CONFIG.READ", "SERVICE.VERIFY"],
      exp: 9_999_999_999,
      iat: 1_700_000_000,
    }),
  )

  return `${header}.${payload}.signature`
}

describe("auth store", () => {
  beforeEach(async () => {
    vi.resetModules()
    transportMocks.post.mockReset()
    transportMocks.get.mockReset()

    const { useAuthStore } = await import("./auth.store")

    act(() => {
      useAuthStore.getState().clearSession()
    })
  })

  it("bootstrap current session", async () => {
    const token = createAccessToken()
    const { useAuthStore } = await import("./auth.store")

    transportMocks.post.mockResolvedValueOnce({
      data: {
        access_token: token,
        expires_in: 900,
      },
    })

    transportMocks.get.mockResolvedValueOnce({
      data: {
        id: "1",
        username: "superadmin",
        isActive: true,
        roles: ["SUPER_ADMIN"],
        pegawai: null,
      },
    })

    await act(async () => {
      await useAuthStore.getState().initialize()
    })

    const state = useAuthStore.getState()

    expect(state.isAuthenticated).toBe(true)
    expect(state.accessToken).toBe(token)
    expect(state.permissions).toEqual([
      "SYSTEM.CONFIG.READ",
      "SERVICE.VERIFY",
    ])
    expect(state.user).toEqual({
      id: "1",
      username: "superadmin",
      roles: ["SUPER_ADMIN"],
      unitKerjaId: "10",
      bidangId: null,
      opd: null,
    })
  })

  it("logout clears in-memory auth state", async () => {
    const { useAuthStore } = await import("./auth.store")

    act(() => {
      useAuthStore.getState().setAuth({
        user: {
          id: "1",
          username: "superadmin",
          roles: ["SUPER_ADMIN"],
          unitKerjaId: "10",
          bidangId: null,
          opd: null,
        },
        accessToken: createAccessToken(),
        permissions: ["SYSTEM.CONFIG.READ"],
      })
    })

    transportMocks.post.mockResolvedValueOnce({
      data: { success: true },
    })

    await act(async () => {
      await useAuthStore.getState().logout()
    })

    const state = useAuthStore.getState()

    expect(transportMocks.post).toHaveBeenCalledWith(
      "/auth/logout",
      {},
    )
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.permissions).toEqual([])
    expect(state.isAuthenticated).toBe(false)
  })
})
