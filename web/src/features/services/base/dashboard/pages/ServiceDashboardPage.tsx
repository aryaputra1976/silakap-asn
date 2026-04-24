import { useNavigate, useParams } from "react-router-dom"
import { useServiceDashboard } from "../hooks/useServiceDashboard"
import { hasService } from "../../registry"

import DashboardStats from "../components/DashboardStats"
import DashboardChart from "../components/DashboardChart"
import DashboardRecentTable from "../components/DashboardRecentTable"

export default function ServiceDashboardPage() {

  const { service } = useParams<{ service: string }>()
  const navigate = useNavigate()
  const isRegistered = Boolean(service && hasService(service))

  const { data, loading, error } = useServiceDashboard(
    service ?? "",
    isRegistered,
  )

  if (!service) {
    return <div className="alert alert-danger">Service tidak ditemukan</div>
  }

  if (!isRegistered) {
    return (
      <div className="alert alert-warning">
        Layanan belum tersedia untuk diakses.
      </div>
    )
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
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-5">
        <div>
          <h3 className="mb-1 text-capitalize">
            Dashboard {service}
          </h3>
          <div className="text-muted">
            Ringkasan usulan, status workflow, dan aktivitas terbaru layanan.
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-light-primary"
            onClick={() => navigate(`/layanan/${service}/list`)}
          >
            Lihat Daftar
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/layanan/${service}/create`)}
          >
            Buat Usulan
          </button>
        </div>
      </div>

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
