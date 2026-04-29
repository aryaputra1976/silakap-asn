// web/src/features/profil-asn/components/AsnTable.tsx
import { useLocation, useNavigate } from "react-router-dom"
import type { AsnItem } from "../hooks/useAsnList"

function normalizeStatus(status: string) {
  return status.trim().toUpperCase().replace(/\s+/g, "_")
}

function statusBadgeClass(status: string) {
  const normalized = normalizeStatus(status)

  if (normalized === "PNS") return "badge-light-primary text-primary"
  if (normalized === "PPPK") return "badge-light-success text-success"
  return "badge-light-warning text-warning"
}

function statusTableLabel(status: string) {
  const normalized = normalizeStatus(status)

  if (normalized === "PNS") return "PNS"
  if (normalized === "PPPK") return "PPPK"
  if (normalized === "PPPK_PARUH_WAKTU") return "PPPK PW"

  return status
}

function golonganBadgeClass(golongan?: string) {
  if (!golongan) return "badge-light-secondary text-muted"

  if (golongan.startsWith("IV")) {
    return "badge-light-danger text-danger"
  }

  if (golongan.startsWith("III")) {
    return "badge-light-warning text-warning"
  }

  return "badge-light-secondary text-gray-700"
}

function TruncatedText({
  value,
  width,
  className = "",
}: {
  value: string
  width: number
  className?: string
}) {
  return (
    <div
      className={`text-truncate ${className}`}
      style={{ maxWidth: `${width}px` }}
      title={value}
    >
      {value}
    </div>
  )
}

export function AsnTable({
  data,
  loading,
}: {
  data: AsnItem[]
  loading: boolean
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const backTo = `${location.pathname}${location.search}`

  return (
    <div className="table-responsive">
      <table
        className="table align-middle table-row-dashed fs-6 gy-3 mb-0"
        style={{ tableLayout: "fixed", width: "100%" }}
      >
        <thead>
          <tr className="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
            <th className="ps-0" style={{ width: "32%" }}>
              ASN
            </th>
            <th style={{ width: "18%" }}>Status / Gol</th>
            <th style={{ width: "30%" }}>Posisi & Unit</th>
            <th className="text-end pe-0 text-nowrap" style={{ width: "20%" }}>
              Aksi
            </th>
          </tr>
        </thead>

        <tbody className="fw-semibold text-gray-700">
          {loading && data.length === 0 && (
            <tr>
              <td colSpan={4}>
                <div className="d-flex flex-column align-items-center justify-content-center py-12">
                  <div className="spinner-border text-primary mb-3" role="status" />
                  <div className="text-muted fw-semibold fs-7">
                    Memuat data ASN...
                  </div>
                </div>
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={4}>
                <div className="d-flex flex-column align-items-center justify-content-center py-12">
                  <span className="symbol symbol-60px mb-3">
                    <span className="symbol-label bg-light-warning">
                      <i className="ki-duotone ki-file-deleted fs-2x text-warning">
                        <span className="path1" />
                        <span className="path2" />
                        <span className="path3" />
                      </i>
                    </span>
                  </span>

                  <div className="fs-5 fw-bolder text-gray-900 mb-1">
                    Data tidak ditemukan
                  </div>

                  <div className="text-muted fs-7">
                    Coba ubah kata kunci, status, atau unit organisasi.
                  </div>
                </div>
              </td>
            </tr>
          )}

          {data.map((row) => (
            <tr key={row.id}>
              <td className="ps-0">
                <div className="d-flex flex-column py-1 min-w-0">
                  <TruncatedText
                    value={row.nama}
                    width={300}
                    className="text-gray-900 fw-bolder fs-5"
                  />
                  <span className="text-muted fs-7">{row.nip}</span>
                </div>
              </td>

              <td>
                <div className="d-flex flex-wrap gap-2 py-1">
                  <span
                    className={`badge fw-bold fs-8 text-nowrap ${statusBadgeClass(
                      row.statusAsn
                    )}`}
                    title={row.statusAsn}
                  >
                    {statusTableLabel(row.statusAsn)}
                  </span>

                  {row.golongan ? (
                    <span
                      className={`badge fw-bold fs-8 text-nowrap ${golonganBadgeClass(
                        row.golongan
                      )}`}
                    >
                      {row.golongan}
                    </span>
                  ) : (
                    <span className="badge badge-light-secondary fw-bold fs-8 text-muted text-nowrap">
                      -
                    </span>
                  )}
                </div>
              </td>

              <td>
                <div className="d-flex flex-column py-1 min-w-0">
                  <TruncatedText
                    value={row.jabatan ?? "-"}
                    width={340}
                    className="text-gray-900 fw-semibold"
                  />
                  <TruncatedText
                    value={row.unitKerja ?? "-"}
                    width={340}
                    className="text-muted fs-7"
                  />
                </div>
              </td>

              <td className="text-end pe-0">
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-light px-3 py-2 text-nowrap"
                    title="Riwayat Kepegawaian"
                    onClick={() => navigate(`/data-asn/riwayat?pegawai=${row.id}`)}
                  >
                    Riwayat
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-light-primary px-3 py-2 text-nowrap"
                    onClick={() =>
                      navigate(`/asn/profil/${row.id}`, {
                        state: { backTo },
                      })
                    }
                  >
                    Detail
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}