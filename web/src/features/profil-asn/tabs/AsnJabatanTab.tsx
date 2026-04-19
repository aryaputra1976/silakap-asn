import { useParams } from "react-router-dom"
import { useAsnJabatan } from "../hooks/useAsnJabatan"

export function AsnJabatanTab() {
  const { id } = useParams()

  const { data, loading } = useAsnJabatan(id)

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-10">
          Loading Riwayat Jabatan...
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-body">

        <table className="table align-middle table-row-dashed">
          <thead>
            <tr className="text-muted fw-bold">
              <th>TMT</th>
              <th>Jabatan</th>
              <th>Unit Kerja</th>
              <th>No SK</th>
            </tr>
          </thead>

          <tbody>

            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  Belum ada riwayat jabatan
                </td>
              </tr>
            )}

            {data.map((row) => (
              <tr key={row.id}>
                <td>
                  {new Date(row.tmt).toLocaleDateString("id-ID")}
                </td>

                <td>{row.jabatan}</td>

                <td>{row.unitKerja}</td>

                <td>{row.nomorSk ?? "-"}</td>
              </tr>
            ))}

          </tbody>
        </table>

      </div>
    </div>
  )
}