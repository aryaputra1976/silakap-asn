import ReactApexChart from "react-apexcharts"
import type { ApexOptions } from "apexcharts"
import type { JabatanStat } from "../../types"

interface Props {
  data: JabatanStat[]
}

export default function JabatanChart({ data }: Props) {

  const series = data.map(d => d.jumlah)

  const labels = data.map(d => d.jabatan)

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
    }

  }

  return (

    <div className="card">

      <div className="card-header">
        <h3 className="card-title">
          Distribusi Jabatan
        </h3>
      </div>

      <div className="card-body">

        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={320}
        />

      </div>

    </div>

  )
}