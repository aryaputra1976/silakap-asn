import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen, waitFor } from "@/test/render"
import AgamaPage from "./AgamaPage"
import type { MasterEntity, MasterListResponse } from "../_shared/types"

const apiMocks = vi.hoisted(() => {
  return {
    getMasterList: vi.fn(),
    createMaster: vi.fn(),
  }
})

vi.mock("../_shared/api/getMasterList.api", () => {
  return {
    getMasterList: apiMocks.getMasterList,
  }
})

vi.mock("../_shared/api/createMaster.api", () => {
  return {
    createMaster: apiMocks.createMaster,
  }
})

vi.mock("@/core/rbac/usePermission", () => {
  return {
    usePermission: () => () => true,
  }
})

vi.mock("@/_metronic/helpers", () => {
  return {
    KTIcon: () => null,
  }
})

describe("AgamaPage", () => {
  beforeEach(() => {
    apiMocks.getMasterList.mockReset()
    apiMocks.createMaster.mockReset()
  })

  it("master CRUD happy path", async () => {
    const user = userEvent.setup()

    const items: MasterEntity[] = []

    apiMocks.getMasterList.mockImplementation(
      async (): Promise<MasterListResponse<MasterEntity>> => {
        return {
          data: [...items],
          meta: {
            page: 1,
            limit: 10,
            total: items.length,
            totalPages: 1,
          },
        }
      },
    )

    apiMocks.createMaster.mockImplementation(
      async (
        _endpoint: string,
        payload: { kode: string; nama: string },
      ): Promise<{ success: boolean }> => {
        items.push({
          id: BigInt(1),
          kode: payload.kode,
          nama: payload.nama,
          isActive: true,
        })

        return { success: true }
      },
    )

    renderWithProviders(<AgamaPage />)

    await waitFor(() => {
      expect(screen.getByText("Belum ada data")).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole("button", { name: /Tambah Agama/i }),
    )

    await user.type(screen.getByLabelText("Kode"), "islam")
    await user.type(screen.getByLabelText("Nama"), "Islam")
    await user.click(
      screen.getByRole("button", { name: "Simpan" }),
    )

    await waitFor(() => {
      expect(apiMocks.createMaster).toHaveBeenCalledWith(
        "/master/agama",
        {
          kode: "ISLAM",
          nama: "Islam",
        },
      )
    })

    await waitFor(() => {
      expect(screen.getByText("Islam")).toBeInTheDocument()
    })
  })
})
