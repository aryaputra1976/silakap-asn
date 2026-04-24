import { useEffect, useMemo, useState } from "react"
import clsx from "clsx"
import { PageTitle, type PageLink } from "@/_metronic/layout/core"
import { KTIcon } from "@/_metronic/helpers"
import {
  approveRegistration,
  createUser,
  deleteUser,
  getPegawaiOptions,
  getRegistrationQueue,
  getRoleOptions,
  getUserList,
  rejectRegistration,
  toggleUserStatus,
  updateUser,
  type PaginationMeta,
  type PegawaiOption,
  type RegistrationQueueItem,
  type RegistrationStatus,
  type RoleOption,
  type UserListItem,
} from "../api/registrationAdmin.api"

const USER_BREADCRUMBS: PageLink[] = [
  { title: "Dashboard", path: "/dashboard", isActive: false },
  { title: "Pengaturan Sistem", path: "/pengaturan/pengguna", isActive: false },
]

const STATUS_OPTIONS: Array<{
  label: string
  value?: RegistrationStatus
}> = [
  { label: "Semua", value: undefined },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" },
]

const USER_ACTIVE_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Aktif", value: "true" },
  { label: "Nonaktif", value: "false" },
]

const STATUS_STYLES: Record<RegistrationStatus, string> = {
  PENDING: "badge badge-light-warning",
  APPROVED: "badge badge-light-success",
  REJECTED: "badge badge-light-danger",
  CANCELLED: "badge badge-light-secondary",
}

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
}

type UserFormState = {
  username: string
  password: string
  pegawaiId: string
  roleIds: string[]
  isActive: boolean
}

function formatDate(value: string | null) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function PaginationControls({
  meta,
  onChange,
}: {
  meta: PaginationMeta
  onChange: (page: number) => void
}) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-5">
      <div className="text-muted fs-7">
        Halaman {meta.page} dari {meta.totalPages} - Total {meta.total} data
      </div>
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-sm btn-light"
          disabled={meta.page <= 1}
          onClick={() => onChange(meta.page - 1)}
        >
          Sebelumnya
        </button>
        <button
          type="button"
          className="btn btn-sm btn-light"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onChange(meta.page + 1)}
        >
          Berikutnya
        </button>
      </div>
    </div>
  )
}

