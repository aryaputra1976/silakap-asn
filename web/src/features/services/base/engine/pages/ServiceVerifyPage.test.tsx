import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import ServiceVerifyPage from "./ServiceVerifyPage"

const workflowMocks = vi.hoisted(() => {
  return {
    verifyLayanan: vi.fn(),
  }
})

vi.mock("@/features/workflow/queue/api/verifyLayanan.api", () => {
  return {
    verifyLayanan: workflowMocks.verifyLayanan,
  }
})

describe("ServiceVerifyPage", () => {
  beforeEach(() => {
    workflowMocks.verifyLayanan.mockReset()
  })

  it("workflow action happy path", async () => {
    const user = userEvent.setup()

    workflowMocks.verifyLayanan.mockResolvedValueOnce({
      success: true,
    })

    render(
      <MemoryRouter
        initialEntries={["/dashboard", "/workflow/verify/pensiun/123"]}
        initialIndex={1}
      >
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route
            path="/workflow/verify/:service/:id"
            element={<ServiceVerifyPage />}
          />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(
      screen.getByRole("button", { name: "Approve" }),
    )

    await waitFor(() => {
      expect(workflowMocks.verifyLayanan).toHaveBeenCalledWith(
        "pensiun",
        "123",
        "approve",
      )
    })

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument()
    })
  })
})
