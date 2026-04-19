import WorkforceCards from "../components/WorkforceCards"
import WorkforceCharts from "../components/WorkforceCharts"
import WorkforceProjectionChart from "../components/WorkforceProjectionChart"
import WorkforceRiskCards from "../components/WorkforceRiskCards"
import WorkforceRiskHeatmap from "../components/WorkforceRiskHeatmap"
import WorkforceSimulator from "../components/WorkforceSimulator"
import WorkforceOpdRiskTable from "../components/WorkforceOpdRiskTable"
import WorkforceGapChart from "../components/WorkforceGapChart"
import WorkforceRecommendationPanel from "../components/WorkforceRecommendationPanel"

import { useWorkforceDashboard } from "../hooks/useWorkforceDashboard"
import { useWorkforceOpd } from "../hooks/useWorkforceOpd"

export default function WorkforceDashboardPage() {

  const tahun = new Date().getFullYear()

  const { data, isLoading, isError } =
    useWorkforceDashboard(tahun)

  const { data: opdData } =
    useWorkforceOpd(tahun)

  if (isLoading) {
    return (
      <div className="py-10 text-center text-gray-500">
        Memuat Workforce Dashboard...
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="py-10 text-center text-red-500">
        Data workforce tidak tersedia
      </div>
    )
  }

  const summary = data.summary
  const demandForecast = opdData ?? []

  return (

    <div className="container-fluid">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-2xl font-bold">
          Workforce Planning Dashboard
        </h1>

        <p className="text-gray-500 text-sm">
          Analisis kebutuhan ASN berdasarkan proyeksi pensiun
          dan ketersediaan pegawai dalam 5 tahun ke depan.
        </p>

      </div>

      {/* KPI */}

      <WorkforceCards data={data} />

      {/* OVERVIEW + RISK */}

      <div className="row g-5 mb-5">

        <div className="col-xl-8">

          <WorkforceCharts
            data={data}
          />

        </div>

        <div className="col-xl-4">

          <WorkforceRiskCards
            risk={data.risk}
          />

        </div>

      </div>

      {/* PROJECTION + GAP */}

      <div className="row g-5 mb-5">

        <div className="col-xl-6">

          <WorkforceProjectionChart
            projection={data.projection ?? []}
          />

        </div>

        <div className="col-xl-6">

          <WorkforceGapChart
            data={demandForecast}
          />

        </div>

      </div>

      {/* HEATMAP */}

      <div className="row g-5 mb-5">

        <div className="col-xl-12">

          <WorkforceRiskHeatmap
            data={demandForecast}
          />

        </div>

      </div>

      {/* SIMULATOR + RECOMMENDATION */}

      <div className="row g-5 mb-5">

        <div className="col-xl-4">

          <WorkforceSimulator
            totalAsn={data.summary.totalAsn}
            gapAsn={data.summary.totalGap}
            pensiun5Tahun={data.summary.pensiun5Tahun}
          />

        </div>

        <div className="col-xl-8">

          <WorkforceRecommendationPanel
            data={data}
          />

        </div>

      </div>

      {/* OPD TABLES */}

      <div className="row g-5">

        <div className="col-xl-12">

          <WorkforceOpdRiskTable
            data={demandForecast}
          />

        </div>

      </div>

    </div>

  )

}