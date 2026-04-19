import type { DashboardActivity } from "../types"

interface Props {
  items: DashboardActivity[]
}

export function ActivityList({ items }: Props) {
  if (!items.length) {
    return <div className="text-gray-500">Belum ada aktivitas</div>
  }

  return (
    <ul className="list-unstyled">
      {items.map(a => (
        <li key={a.id} className="mb-3">
          <div className="fw-semibold">{a.judul}</div>
          <div className="text-gray-500 fs-7">
            {new Date(a.tanggal).toLocaleString("id-ID")}
          </div>
        </li>
      ))}
    </ul>
  )
}