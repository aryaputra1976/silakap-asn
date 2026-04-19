import ReactApexChart from "react-apexcharts"
import type { ApexOptions } from "apexcharts"

type Row = {
  tahun: string
  jumlah: number
}

interface Props {
  data: Row[]
}

export default function RetirementChart({ data }: Props) {

  if (!data || data.length === 0) return null

  const currentYear = new Date().getFullYear()

  const categories = data.map((_, i) => currentYear + i)

  const values = data.map(d => d.jumlah)

  const colors = values.map(v => {
    if (v >= 190) return "#F1416C"   // tinggi
    if (v >= 170) return "#FFA800"   // sedang
    return "#50CD89"                 // rendah
  })

  const options: ApexOptions = {

    chart: {
      type: "bar",
      toolbar: { show: false }
    },

    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 6,
        columnWidth: "45%"
      }
    },

    dataLabels: {
      enabled: true
    },

    colors,

    xaxis: {
      categories,
      title: {
        text: "Tahun"
      }
    },

    yaxis: {
      title: {
        text: "Jumlah ASN Pensiun"
      }
    }

  }

  return (
    <ReactApexChart
      options={options}
      series={[{ name: "ASN Pensiun", data: values }]}
      type="bar"
      height={340}
    />
  )
}