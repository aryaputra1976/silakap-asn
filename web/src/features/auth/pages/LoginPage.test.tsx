import { Routes, Route } from "react-router-dom"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen, waitFor } from "@/test/render"
import { useAuthStore } from "@/stores/auth.store"
import LoginPage from "./LoginPage"

const loginMocks = vi.hoisted(() => {
  return {
    login: vi.fn(),
  }
})

vi.mock("@/features/auth/api", () => {
  return {
    login: loginMocks.login,
  }
})

describe("LoginPage", () => {
  beforeEach(() => {
    loginMocks.login.mockReset()
    useAuthStore.getState().clearSession()
  })

  it("login success", async () => {
    const user = userEvent.setup()

    loginMocks.login.mockResolvedValueOnce({
      access_token: "test-access-token",
      expires_in: 900,
      user: {
        id: "1",
        username: "superadmin",
        roles: ["SUPER_ADMIN"],
        unitKerjaId: "10",
        bidangId: null,
        opd: null,
      },
      permissions: ["SYSTEM.CONFIG.READ"],
    })

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>,
      { route: "/login" },
    )

    await user.type(
      screen.getByPlaceholderText("Username"),
      "superadmin",
    )
    await user.type(
      screen.getByPlaceholderText("Password"),
      "password",
    )
    await user.click(
      screen.getByRole("button", { name: "Masuk" }),
    )

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument()
    })

    const state = useAuthStore.getState()

    expect(loginMocks.login).toHaveBeenCalledWith({
      username: "superadmin",
      password: "password",
    })
    expect(state.isAuthenticated).toBe(true)
    expect(state.accessToken).toBe("test-access-token")
    expect(state.user?.username).toBe("superadmin")
  })

  it("login failure", async () => {
    const user = userEvent.setup()

    loginMocks.login.mockRejectedValueOnce(new Error("Unauthorized"))

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { route: "/login" },
    )

    await user.type(
      screen.getByPlaceholderText("Username"),
      "superadmin",
    )
    await user.type(
      screen.getByPlaceholderText("Password"),
      "wrong-password",
    )
    await user.click(
      screen.getByRole("button", { name: "Masuk" }),
    )

    await waitFor(() => {
      expect(
        screen.getByText("Username atau password salah"),
      ).toBeInTheDocument()
    })

    const state = useAuthStore.getState()

    expect(state.isAuthenticated).toBe(false)
    expect(state.accessToken).toBeNull()
  })
})
