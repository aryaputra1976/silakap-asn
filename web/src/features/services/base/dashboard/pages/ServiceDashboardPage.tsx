import { useParams } from "react-router-dom"
import { useServiceDashboard } from "../hooks/useServiceDashboard"

import DashboardStats from "../components/DashboardStats"
import DashboardChart from "../components/DashboardChart"
import DashboardRecentTable from "../components/DashboardRecentTable"

export default function ServiceDashboardPage() {

  const { service } = useParams<{ service: string }>()

  const { data, loading, error } = useServiceDashboard(service ?? "")

  if (!service) {
    return <div className="alert alert-danger">Service tidak ditemukan</div>
  }

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Gagal memuat dashboard
      </div>
    )
  }

  if (!data) {
    return (
      <div className="alert alert-warning">
        Data dashboard kosong
      </div>
    )
  }

  return (
    <div className="container-fluid">

      <DashboardStats stats={data.stats} />

      <div className="row mt-5">

        <div className="col-lg-8">
          <DashboardChart stats={data.stats} />
        </div>

        <div className="col-lg-4">
          <DashboardRecentTable data={data.recent} />
        </div>

      </div>

    </div>
  )
}