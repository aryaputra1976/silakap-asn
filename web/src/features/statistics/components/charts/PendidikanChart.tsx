import ReactApexChart from "react-apexcharts"
import type { ApexOptions } from "apexcharts"

interface PendidikanStat {
  pendidikan: string
  total: number
}

interface Props {
  data: PendidikanStat[]
}

export default function PendidikanChart({ data }: Props) {

  if (!data || data.length === 0) return null

  // urutkan dari terbesar
  const sorted = [...data].sort((a, b) => b.total - a.total)

  // ambil top 6
  const top = sorted.slice(0, 6)

  // sisanya jadi "lainnya"
  const others = sorted.slice(6)

  const othersTotal = others.reduce(
    (sum, item) => sum + item.total,
    0
  )

  const finalData =
    othersTotal > 0
      ? [...top, { pendidikan: "Lainnya", total: othersTotal }]
      : top

  const series = finalData.map(d => d.total)
  const labels = finalData.map(d => d.pendidikan)

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
    tooltip: {
      y: {
        formatter: val => val.toLocaleString("id-ID")
      }
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