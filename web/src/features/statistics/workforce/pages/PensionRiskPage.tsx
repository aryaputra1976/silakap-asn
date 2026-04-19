import { useState } from "react"
import PensionRiskTable from "../components/PensionRiskTable"
import PensionJabatanChart from "../components/PensionJabatanChart"
import PensionYearFilter from "../components/PensionYearFilter"
import { usePensionRisk } from "../hooks/usePensionRisk"
import WorkforceRiskHeatmap from "../components/WorkforceRiskHeatmap"

export default function PensionRiskPage() {

  const [tahun, setTahun] =
    useState(new Date().getFullYear())

  const { data, isLoading } =
    usePensionRisk(tahun)

  if (isLoading)
    return <div className="py-10 text-center">Loading...</div>

  if (!data) return null

  return (

    <div className="space-y-8">

      <h1 className="text-xl font-semibold">
        Pension Risk Dashboard
      </h1>

      <PensionYearFilter
        tahun={tahun}
        setTahun={setTahun}
      />

      <PensionJabatanChart
        data={data.jabatan}
      />

      <PensionRiskTable
        data={data.opd}
      />

      <WorkforceRiskHeatmap data={data.heatmap} />
    </div>

  )
}