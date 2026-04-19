import type { DashboardRecent } from "../api/dashboard.api"

interface Props {
  data: DashboardRecent[]
}

export default function DashboardRecentTable({ data }: Props) {

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center text-muted">
          Tidak ada data terbaru
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-body p-0">

        <table className="table table-row-bordered table-row-gray-100 align-middle gs-0 gy-3 mb-0">

          <thead>
            <tr className="fw-bold text-muted">
              <th>Nomor</th>
              <th>Pemohon</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>

          <tbody>

            {data.map((row) => (
              <tr key={row.id}>
                <td>{row.nomor}</td>
                <td>{row.pemohon}</td>
                <td className="text-capitalize">{row.status}</td>
                <td>{row.createdAt}</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>
    </div>
  )
}