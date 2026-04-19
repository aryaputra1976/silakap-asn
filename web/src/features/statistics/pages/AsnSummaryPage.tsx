import { useAsnStatistics } from "../hooks/useAsnStatistics"

import AsnSummaryCards from "../components/cards/AsnSummaryCards"
import UsiaChart from "../components/charts/UsiaChart"
import GolonganChart from "../components/charts/GolonganChart"
import WorkforceInsight from "../components/insights/WorkforceInsight"

export default function AsnSummaryPage() {

  const { data, isLoading, isError } = useAsnStatistics()

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Memuat data statistik ASN...
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-red-500">
        Data statistik ASN tidak tersedia
      </div>
    )
  }

  const usia = data?.distribution?.usia ?? []
  const golongan = data?.distribution?.golongan ?? []

  return (

    <div className="space-y-5">

      {/* KPI SUMMARY */}

      <AsnSummaryCards summary={data.summary} />

      {/* DISTRIBUSI ASN */}

      <div className="card">

        <div className="card-header">
          <h3 className="card-title">
            Demografi ASN – Distribusi Usia
          </h3>
        </div>

        <div className="card-body">
          <UsiaChart data={usia} />
        </div>

      </div>

      {/* KOMPOSISI GOLONGAN */}

      <div className="card">

        <div className="card-header">
          <h3 className="card-title">
            Komposisi ASN – Distribusi Golongan
          </h3>
        </div>

        <div className="card-body">
          <GolonganChart data={golongan} />
        </div>

      </div>

      {/* WORKFORCE INSIGHT */}

      <div className="card bg-light border-start border-4 border-primary">

        <div className="card-header">
          <h3 className="card-title">
            Workforce Insight
          </h3>
        </div>

        <div className="card-body">
          <WorkforceInsight summary={data.summary} />
        </div>

      </div>

    </div>

  )
}
