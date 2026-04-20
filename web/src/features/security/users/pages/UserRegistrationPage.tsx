import { useEffect, useMemo, useState } from "react"
import clsx from "clsx"
import {
  approveRegistration,
  getRegistrationQueue,
  getUserList,
  rejectRegistration,
  type RegistrationQueueItem,
  type RegistrationStatus,
  type UserListItem,
} from "../api/registrationAdmin.api"

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

const STATUS_STYLES: Record<RegistrationStatus, string> = {
  PENDING: "badge badge-light-warning",
  APPROVED: "badge badge-light-success",
  REJECTED: "badge badge-light-danger",
  CANCELLED: "badge badge-light-secondary",
}

function formatDate(value: string | null) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function UserRegistrationPage() {
  const [status, setStatus] = useState<RegistrationStatus | undefined>(
    "PENDING",
  )
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [items, setItems] = useState<RegistrationQueueItem[]>([])
  const [users, setUsers] = useState<UserListItem[]>([])
  const [error, setError] = useState("")
  const [flash, setFlash] = useState("")

  async function loadQueue(nextStatus = status) {
    setLoading(true)
    setError("")

    try {
      const response = await getRegistrationQueue(nextStatus)
      setItems(response)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat registrasi pengguna.",
      )
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers() {
    setUsersLoading(true)

    try {
      const response = await getUserList()
      setUsers(response)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat daftar pengguna.",
      )
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    void loadQueue(status)
  }, [status])

  useEffect(() => {
    void loadUsers()
  }, [])

  const summary = useMemo(() => {
    return {
      registrations: items.length,
      pending: items.filter((item) => item.status === "PENDING").length,
      approved: items.filter((item) => item.status === "APPROVED").length,
      rejected: items.filter((item) => item.status === "REJECTED").length,
      users: users.length,
      activeUsers: users.filter((item) => item.isActive).length,
    }
  }, [items, users])

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
      await loadQueue(status)
      await loadUsers()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyetujui registrasi.",
      )
    } finally {
      setSubmittingId(null)
    }
  }

  async function handleReject(item: RegistrationQueueItem) {
    const note = window.prompt(
      `Alasan penolakan untuk ${item.pegawai.nama}:`,
      item.note ?? "",
    )

    if (note === null) {
      return
    }

    setSubmittingId(item.id)
    setFlash("")

    try {
      const response = await rejectRegistration(item.id, {
        note: note.trim() || undefined,
      })
      setFlash(response.message)
      await loadQueue(status)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menolak registrasi.",
      )
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div className="d-flex flex-column gap-7">
      <div className="card">
        <div className="card-body d-flex flex-column flex-lg-row gap-6 justify-content-between align-items-start align-items-lg-center">
          <div>
            <h1 className="mb-2 fs-2hx fw-bold text-gray-900">
              Manajemen Pengguna
            </h1>
            <p className="mb-0 fs-6 text-gray-600">
              Pantau akun yang sudah aktif di sistem sekaligus tinjau
              pendaftaran operator perangkat daerah sebelum akun dibuat.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-3">
            <div className="card shadow-sm min-w-125px">
              <div className="card-body py-4">
                <div className="fs-7 text-gray-500">User</div>
                <div className="fs-2 fw-bold">{summary.users}</div>
              </div>
            </div>
            <div className="card shadow-sm min-w-125px">
              <div className="card-body py-4">
                <div className="fs-7 text-gray-500">Aktif</div>
                <div className="fs-2 fw-bold text-primary">{summary.activeUsers}</div>
              </div>
            </div>
            <div className="card shadow-sm min-w-125px">
              <div className="card-body py-4">
                <div className="fs-7 text-gray-500">Registrasi</div>
                <div className="fs-2 fw-bold">{summary.registrations}</div>
              </div>
            </div>
            <div className="card shadow-sm min-w-125px">
              <div className="card-body py-4">
                <div className="fs-7 text-gray-500">Pending</div>
                <div className="fs-2 fw-bold text-warning">{summary.pending}</div>
              </div>
            </div>
            <div className="card shadow-sm min-w-125px">
              <div className="card-body py-4">
                <div className="fs-7 text-gray-500">Approved</div>
                <div className="fs-2 fw-bold text-success">{summary.approved}</div>
              </div>
            </div>
            <div className="card shadow-sm min-w-125px">
              <div className="card-body py-4">
                <div className="fs-7 text-gray-500">Rejected</div>
                <div className="fs-2 fw-bold text-danger">{summary.rejected}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header border-0 pt-6 d-flex flex-wrap gap-4 justify-content-between align-items-center">
          <div>
            <h3 className="card-title fw-bold text-gray-900 mb-1">
              Pengguna Sistem
            </h3>
            <div className="text-muted fs-7">
              Data akun aktif dan nonaktif diambil dari `silakap_user` dan
              `silakap_user_role`.
            </div>
          </div>

          <button
            type="button"
            className="btn btn-light"
            onClick={() => void loadUsers()}
            disabled={usersLoading}
          >
            Muat User
          </button>
        </div>

        <div className="card-body pt-2">
          <div className="d-flex flex-wrap gap-2 mb-5">
            <span className="badge badge-light-primary">
              Total User {summary.users}
            </span>
            <span className="badge badge-light-success">
              Aktif {summary.activeUsers}
            </span>
            <span className="badge badge-light-secondary">
              Nonaktif {Math.max(summary.users - summary.activeUsers, 0)}
            </span>
          </div>

          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-4">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th>Username</th>
                  <th>Pegawai</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 fw-semibold">
                {usersLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-muted">
                      Memuat pengguna...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-muted">
                      Belum ada pengguna pada sistem.
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
                            {user.pegawai?.nip
                              ? `NIP ${user.pegawai.nip}`
                              : "Tanpa pegawai"}
                          </span>
                          <span className="text-muted fs-7">
                            {user.pegawai?.unor ?? "-"}
                          </span>
                        </div>
                      </td>
                      <td>{user.roles.join(", ") || "-"}</td>
                      <td>
                        <span
                          className={clsx(
                            "badge",
                            user.isActive
                              ? "badge-light-success"
                              : "badge-light-secondary",
                          )}
                        >
                          {user.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header border-0 pt-6 d-flex flex-wrap gap-4 justify-content-between align-items-center">
          <div>
            <h3 className="card-title fw-bold text-gray-900 mb-1">
              Registrasi Pengguna
            </h3>
            <div className="text-muted fs-7">
              Data ini diambil dari `silakap_registrasi_user` untuk proses
              review sebelum akun dibuat.
            </div>
          </div>

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
                  onClick={() => setStatus(option.value)}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="btn btn-light"
            onClick={() => {
              void loadQueue(status)
              void loadUsers()
            }}
            disabled={loading}
          >
            Muat Ulang
          </button>
        </div>

        <div className="card-body pt-2">
          {error && <div className="alert alert-danger py-3">{error}</div>}

          {flash && <div className="alert alert-success py-3">{flash}</div>}

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
                      Belum ada registrasi pada filter ini.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-bold text-gray-900">
                            {item.pegawai.nama}
                          </span>
                          <span className="text-muted fs-7">
                            NIP {item.pegawai.nip}
                          </span>
                          <span className="text-muted fs-7">
                            {item.pegawai.unor ?? "-"}
                          </span>
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
                        <span className={STATUS_STYLES[item.status]}>
                          {item.status}
                        </span>
                      </td>
                      <td>{formatDate(item.submittedAt)}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <span>{item.reviewerName ?? "-"}</span>
                          <span className="text-muted fs-7">
                            {formatDate(item.reviewedAt)}
                          </span>
                          <span className="text-muted fs-7">
                            {item.note || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-light-success"
                            disabled={
                              item.status !== "PENDING" ||
                              submittingId === item.id
                            }
                            onClick={() => void handleApprove(item)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light-danger"
                            disabled={
                              item.status !== "PENDING" ||
                              submittingId === item.id
                            }
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
        </div>
      </div>
    </div>
  )
}
