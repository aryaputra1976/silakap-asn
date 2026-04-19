import type { DashboardStat } from "../api/dashboard.api"

interface Props {
  stats: DashboardStat[]
}

export default function DashboardStats({ stats }: Props) {

  return (
    <div className="row g-5">

      {stats.map((stat) => (

        <div className="col-md-3" key={stat.status}>

          <div className="card">
            <div className="card-body">

              <div className="text-muted text-capitalize">
                {stat.status}
              </div>

              <div className="fs-2 fw-bold">
                {stat.count}
              </div>

            </div>
          </div>

        </div>

      ))}

    </div>
  )
}