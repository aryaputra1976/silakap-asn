import ReactApexChart from "react-apexcharts"

interface Row {
  jabatan: string
  jumlah: number
}

interface Props {
  data: Row[]
}

export default function PensionJabatanChart({ data }: Props) {

  if (!data) return null

  const series = [
    {
      name: "ASN Pensiun",
      data: data.map((d) => d.jumlah)
    }
  ]

  const categories =
    data.map((d) => d.jabatan)

  return (

    <div className="card">

      <div className="card-header">
        <h3 className="card-title">
          Jabatan Risiko Pensiun
        </h3>
      </div>

      <div className="card-body">

        <ReactApexChart
          type="bar"
          height={320}
          series={series}
          options={{
            xaxis: { categories }
          }}
        />

      </div>

    </div>

  )
}