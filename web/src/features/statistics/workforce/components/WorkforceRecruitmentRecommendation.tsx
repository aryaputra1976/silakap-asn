import type { WorkforceDashboard } from "../types"

interface Props {
  data?: WorkforceDashboard
}

export default function WorkforceRecruitmentRecommendation({ data }: Props) {

  if (!data) return null

  const summary = data.summary

  const gap = summary.totalGap ?? 0
  const pensiun = summary.pensiun5Tahun ?? 0

  const kebutuhanTotal = gap + pensiun

  const perTahun = Math.ceil(kebutuhanTotal / 5)

  return (

    <div className="bg-white shadow rounded-xl p-6">

      <h3 className="font-semibold mb-4">
        Rekomendasi Formasi ASN
      </h3>

      <div className="grid grid-cols-3 gap-4">

        <div>

          <div className="text-sm text-gray-500">
            Gap ASN Saat Ini
          </div>

          <div className="text-xl font-bold text-red-600">
            {gap}
          </div>

        </div>


        <div>

          <div className="text-sm text-gray-500">
            Pensiun 5 Tahun
          </div>

          <div className="text-xl font-bold text-yellow-600">
            {pensiun}
          </div>

        </div>


        <div>

          <div className="text-sm text-gray-500">
            Total Kebutuhan ASN
          </div>

          <div className="text-xl font-bold text-blue-600">
            {kebutuhanTotal}
          </div>

        </div>

      </div>


      <div className="mt-6 border-t pt-4">

        <div className="text-sm text-gray-500">
          Rekomendasi Rekrutmen per Tahun
        </div>

        <div className="text-2xl font-bold text-green-600">
          {perTahun} ASN / tahun
        </div>

      </div>

    </div>

  )

}