import { useNavigate } from "react-router-dom"
import { StatusBadge } from "@/features/_shared/components/StatusBadge"
import { PensiunListItem } from "../types"

interface Props {
  data?: PensiunListItem[]
  loading: boolean
}

export function PensiunListTable({
  data,
  loading,
}: Props) {
  const navigate = useNavigate()

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-10">Belum ada usulan</div>
  }

  return (
    <table className="table align-middle">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tanggal</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>
              {new Date(item.tanggal_usul).toLocaleDateString("id-ID")}
            </td>
            <td>
              <StatusBadge status={item.status} />
            </td>
            <td>
              <button
                className="btn btn-sm btn-light-primary"
                onClick={() =>
                  navigate(`/layanan/pensiun/${item.id}`)
                }
              >
                Detail
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}