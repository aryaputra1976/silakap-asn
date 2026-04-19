import { useParams } from "react-router-dom"
import WorkforceCards from "../components/WorkforceCards"
import { useWorkforceDetail } from "../hooks/useWorkforceDetail"

export default function WorkforceDetailPage() {
  const { unorId } = useParams()

  const tahun = new Date().getFullYear()

  const { data, isLoading } = useWorkforceDetail(
    tahun,
    Number(unorId)
  )

  if (isLoading) return <div>Loading...</div>

  if (!data) return null

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">
        Detail Workforce OPD
      </h1>

      <WorkforceCards
        data={{
          summary: {
            totalAsn: data.asnEksisting,
            totalBebanKerja: data.totalBebanKerja,
            totalKebutuhan: data.kebutuhanAsn,
            totalGap: data.gapAsn,
            pensiun5Tahun: data.pensiun5Tahun,
            rekomendasiFormasi: data.rekomendasiFormasi,
          },
        }}
      />
    </div>
  )
}
