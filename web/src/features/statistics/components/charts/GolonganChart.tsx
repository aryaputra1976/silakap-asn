import ReactApexChart from "react-apexcharts"
import type { ApexOptions } from "apexcharts"
import type { GolonganStat } from "../../types"

interface Props {
  data: GolonganStat[]
}

export default function GolonganChart({ data }: Props) {

  if (!data || data.length === 0) return null

  const series = data.map(d => d.jumlah)

  const labels = data.map(d => `Gol ${d.golongan}`)

  const options: ApexOptions = {
    chart: {
      type: "donut"
    },
    labels,
    legend: {
      position: "bottom"
    },
    dataLabels: {
      enabled: true
    },
    stroke: {
      width: 0
    }
  }

  return (

    <ReactApexChart
      options={options}
      series={series}
      type="donut"
      height={320}
    />

  )
}