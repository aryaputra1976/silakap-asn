import ReactApexChart from "react-apexcharts"
import type { ApexOptions } from "apexcharts"

interface Props {
  data: {
    gender: string
    total: number
  }[]
}

export default function GenderChart({ data }: Props) {

  if (!data || data.length === 0) return null

  const series = data.map(d => d.total)

  const labels = data.map(d => d.gender)

  const options: ApexOptions = {
    chart: { type: "donut" },
    labels,
    legend: { position: "bottom" },
    dataLabels: { enabled: true }
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