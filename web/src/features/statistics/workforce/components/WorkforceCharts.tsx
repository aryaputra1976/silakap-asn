import { useMemo } from "react"
import ReactApexChart from "react-apexcharts"
import type { WorkforceDashboard } from "../types"

interface Props {
  data?: WorkforceDashboard
}

export default function WorkforceCharts({ data }: Props) {

  if (!data) return null

  const s = data.summary

  const series = useMemo(() => [
    {
      name: "ASN",
      data: [s.totalAsn]
    },
    {
      name: "Kebutuhan",
      data: [s.totalKebutuhan]
    },
    {
      name: "Pensiun",
      data: [s.pensiun5Tahun]
    }
  ], [s])

  const options: ApexCharts.ApexOptions = useMemo(() => ({

    chart: {
      type: "bar",
      toolbar: { show: false }
    },

    xaxis: {
      categories: ["Workforce"]
    },

    yaxis: {
      labels: {
        formatter: val => Math.round(val).toLocaleString()
      }
    },

    colors: [
      "#3699FF",
      "#8950FC",
      "#FFA800"
    ],

    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 6
      }
    },

    grid: {
      strokeDashArray: 4
    },

    dataLabels: {
      enabled: true
    },

    tooltip: {
      y: {
        formatter: val => `${val.toLocaleString()} ASN`
      }
    }

  }), [])

  return (

    <div className="card shadow-sm">

      <div className="card-header">

        <h3 className="card-title">
          Workforce Overview
        </h3>

      </div>

      <div className="card-body">

        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
        />

      </div>

    </div>

  )

}