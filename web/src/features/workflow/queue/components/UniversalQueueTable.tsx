import { useNavigate } from "react-router-dom"

import type { UniversalQueueItem } from "../types"
import ServiceStatusBadge from "@/features/services/base/components/ServiceStatusBadge"

interface Props {
  data?: UniversalQueueItem[]
  loading: boolean
}

function formatDate(value?: string | null) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value))
}

function formatAge(days: number) {
  if (days <= 0) return "Hari ini"
  if (days === 1) return "1 hari"
  return `${days} hari`
}

export function UniversalQueueTable({ data = [], loading }: Props) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="rounded-4 border border-gray-200 bg-light px-5 py-10 text-center text-muted">
        Memuat antrian verifikasi...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-4 border border-gray-200 bg-light px-5 py-10 text-center">
        <div className="fw-bold text-gray-800 fs-4 mb-2">Tidak ada usulan yang cocok</div>
        <div className="text-muted fs-7">
          Coba ubah keyword pencarian, status, atau layanan untuk melihat item lain.
        </div>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle table-row-dashed fs-6 gy-4">
        <thead>
          <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
            <th>Prioritas</th>
            <th>ASN</th>
            <th>Layanan</th>
            <th>Status</th>
            <th>Step Aktif</th>
            <th>Role Tujuan</th>
            <th>Diajukan</th>
            <th>Aging</th>
            <th className="text-end">Aksi</th>
          </tr>
        </thead>

        <tbody className="text-gray-700 fw-semibold">
          {data.map((item) => {
            const serviceCode = item.jenis.kode.toLowerCase()

            return (
              <tr key={item.id}>
                <td>
                  <div className="d-flex flex-column gap-2">
                    {item.isOverdue ? (
                      <span className="badge badge-light-danger">Overdue</span>
                    ) : (
                      <span className="badge badge-light-primary">Normal</span>
                    )}
                    {item.requiresSeniorReview ? (
                      <span className="badge badge-light-warning">Senior Review</span>
                    ) : null}
                  </div>
                </td>

                <td>
                  <div className="d-flex flex-column">
                    <span className="fw-bold text-gray-900">{item.pegawai.nama}</span>
                    <span className="text-muted fs-7">NIP {item.pegawai.nip}</span>
                    <span className="text-muted fs-8">USUL-{item.id}</span>
                  </div>
                </td>

                <td>
                  <div className="d-flex flex-column">
                    <span>{item.jenis.nama}</span>
                    <span className="text-muted fs-7">{item.jenis.kode}</span>
                  </div>
                </td>

                <td>
                  <ServiceStatusBadge status={item.status} />
                </td>

                <td>
                  <span className="badge badge-light-info">
                    {item.currentStepCode ?? "-"}
                  </span>
                </td>

                <td>
                  <div className="d-flex flex-column">
                    <span>{item.activeAssignment?.assignedRoleCode ?? item.currentRoleCode ?? "-"}</span>
                    <span className="text-muted fs-7">
                      {formatDate(item.activeAssignment?.assignedAt ?? null)}
                    </span>
                  </div>
                </td>

                <td>
                  <div className="d-flex flex-column">
                    <span>{formatDate(item.submittedAt ?? item.tanggalUsul)}</span>
                    <span className="text-muted fs-7">
                      Deadline {formatDate(item.slaDeadline)}
                    </span>
                  </div>
                </td>

                <td>
                  <span className={item.isOverdue ? "text-danger fw-bold" : ""}>
                    {formatAge(item.ageDays)}
                  </span>
                </td>

                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-light-primary"
                    onClick={() =>
                      navigate(`/layanan/${serviceCode}/${item.id}`)
                    }
                  >
                    Buka Detail
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
