import { StatCard } from "./StatCard"
import type { DashboardSummary } from "../types"

interface Props {
  data: DashboardSummary
}

export function SummaryWidget({ data }: Props) {
  return (
    <div className="row g-5 mb-5">
      <div className="col-md-3">
        <StatCard title="Total ASN" value={data.totalAsn} />
      </div>
      <div className="col-md-3">
        <StatCard title="Total Usul" value={data.totalUsul} />
      </div>
      <div className="col-md-3">
        <StatCard title="Usul Proses" value={data.usulProses} />
      </div>
      <div className="col-md-3">
        <StatCard title="Usul Selesai" value={data.usulSelesai} />
      </div>
    </div>
  )
}