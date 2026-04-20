import { Card } from "react-bootstrap"
import Chart from "react-apexcharts"
import type { ApexOptions } from "apexcharts"

import type { DmsKategoriCountItem } from "../types"

type Props = {
  items: DmsKategoriCountItem[]
}

export function DmsDashboardKategoriChart({ items }: Props) {
  const series = items.map((item) => item.total)
  const labels = items.map(
    (item) => item.kategori ?? "Tanpa Kategori",
  )

  const options: ApexOptions = {
    chart: {
      type: "donut",
      toolbar: { show: false },
    },
    labels,
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: true,
    },
    noData: {
      text: "Belum ada data kategori",
    },
  }

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-white border-0">
        <h6 className="mb-0">Distribusi Kategori Kelengkapan</h6>
      </Card.Header>
      <Card.Body>
        <Chart
          type="donut"
          height={320}
          options={options}
          series={series}
        />
      </Card.Body>
    </Card>
  )
}