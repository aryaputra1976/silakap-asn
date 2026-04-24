import { useNavigate } from "react-router-dom"

import ServiceStatusBadge from "@/features/services/base/components/ServiceStatusBadge"

import type { DisposisiItem } from "../types"

interface Props {
  data?: DisposisiItem[]
  loading: boolean
}

function formatDate(value?: string | null) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function getDisposisiBadge(status: DisposisiItem["status"]) {
  if (status === "DONE") return "badge badge-light-success"
  if (status === "ACCEPTED") return "badge badge-light-primary"
  return "badge badge-light-warning"
}

export function DisposisiTable({ data = [], loading }: Props) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="rounded-4 border border-gray-200 bg-light px-5 py-10 text-center text-muted">
        Memuat daftar disposisi...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-4 border border-gray-200 bg-light px-5 py-10 text-center">
        <div className="fw-bold text-gray-800 fs-4 mb-2">Tidak ada disposisi yang cocok</div>
        <div className="text-muted fs-7">
          Coba ubah kata kunci atau status untuk melihat disposisi lain.
        </div>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle table-row-dashed fs-6 gy-4">
        <thead>
          <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
            <th>Usulan</th>
            <th>Layanan</th>
            <th>Status Usulan</th>
            <th>Tujuan</th>
            <th>Status Disposisi</th>
            <th>Dibuat</th>
            <th>Selesai</th>
            <th className="text-end">Aksi</th>
          </tr>
        </thead>
        <tbody className="text-gray-700 fw-semibold">
          {data.map((row) => {
            const serviceCode = row.usul.jenis?.kode?.toLowerCase()

            return (
              <tr key={row.id}>
                <td>
                  <div className="d-flex flex-column">
                    <span className="fw-bold text-gray-900">
                      {row.usul.pegawai?.nama ?? "-"}
                    </span>
                    <span className="text-muted fs-7">
                      {row.usul.pegawai?.nip ? `NIP ${row.usul.pegawai.nip}` : "-"}
                    </span>
                    <span className="text-muted fs-8">USUL-{row.usul.id}</span>
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <span>{row.usul.jenis?.nama ?? "-"}</span>
                    <span className="text-muted fs-7">{row.usul.jenis?.kode ?? "-"}</span>
                  </div>
                </td>
                <td>
                  <ServiceStatusBadge status={row.usul.status} />
                </td>
                <td>
                  <div className="d-flex flex-column">
                    <span>{row.toRoleCode ?? "-"}</span>
                    <span className="text-muted fs-7">
                      {row.isActive ? "Masih aktif" : "Sudah nonaktif"}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={getDisposisiBadge(row.status)}>{row.status}</span>
                </td>
                <td>{formatDate(row.createdAt)}</td>
                <td>{formatDate(row.completedAt)}</td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-light-primary"
                    disabled={!serviceCode}
                    onClick={() => {
                      if (!serviceCode) return
                      navigate(`/layanan/${serviceCode}/${row.usul.id}`)
                    }}
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
