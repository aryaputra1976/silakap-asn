import { useAsnStatistics } from "../hooks/useAsnStatistics"
import OpdTable from "../components/tables/OpdTable"

export default function OpdStatisticsPage() {

  const { data, isLoading, isError } = useAsnStatistics()

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Memuat statistik OPD...
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-red-500">
        Data statistik OPD tidak tersedia
      </div>
    )
  }

  return (

    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-semibold">
          Statistik ASN per OPD
        </h2>
        <p className="text-gray-500 text-sm">
          Distribusi ASN berdasarkan perangkat daerah.
        </p>
      </div>

      <OpdTable
        data={data.organization.opd}
        totalAsn={data.summary.total}
      />

    </div>

  )
}