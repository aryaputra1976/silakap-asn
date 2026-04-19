import { useAsnStatistics } from "../hooks/useAsnStatistics"

import AsnSummaryCards from "../components/cards/AsnSummaryCards"
import GolonganChart from "../components/charts/GolonganChart"
import JabatanChart from "../components/charts/JabatanChart"
import UsiaChart from "../components/charts/UsiaChart"

import OpdTable from "../components/tables/OpdTable"

export default function AsnStatisticsPage() {

  const { data, isLoading } = useAsnStatistics()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!data) {
    return <div>No Data</div>
  }

  return (

    <div className="container-fluid">

      <h1 className="mb-8">Statistik ASN</h1>

      {/* KPI */}
      <AsnSummaryCards summary={data.summary} />

      {/* DISTRIBUTION CHARTS */}

      <div className="row g-5 mb-8">

        <div className="col-xl-4">
          <GolonganChart data={data.distribution.golongan} />
        </div>

        <div className="col-xl-4">
          <JabatanChart data={data.distribution.jabatan} />
        </div>

        <div className="col-xl-4">
          <UsiaChart data={data.distribution.usia} />
        </div>

      </div>

      {/* ORGANIZATION */}

      <OpdTable data={data.organization.opd} />

    </div>
  )
}