function UserFormModal({
  open,
  mode,
  initialValue,
  roles,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: "create" | "edit"
  initialValue: UserFormState
  roles: RoleOption[]
  onClose: () => void
  onSubmit: (value: UserFormState) => Promise<void>
}) {
  const [form, setForm] = useState<UserFormState>(initialValue)
  const [submitting, setSubmitting] = useState(false)
  const [pegawaiSearch, setPegawaiSearch] = useState("")
  const [pegawaiOptions, setPegawaiOptions] = useState<PegawaiOption[]>([])
  const [pegawaiLoading, setPegawaiLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(initialValue)
    setPegawaiSearch("")
  }, [initialValue, open])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setPegawaiLoading(true)

    void getPegawaiOptions(pegawaiSearch)
      .then((response) => {
        if (!cancelled) {
          setPegawaiOptions(response)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPegawaiLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [open, pegawaiSearch])

  if (!open) return null

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await onSubmit(form)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(17, 24, 39, 0.45)", zIndex: 2000 }}
    >
      <div className="card shadow-lg w-100" style={{ maxWidth: 780 }}>
        <div className="card-header border-0 pt-6">
          <div>
            <h3 className="card-title fw-bold text-gray-900">
              {mode === "create" ? "Tambah Pengguna" : "Ubah Pengguna"}
            </h3>
            <div className="text-muted fs-7">
              Lengkapi data akun, pegawai, dan role yang akan dipakai user.
            </div>
          </div>
          <button type="button" className="btn btn-sm btn-light" onClick={onClose}>
            Tutup
          </button>
        </div>
        <div className="card-body">
          <div className="row g-5">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Username</label>
              <input
                className="form-control"
                value={form.username}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, username: event.target.value }))
                }
                placeholder="Masukkan username"
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">
                {mode === "create" ? "Password" : "Status Akun"}
              </label>
              {mode === "create" ? (
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  placeholder="Minimal 6 karakter"
                />
              ) : (
                <select
                  className="form-select"
                  value={String(form.isActive)}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive: event.target.value === "true",
                    }))
                  }
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              )}
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Cari Pegawai</label>
              <input
                className="form-control"
                value={pegawaiSearch}
                onChange={(event) => setPegawaiSearch(event.target.value)}
                placeholder="Cari nama, NIP, atau unit"
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Pegawai</label>
              <select
                className="form-select"
                value={form.pegawaiId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, pegawaiId: event.target.value }))
                }
              >
                <option value="">Tanpa pegawai</option>
                {pegawaiOptions.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    disabled={item.hasUser && item.id !== form.pegawaiId}
                  >
                    {item.nip} - {item.nama}
                    {item.unor ? ` - ${item.unor}` : ""}
                    {item.hasUser && item.id !== form.pegawaiId ? " (sudah punya akun)" : ""}
                  </option>
                ))}
              </select>
              {pegawaiLoading ? (
                <div className="text-muted fs-8 mt-2">Memuat opsi pegawai...</div>
              ) : null}
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Role</label>
              <div className="row g-3">
                {roles.map((role) => {
                  const checked = form.roleIds.includes(role.id)

                  return (
                    <div className="col-12 col-md-6" key={role.id}>
                      <label className="form-check form-check-custom form-check-solid rounded border border-gray-300 px-4 py-3 w-100">
                        <input
                          type="checkbox"
                          className="form-check-input me-3"
                          checked={checked}
                          onChange={(event) => {
                            setForm((prev) => ({
                              ...prev,
                              roleIds: event.target.checked
                                ? [...prev.roleIds, role.id]
                                : prev.roleIds.filter((item) => item !== role.id),
                            }))
                          }}
                        />
                        <span className="form-check-label fw-semibold text-gray-800">
                          {role.name}
                        </span>
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
            {mode === "create" ? (
              <div className="col-12">
                <label className="form-check form-check-custom form-check-solid">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, isActive: event.target.checked }))
                    }
                  />
                  <span className="form-check-label ms-3">Aktifkan akun setelah dibuat</span>
                </label>
              </div>
            ) : null}
          </div>
        </div>
        <div className="card-footer border-0 d-flex justify-content-end gap-3">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            {submitting ? "Menyimpan..." : mode === "create" ? "Tambah Pengguna" : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UserRegistrationPage() {
  const [status, setStatus] = useState<RegistrationStatus | undefined>("PENDING")
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [items, setItems] = useState<RegistrationQueueItem[]>([])
  const [users, setUsers] = useState<UserListItem[]>([])
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [error, setError] = useState("")
  const [flash, setFlash] = useState("")
  const [userMeta, setUserMeta] = useState<PaginationMeta>(DEFAULT_META)
  const [registrationMeta, setRegistrationMeta] = useState<PaginationMeta>(DEFAULT_META)

  const [userSearchInput, setUserSearchInput] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("")
  const [roleFilter, setRoleFilter] = useState("")
  const [userPage, setUserPage] = useState(1)

  const [registrationSearchInput, setRegistrationSearchInput] = useState("")
  const [registrationSearch, setRegistrationSearch] = useState("")
  const [registrationPage, setRegistrationPage] = useState(1)

  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)

  async function loadQueue(nextStatus = status, nextPage = registrationPage, nextSearch = registrationSearch) {
    setLoading(true)
    setError("")

    try {
      const response = await getRegistrationQueue({
        status: nextStatus,
        page: nextPage,
        limit: 10,
        search: nextSearch,
      })
      setItems(response.data)
      setRegistrationMeta(response.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat registrasi pengguna.")
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers(nextPage = userPage, nextSearch = userSearch) {
    setUsersLoading(true)
    setError("")

    try {
      const response = await getUserList({
        page: nextPage,
        limit: 10,
        search: nextSearch,
        roleId: roleFilter || undefined,
        isActive: activeFilter === "" ? "" : activeFilter === "true",
      })
      setUsers(response.data)
      setUserMeta(response.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat daftar pengguna.")
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    void getRoleOptions().then(setRoles)
  }, [])

  useEffect(() => {
    void loadQueue(status, registrationPage, registrationSearch)
  }, [status, registrationPage, registrationSearch])

  useEffect(() => {
    void loadUsers(userPage, userSearch)
  }, [userPage, userSearch, activeFilter, roleFilter])

  const summary = useMemo(() => {
    return {
      registrations: registrationMeta.total,
      pending: items.filter((item) => item.status === "PENDING").length,
      approved: items.filter((item) => item.status === "APPROVED").length,
      rejected: items.filter((item) => item.status === "REJECTED").length,
      users: userMeta.total,
      activeUsers: users.filter((item) => item.isActive).length,
    }
  }, [items, registrationMeta.total, userMeta.total, users])

  const initialFormValue: UserFormState = selectedUser
    ? {
        username: selectedUser.username,
        password: "",
        pegawaiId: selectedUser.pegawaiId ?? "",
        roleIds: selectedUser.roleIds,
        isActive: selectedUser.isActive,
      }
    : {
        username: "",
        password: "",
        pegawaiId: "",
        roleIds: [],
        isActive: true,
      }

  async function handleApprove(item: RegistrationQueueItem) {
    const note = window.prompt(
      `Catatan approve untuk ${item.pegawai.nama} (opsional):`,
      item.note ?? "",
    )

    setSubmittingId(item.id)
    setFlash("")

    try {
      const response = await approveRegistration(item.id, {
        note: note?.trim() || undefined,
      })
      setFlash(response.message)
      await loadQueue(status, registrationPage, registrationSearch)
      await loadUsers(userPage, userSearch)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyetujui registrasi.")
    } finally {
      setSubmittingId(null)
    }
  }

  async function handleReject(item: RegistrationQueueItem) {
    const note = window.prompt(
      `Alasan penolakan untuk ${item.pegawai.nama}:`,
      item.note ?? "",
    )

    if (note === null) return

    setSubmittingId(item.id)
    setFlash("")

    try {
      const response = await rejectRegistration(item.id, {
        note: note.trim() || undefined,
      })
      setFlash(response.message)
      await loadQueue(status, registrationPage, registrationSearch)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menolak registrasi.")
    } finally {
      setSubmittingId(null)
    }
  }

  async function handleToggleUser(user: UserListItem) {
    try {
      const response = await toggleUserStatus(user.id, !user.isActive)
      setFlash(response.message)
      await loadUsers(userPage, userSearch)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status pengguna.")
    }
  }

  async function handleDeleteUser(user: UserListItem) {
    const confirmed = window.confirm(
      `Hapus pengguna ${user.username}? Aksi ini tidak bisa dibatalkan.`,
    )

    if (!confirmed) return

    try {
      const response = await deleteUser(user.id)
      setFlash(response.message)
      await loadUsers(userPage, userSearch)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus pengguna.")
    }
  }

  async function handleSubmitUserForm(value: UserFormState) {
    setError("")
    setFlash("")

    if (modalMode === "create") {
      const response = await createUser({
        username: value.username.trim(),
        password: value.password,
        pegawaiId: value.pegawaiId || undefined,
        roleIds: value.roleIds,
        isActive: value.isActive,
      })
      setFlash(response.message)
    } else if (selectedUser) {
      const response = await updateUser(selectedUser.id, {
        username: value.username.trim(),
        pegawaiId: value.pegawaiId || undefined,
        roleIds: value.roleIds,
        isActive: value.isActive,
      })
      setFlash(response.message)
    }

    setModalOpen(false)
    setSelectedUser(null)
    await loadUsers(userPage, userSearch)
  }

  return (
    <div className="d-flex flex-column gap-7">
      <PageTitle breadcrumbs={USER_BREADCRUMBS}>Pengguna</PageTitle>

      <section className="card border-0 shadow-sm overflow-hidden">
        <div
          className="px-6 px-lg-8 py-6"
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #16224a 52%, #0f172a 100%)",
          }}
        >
          <div className="d-flex align-items-start justify-content-between gap-4 mb-4">
            <div className="flex-grow-1">
              <div className="text-white fw-bolder fs-2 mb-2">Pengguna</div>
              <div className="text-white opacity-75 fs-6 lh-lg">
                Kelola akun aktif, role pengguna, dan review registrasi operator
                dari satu halaman kerja admin.
              </div>
            </div>

            <div
              className="rounded-circle d-none d-lg-inline-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 68,
                height: 68,
                background: "rgba(255,255,255,0.12)",
                color: "#ffffff",
              }}
            >
              <KTIcon iconName="profile-user" className="fs-1" />
            </div>
          </div>

          <div className="rounded-4 px-4 py-3 text-white border border-white border-opacity-25">
            <div className="fw-semibold fs-6 mb-2">
              Area ini dipakai untuk memastikan hanya user yang valid dan role yang tepat
              yang bisa masuk ke sistem.
            </div>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge badge-light-primary">Total User {userMeta.total}</span>
              <span className="badge badge-light-success">Aktif {summary.activeUsers}</span>
              <span className="badge badge-light-warning">Pending {registrationMeta.total}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="card">
        <div className="card-header border-0 pt-6">
          <div className="card-title d-flex flex-column">
            <h3 className="fw-bold text-gray-900 mb-1">Daftar Pengguna Sistem</h3>
            <div className="text-muted fs-7">
              Cari, filter, tambah, ubah, aktifkan, nonaktifkan, atau hapus akun pengguna.
            </div>
          </div>
        </div>

        <div className="card-body pt-2">
          {error ? <div className="alert alert-danger py-3">{error}</div> : null}
          {flash ? <div className="alert alert-success py-3">{flash}</div> : null}

          <div className="row g-4 align-items-end mb-5">
            <div className="col-12 col-lg-4">
              <label className="form-label fw-semibold">Cari Pengguna</label>
              <input
                className="form-control"
                value={userSearchInput}
                onChange={(event) => setUserSearchInput(event.target.value)}
                placeholder="Username, nama, NIP, atau unit"
              />
            </div>
            <div className="col-12 col-lg-3">
              <label className="form-label fw-semibold">Status Akun</label>
              <select
                className="form-select"
                value={activeFilter}
                onChange={(event) => {
                  setActiveFilter(event.target.value)
                  setUserPage(1)
                }}
              >
                {USER_ACTIVE_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-lg-3">
              <label className="form-label fw-semibold">Role</label>
              <select
                className="form-select"
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value)
                  setUserPage(1)
                }}
              >
                <option value="">Semua Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-lg-2 d-flex gap-2">
              <button
                type="button"
                className="btn btn-light-primary w-100"
                onClick={() => {
                  setUserPage(1)
                  setUserSearch(userSearchInput.trim())
                }}
              >
                Cari
              </button>
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={() => {
                  setModalMode("create")
                  setSelectedUser(null)
                  setModalOpen(true)
                }}
              >
                Tambah
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-4">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th>Username</th>
                  <th>Pegawai</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 fw-semibold">
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted">
                      Memuat pengguna...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted">
                      Tidak ada pengguna yang cocok dengan filter saat ini.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-bold text-gray-900">
                            {user.pegawai?.nama ?? "-"}
                          </span>
                          <span className="text-muted fs-7">
                            {user.pegawai?.nip ? `NIP ${user.pegawai.nip}` : "Tanpa pegawai"}
                          </span>
                          <span className="text-muted fs-7">{user.pegawai?.unor ?? "-"}</span>
                        </div>
                      </td>
                      <td>{user.roles.join(", ") || "-"}</td>
                      <td>
                        <span
                          className={clsx(
                            "badge",
                            user.isActive ? "badge-light-success" : "badge-light-secondary",
                          )}
                        >
                          {user.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-light-primary"
                            onClick={() => {
                              setModalMode("edit")
                              setSelectedUser(user)
                              setModalOpen(true)
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={clsx(
                              "btn btn-sm",
                              user.isActive ? "btn-light-warning" : "btn-light-success",
                            )}
                            onClick={() => void handleToggleUser(user)}
                          >
                            {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light-danger"
                            onClick={() => void handleDeleteUser(user)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls meta={userMeta} onChange={setUserPage} />
        </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-header border-0 pt-6 pb-0">
          <div className="card-title d-flex flex-column">
            <h3 className="fw-bold text-gray-900 mb-1">Registrasi Menunggu Review</h3>
            <div className="text-muted fs-7">
              Tinjau pendaftaran operator, cek data pengaju, lalu ambil keputusan approve
              atau reject dari satu area kerja.
            </div>
          </div>
        </div>

        <div className="card-body pt-5">
          <div className="rounded-4 border border-gray-200 bg-light-primary bg-opacity-10 px-5 py-5 mb-6">
            <div className="d-flex flex-column flex-xl-row align-items-xl-start justify-content-between gap-5">
              <div className="flex-grow-1">
                <div className="text-gray-900 fw-bold fs-5 mb-2">Filter Registrasi</div>
                <div className="text-muted fs-7 mb-4">
                  Cari pengaju berdasarkan identitas atau sempitkan hasil berdasarkan status
                  review yang sedang Anda tangani.
                </div>

                <div className="row g-4 align-items-end">
                  <div className="col-12 col-xl-6">
                    <label className="form-label fw-semibold">Cari Registrasi</label>
                    <div className="d-flex gap-3">
                      <input
                        className="form-control"
                        value={registrationSearchInput}
                        onChange={(event) => setRegistrationSearchInput(event.target.value)}
                        placeholder="Nama, NIP, username, email, atau unit"
                      />
                      <button
                        type="button"
                        className="btn btn-light-primary flex-shrink-0"
                        style={{ minWidth: 120 }}
                        onClick={() => {
                          setRegistrationPage(1)
                          setRegistrationSearch(registrationSearchInput.trim())
                        }}
                      >
                        Cari
                      </button>
                    </div>
                  </div>
                  <div className="col-12 col-xl-6">
                    <label className="form-label fw-semibold">Status Registrasi</label>
                    <div className="d-flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((option) => {
                        const active = status === option.value

                        return (
                          <button
                            key={option.label}
                            type="button"
                            className={clsx(
                              "btn btn-sm",
                              active ? "btn-primary" : "btn-light-primary",
                            )}
                            onClick={() => {
                              setStatus(option.value)
                              setRegistrationPage(1)
                            }}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-row flex-xl-column gap-3 flex-wrap" style={{ minWidth: 240 }}>
                <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 flex-grow-1">
                  <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                    Menunggu Review
                  </div>
                  <div className="fw-bolder fs-2 text-warning mb-1">{summary.pending}</div>
                  <div className="text-gray-600 fs-8">Registrasi yang masih perlu keputusan.</div>
                </div>
                <div className="rounded-4 border border-gray-200 bg-white px-4 py-4 flex-grow-1">
                  <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                    Total Queue
                  </div>
                  <div className="fw-bolder fs-2 text-primary mb-1">{registrationMeta.total}</div>
                  <div className="text-gray-600 fs-8">Jumlah data sesuai filter yang aktif.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-4">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th>Pegawai</th>
                  <th>Kontak</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Diajukan</th>
                  <th>Review</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 fw-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted">
                      Memuat registrasi...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted">
                      Tidak ada registrasi yang cocok dengan filter saat ini.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-bold text-gray-900">{item.pegawai.nama}</span>
                          <span className="text-muted fs-7">NIP {item.pegawai.nip}</span>
                          <span className="text-muted fs-7">{item.pegawai.unor ?? "-"}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span>{item.email}</span>
                          <span className="text-muted fs-7">{item.noHp}</span>
                        </div>
                      </td>
                      <td>{item.requestedRole ?? "-"}</td>
                      <td>
                        <span className={STATUS_STYLES[item.status]}>{item.status}</span>
                      </td>
                      <td>{formatDate(item.submittedAt)}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <span>{item.reviewerName ?? "-"}</span>
                          <span className="text-muted fs-7">{formatDate(item.reviewedAt)}</span>
                          <span className="text-muted fs-7">{item.note || "-"}</span>
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-light-success"
                            disabled={item.status !== "PENDING" || submittingId === item.id}
                            onClick={() => void handleApprove(item)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light-danger"
                            disabled={item.status !== "PENDING" || submittingId === item.id}
                            onClick={() => void handleReject(item)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls meta={registrationMeta} onChange={setRegistrationPage} />
        </div>
      </div>

      <UserFormModal
        open={modalOpen}
        mode={modalMode}
        initialValue={initialFormValue}
        roles={roles}
        onClose={() => {
          setModalOpen(false)
          setSelectedUser(null)
        }}
        onSubmit={handleSubmitUserForm}
      />
    </div>
  )
}
