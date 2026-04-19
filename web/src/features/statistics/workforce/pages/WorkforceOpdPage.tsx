import WorkforceTreeTable from "../components/WorkforceTreeTable"
import { useWorkforceOpd } from "../hooks/useWorkforceOpd"

export default function WorkforceOpdPage() {

  const tahun = new Date().getFullYear()

  const {
    data,
    isLoading,
    isError
  } = useWorkforceOpd(tahun)

  if (isLoading) {

    return (
      <div className="py-10 text-center text-gray-500">
        Memuat data workforce...
      </div>
    )

  }

  if (isError || !data) {

    return (
      <div className="py-10 text-center text-red-500">
        Data tidak tersedia
      </div>
    )

  }

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-2xl font-bold">
          Analisis Gap ASN per Unit
        </h1>

        <p className="text-gray-500 text-sm">
          Hierarki kebutuhan ASN berdasarkan struktur organisasi
        </p>

      </div>

      <WorkforceTreeTable data={data} />

    </div>

  )

}