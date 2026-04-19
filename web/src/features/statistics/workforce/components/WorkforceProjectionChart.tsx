import { useMemo } from "react"
import ReactApexChart from "react-apexcharts"
import type { WorkforceProjection } from "../types"

interface Props {
  projection?: WorkforceProjection[]
}

export default function WorkforceProjectionChart({ projection }: Props) {

  const data = projection ?? []

  if (!data.length) return null

  const years = useMemo(
    () => data.map(p => Number(p.tahun)),
    [data]
  )

  const values = useMemo(
    () => data.map(p => Number(p.pensiun ?? 0)),
    [data]
  )

  const series = [
    {
      name: "Pensiun ASN",
      data: values
    }
  ]

  const options: ApexCharts.ApexOptions = {

    chart: {
      type: "line",
      toolbar: { show: false }
    },

    stroke: {
      width: 3,
      curve: "smooth"
    },

    markers: {
      size: 5
    },

    xaxis: {
      categories: years
    },

    yaxis: {
      labels: {
        formatter: val => Math.round(Number(val)).toLocaleString()
      }
    },

    colors: ["#F64E60"],

    grid: {
      strokeDashArray: 4
    },

    dataLabels: {
      enabled: true
    },

    tooltip: {
      y: {
        formatter: val => `${val} ASN pensiun`
      }
    }

  }

  return (

    <div className="card shadow-sm">

      <div className="card-header">
        <h3 className="card-title">
          Proyeksi Pensiun ASN
        </h3>
      </div>

      <div className="card-body">

        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={320}
        />

      </div>

    </div>

  )

}