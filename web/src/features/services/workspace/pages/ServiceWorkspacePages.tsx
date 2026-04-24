import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores/auth.store"
import ServiceTable from "../../base/components/ServiceTable"
import ServiceStatusBadge from "../../base/components/ServiceStatusBadge"
import {
  filterWorkspaceByStatus,
  useServiceWorkspace,
  type WorkspaceServiceItem,
} from "../hooks/useServiceWorkspace"

function isAdminRole(roles: string[]): boolean {
  const normalizedRoles = roles.map((role) => role.trim().toUpperCase())
  return (
    normalizedRoles.includes("SUPER_ADMIN") ||
    normalizedRoles.includes("ADMIN_BKPSDM")
  )
}

function WorkspaceSummary({
  title,
  description,
  count,
  helper,
}: {
  title: string
  description: string
  count: number
  helper: string
}) {
  return (
    <div className="card mb-7">
      <div className="card-body py-8 d-flex flex-wrap justify-content-between align-items-center gap-4">
        <div>
          <h1 className="fw-bold text-gray-900 mb-2">{title}</h1>
          <div className="text-gray-600 fs-5">{description}</div>
          <div className="text-muted fs-7 mt-2">{helper}</div>
        </div>

        <div className="card shadow-sm min-w-150px">
          <div className="card-body py-5">
            <div className="fs-7 text-gray-500">Jumlah</div>
            <div className="fs-2hx fw-bold text-primary">{count}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function WorkspaceTable({
  items,
  onDetail,
}: {
  items: WorkspaceServiceItem[]
  onDetail: (item: WorkspaceServiceItem) => void
}) {
  if (items.length === 0) {
    return (
      <div className="card">
        <div className="card-body py-10 text-muted">
          Belum ada data layanan untuk tampilan ini.
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-row-dashed align-middle gs-0 gy-4 mb-0">
            <thead>
              <tr className="fw-bold text-muted bg-light">
                <th className="ps-6 min-w-200px">Layanan</th>
                <th className="min-w-200px">ASN</th>
                <th className="min-w-180px">Status</th>
                <th className="min-w-180px">Tanggal</th>
                <th className="min-w-120px text-end pe-6">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.serviceKey}-${item.id}`}>
                  <td className="ps-6">
                    <div className="d-flex flex-column">
                      <span className="fw-bold text-gray-900">{item.serviceName}</span>
                      <span className="text-muted fs-7">{item.serviceKey}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="fw-semibold text-gray-900">{item.nama}</span>
                      <span className="text-muted fs-7">{item.nip}</span>
                    </div>
                  </td>
                  <td>
                    <ServiceStatusBadge status={item.status} />
                  </td>
                  <td className="text-gray-700">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString("id-ID")
                      : "-"}
                  </td>
                  <td className="text-end pe-6">
                    <button
                      type="button"
                      className="btn btn-sm btn-light-primary"
                      onClick={() => onDetail(item)}
                    >
                      Lihat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function WorkspaceLoading() {
  return (
    <div className="card">
      <div className="card-body py-10 text-center">Memuat workspace layanan...</div>
    </div>
  )
}

export function DraftWorkspacePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore((state) => ({ user: state.user }))
  const { data, loading } = useServiceWorkspace()

  const roles = user?.roles ?? []
  const pegawaiId = user?.pegawaiId ?? undefined
  const adminView = isAdminRole(roles)

  const filtered = useMemo(() => {
    const drafts = filterWorkspaceByStatus(data, ["DRAFT"])

    if (adminView || !pegawaiId) {
      return drafts
    }

    return drafts.filter((item) => item.pegawaiId === pegawaiId)
  }, [adminView, data, pegawaiId])

  if (loading) {
    return <WorkspaceLoading />
  }

  return (
    <div className="container-fluid">
      <WorkspaceSummary
        title="Draft Saya"
        description="Workspace lintas layanan untuk usulan yang masih berstatus draft."
        count={filtered.length}
        helper={
          adminView
            ? "Menampilkan seluruh draft lintas layanan karena Anda berada pada scope admin."
            : "Menampilkan draft yang terkait dengan ASN pada sesi aktif Anda."
        }
      />

      <WorkspaceTable
        items={filtered}
        onDetail={(item) => navigate(`/layanan/${item.serviceKey}/${item.id}`)}
      />
    </div>
  )
}

export function ServiceStatusWorkspacePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore((state) => ({ user: state.user }))
  const { data, loading } = useServiceWorkspace()

  const roles = user?.roles ?? []
  const pegawaiId = user?.pegawaiId ?? undefined
  const adminView = isAdminRole(roles)

  const filtered = useMemo(() => {
    if (adminView || !pegawaiId) {
      return data
    }

    return data.filter((item) => item.pegawaiId === pegawaiId)
  }, [adminView, data, pegawaiId])

  const items = useMemo(
    () =>
      [...filtered].sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0
        return rightTime - leftTime
      }),
    [filtered],
  )

  if (loading) {
    return <WorkspaceLoading />
  }

  return (
    <div className="container-fluid">
      <WorkspaceSummary
        title="Status Layanan"
        description="Ringkasan lintas layanan untuk memantau status usulan yang sudah dibuat."
        count={items.length}
        helper={
          adminView
            ? "Menampilkan seluruh usulan lintas layanan karena Anda berada pada scope admin."
            : "Menampilkan usulan yang terkait dengan ASN pada sesi aktif Anda."
        }
      />

      <WorkspaceTable
        items={items}
        onDetail={(item) => navigate(`/layanan/${item.serviceKey}/${item.id}`)}
      />
    </div>
  )
}

