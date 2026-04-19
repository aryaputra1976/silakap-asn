import { useMemo } from "react"
import ReactApexChart from "react-apexcharts"
import type { WorkforceOpd } from "../types"

interface Props {
  data?: WorkforceOpd[]
}

export default function WorkforceGapChart({ data = [] }: Props) {

  const processed = useMemo(() => {

    return data
      .map(o => {

        const gap = Number(o.gapAsn ?? 0)
        const pensiun = Number(o.pensiun5Tahun ?? 0)

        return {
          namaUnor: o.namaUnor ? String(o.namaUnor) : "OPD",
          risiko: gap + pensiun
        }

      })
      .filter(o => o.risiko > 0)
      .sort((a, b) => b.risiko - a.risiko)
      .slice(0, 8)

  }, [data])

  if (!processed.length) {

    return (

      <div className="card shadow-sm">

        <div className="card-header">
          <h3 className="card-title">
            OPD Risiko Kekurangan ASN (5 Tahun)
          </h3>
        </div>

        <div className="card-body text-gray-500">
          Tidak ada risiko kekurangan ASN dalam 5 tahun
        </div>

      </div>

    )

  }

  const categories = processed.map(o => o.namaUnor)
  const values = processed.map(o => o.risiko)

  const series = [
    {
      name: "Risiko ASN",
      data: values
    }
  ]

  const options: ApexCharts.ApexOptions = {

    chart: {
      type: "bar",
      toolbar: { show: false }
    },

    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6
      }
    },

    xaxis: {
      categories: categories
    },

    yaxis: {},

    colors: ["#F64E60"],

    grid: {
      strokeDashArray: 4
    },

    dataLabels: {
      enabled: true
    },

    tooltip: {
      y: {
        formatter: val => `${val} ASN`
      }
    }

  }

  return (

    <div className="card shadow-sm">

      <div className="card-header">

        <h3 className="card-title">
          OPD Risiko Kekurangan ASN (5 Tahun)
        </h3>

      </div>

      <div className="card-body">

        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={320}
        />

      </div>

    </div>

  )

}