import Chart from "react-apexcharts"
import type { ApexOptions } from "apexcharts"
import type { DashboardStat } from "../api/dashboard.api"

interface Props {
  stats: DashboardStat[]
}

export default function DashboardChart({ stats }: Props) {

  const series = stats.map(s => s.count)
  const labels = stats.map(s => s.status)

  const options: ApexOptions = {
    labels,
    legend: {
      position: "bottom"
    },
    dataLabels: {
      enabled: true
    }
  }

  return (
    <Chart
      type="donut"
      series={series}
      options={options}
      height={350}
    />
  )
}