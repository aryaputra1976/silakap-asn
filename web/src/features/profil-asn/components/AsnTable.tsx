import { useNavigate } from "react-router-dom"
import { AsnItem } from "../hooks/useAsnList"

function statusBadge(status: string) {

  if (status === "PNS") return "badge-light-primary"
  if (status === "PPPK") return "badge-light-success"

  return "badge-light-warning"

}

function golonganBadge(gol: string | null) {

  if (!gol) return "-"

  if (gol.startsWith("IV")) {
    return <span className="badge badge-light-danger">{gol}</span>
  }

  if (gol.startsWith("III")) {
    return <span className="badge badge-light-warning">{gol}</span>
  }

  return <span className="badge badge-light-secondary">{gol}</span>

}

export function AsnTable({
  data,
  loading
}: {
  data: AsnItem[]
  loading: boolean
}) {

  const navigate = useNavigate()

  return (

    <div className="table-responsive">

      <table className="table table-row-bordered table-row-dashed align-middle">

        <thead>
          <tr className="text-muted fw-bold">
            <th>ASN</th>
            <th>Status</th>
            <th>Gol</th>
            <th>Jabatan</th>
            <th>Unit Kerja</th>
            <th className="text-end">Aksi</th>
          </tr>
        </thead>

        <tbody>

          {loading && data.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-10">
                Loading ASN...
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center">
                Data tidak ditemukan
              </td>
            </tr>
          )}

          {data.map((row) => (

            <tr key={row.id} className="cursor-pointer hover-bg-light">

              <td>
                <div className="fw-bold">{row.nama}</div>
                <div className="text-muted fs-7">{row.nip}</div>
              </td>

              <td>
                <span className={`badge ${statusBadge(row.statusAsn)}`}>
                  {row.statusAsn}
                </span>
              </td>

              <td>{golonganBadge(row.golongan ?? null)}</td>

              <td>{row.jabatan ?? "-"}</td>

              <td>{row.unitKerja ?? "-"}</td>

              <td className="text-end">

                <button
                  className="btn btn-sm btn-light-primary"
                  onClick={() => navigate(`/asn/profil/${row.id}`)}
                >
                  Detail
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )
}