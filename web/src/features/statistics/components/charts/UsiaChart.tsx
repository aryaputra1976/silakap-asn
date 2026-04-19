import Chart from "react-apexcharts"
import type { UsiaStat } from "../../types"

interface Props {
  data?: UsiaStat[]
}

export default function UsiaChart({ data }: Props) {

  if (!data || data.length === 0) return null

  const series = [
    {
      name: "ASN",
      data: data.map(d => d.jumlah)
    }
  ]

  const categories = data.map(d => d.range)

  return (
    <Chart
      type="bar"
      height={320}
      series={series}
      options={{
        xaxis: { categories }
      }}
    />
  )
}