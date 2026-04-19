import { Routes, Route } from "react-router-dom"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen, waitFor } from "@/test/render"
import RegisterPage from "./RegisterPage"

const registerMocks = vi.hoisted(() => {
  return {
    register: vi.fn(),
    getRegisterPegawai: vi.fn(),
  }
})

vi.mock("@/features/auth/api", () => {
  return {
    register: registerMocks.register,
    getRegisterPegawai: registerMocks.getRegisterPegawai,
  }
})

describe("RegisterPage", () => {
  beforeEach(() => {
    registerMocks.register.mockReset()
    registerMocks.getRegisterPegawai.mockReset()
  })

  it("register success", async () => {
    const user = userEvent.setup()

    registerMocks.getRegisterPegawai.mockResolvedValue({
      id: "77",
      nip: "198765432109876543",
      nipLama: "",
      nama: "Pegawai Baru",
      email: "",
      noHp: "",
      unorNama: "BKPSDM",
    })

    registerMocks.register.mockResolvedValueOnce({
      message:
        "Registrasi berhasil dikirim dan sedang menunggu verifikasi admin BKPSDM.",
      registration: {
        id: "11",
        status: "PENDING",
        requestedRole: "OPERATOR",
        username: "198765432109876543",
        pegawaiId: "77",
        submittedAt: "2026-04-19T14:00:00.000Z",
        pegawai: {
          nama: "Pegawai Baru",
          nip: "198765432109876543",
          unor: "BKPSDM",
          email: "pegawai@bkpsdm.go.id",
          noHp: "081234567890",
        },
      },
    })

    renderWithProviders(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { route: "/register" },
    )

    await user.type(
      screen.getByPlaceholderText("NIP aktif"),
      "198765432109876543",
    )
    await waitFor(() => {
      expect(registerMocks.getRegisterPegawai).toHaveBeenCalledWith(
        "198765432109876543",
      )
    })
    expect(screen.getByText("Pegawai Baru")).toBeInTheDocument()
    expect(screen.getByText("BKPSDM")).toBeInTheDocument()
    await user.type(
      screen.getByPlaceholderText("Email pegawai"),
      "pegawai@bkpsdm.go.id",
    )
    await user.type(
      screen.getByPlaceholderText("No. HP pegawai"),
      "081234567890",
    )
    await user.type(
      screen.getByPlaceholderText("Password"),
      "Password123",
    )
    await user.type(
      screen.getByPlaceholderText("Konfirmasi password"),
      "Password123",
    )
    await user.click(screen.getByRole("button", { name: "Daftar" }))

    await waitFor(() => {
      expect(
        screen.getByText(
          "Registrasi berhasil dikirim dan sedang menunggu verifikasi admin BKPSDM.",
        ),
      ).toBeInTheDocument()
    })

    expect(registerMocks.register).toHaveBeenCalledWith({
      nip: "198765432109876543",
      email: "pegawai@bkpsdm.go.id",
      noHp: "081234567890",
      password: "Password123",
      confirmPassword: "Password123",
    })
  })

  it("register failure", async () => {
    const user = userEvent.setup()

    registerMocks.getRegisterPegawai.mockResolvedValue({
      id: "7",
      nip: "198765432109876543",
      nipLama: "",
      nama: "Admin Pegawai",
      email: "",
      noHp: "",
      unorNama: "Sekretariat",
    })

    registerMocks.register.mockRejectedValueOnce(
      new Error(
        "Pengajuan registrasi untuk NIP ini sudah dikirim dan masih menunggu verifikasi admin",
      ),
    )

    renderWithProviders(
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>,
      { route: "/register" },
    )

    await user.type(
      screen.getByPlaceholderText("NIP aktif"),
      "198765432109876543",
    )
    await waitFor(() => {
      expect(registerMocks.getRegisterPegawai).toHaveBeenCalled()
    })
    await user.type(
      screen.getByPlaceholderText("Email pegawai"),
      "admin@bkpsdm.go.id",
    )
    await user.type(
      screen.getByPlaceholderText("No. HP pegawai"),
      "081200000000",
    )
    await user.type(
      screen.getByPlaceholderText("Password"),
      "Password123",
    )
    await user.type(
      screen.getByPlaceholderText("Konfirmasi password"),
      "Password123",
    )
    await user.click(screen.getByRole("button", { name: "Daftar" }))

    await waitFor(() => {
      expect(
        screen.getByText(
          "Pengajuan registrasi untuk NIP ini sudah dikirim dan masih menunggu verifikasi admin",
        ),
      ).toBeInTheDocument()
    })
  })
})
