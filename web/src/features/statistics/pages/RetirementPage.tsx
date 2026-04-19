import { useAsnStatistics } from "../hooks/useAsnStatistics"
import RetirementChart from "../components/charts/RetirementChart"
import RetirementOpdTable from "../components/tables/RetirementOpdTable"
import WorkforceRiskIndicator from "../components/cards/WorkforceRiskIndicator"
import WorkforceGapForecast from "../components/cards/WorkforceGapForecast"

export default function RetirementPage() {

  const { data, isLoading } = useAsnStatistics()

  if (isLoading) return <div>Loading...</div>

  const prediction = data?.retirement?.prediction ?? []
  const byOpd = data?.retirement?.byOpd ?? []
  const totalAsn = data?.summary?.total ?? 0

  return (

    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-semibold">
          Prediksi Pensiun ASN
        </h2>
        <p className="text-gray-500 text-sm">
          Proyeksi ASN yang memasuki masa pensiun dalam 5 tahun ke depan.
        </p>
      </div>

      <WorkforceRiskIndicator
        prediction={prediction}
        byOpd={byOpd}
        totalAsn={totalAsn}
      />

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Proyeksi Pensiun 5 Tahun
          </h3>
        </div>

        <div className="card-body">
          <RetirementChart data={prediction} />
        </div>
      </div>

      <RetirementOpdTable data={byOpd} />

      <WorkforceGapForecast
        totalAsn={totalAsn}
        prediction={prediction}
      />

    </div>
  )
}