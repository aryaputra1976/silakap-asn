import { Routes, Route } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "@/test/render"
import { useAuthStore } from "@/stores/auth.store"
import RouteGuard from "./RouteGuard"

vi.mock("@/core/rbac/usePermission", () => {
  return {
    usePermission: () => () => true,
  }
})

describe("RouteGuard", () => {
  beforeEach(() => {
    useAuthStore.setState((state) => ({
      ...state,
      user: null,
      accessToken: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
    }))
  })

  it("protected route redirect when unauthenticated", () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={
            <RouteGuard>
              <div>Protected Page</div>
            </RouteGuard>
          }
        />
      </Routes>,
      { route: "/protected" },
    )

    expect(screen.getByText("Login Page")).toBeInTheDocument()
  })
})
