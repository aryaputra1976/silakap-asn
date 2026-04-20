import { useDashboardSummary } from "../hooks/useDashboardSummary"
import { SummaryWidget } from "../components/SummaryWidget"
import { ActivityList } from "../components/ActivityList"
import { useOperatorOpdScope } from "@/features/auth/hooks/useOperatorOpdScope"

import GolonganChart from "@/features/statistics/components/charts/GolonganChart"
import JabatanChart from "@/features/statistics/components/charts/JabatanChart"
import UsiaChart from "@/features/statistics/components/charts/UsiaChart"
import OpdTable from "@/features/statistics/components/tables/OpdTable"

export default function DashboardPage() {
  const scope = useOperatorOpdScope()
  const { data, isLoading, isError } = useDashboardSummary(scope.unorId)

  if (scope.loading) {
    return (
      <div className="container-xxl">
        <div className="card p-10 text-center">
          Menyiapkan dashboard OPD...
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container-xxl">
        <div className="card p-10 text-center">
          Loading dashboard...
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="container-xxl">
        <div className="card p-10 text-danger">
          Gagal memuat dashboard
        </div>
      </div>
    )
  }

  return (

    <div className="container-xxl">

      <h1 className="mb-5">
        Dashboard SILAKAP
      </h1>

      {scope.isOperatorScoped && (
        <div className="alert alert-light-primary border border-primary border-dashed mb-5">
          Menampilkan dashboard berdasarkan OPD aktif:
          <span className="fw-bold ms-2">
            {scope.unorName ?? "Unit kerja operator"}
          </span>
        </div>
      )}

      {/* SUMMARY */}
      <SummaryWidget data={data} />

      {/* DISTRIBUTION CHARTS */}

      <div className="row g-5 mb-5">

        <div className="col-xl-4">
          <div className="card p-5">
            <h4 className="mb-4">Distribusi Golongan</h4>
            <GolonganChart data={data.distribution.golongan} />
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card p-5">
            <h4 className="mb-4">Distribusi Jabatan</h4>
            <JabatanChart data={data.distribution.jabatan} />
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card p-5">
            <h4 className="mb-4">Distribusi Usia</h4>
            <UsiaChart data={data.distribution.usia} />
          </div>
        </div>

      </div>

      {/* OPD TABLE */}

      <div className="row g-5 mb-5">

        <div className="col-xl-12">

          <div className="card p-5">

            <h4 className="mb-4">
              {scope.isOperatorScoped ? "ASN pada OPD Aktif" : "ASN per OPD"}
            </h4>

            <OpdTable data={data.organization.opd} />

          </div>

        </div>

      </div>

      {/* ACTIVITY */}

      <div className="card p-5">

        <h3 className="mb-4">
          Aktivitas Terbaru
        </h3>

        <ActivityList items={data.aktivitasTerbaru} />

      </div>

    </div>

  )

}
