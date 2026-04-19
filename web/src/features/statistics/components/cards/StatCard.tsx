import ReactApexChart from "react-apexcharts"
import { Icon } from "@iconify/react"
import type { ApexOptions } from "apexcharts"

interface Props {
  title: string
  value: number
  percent?: number
  icon: string
  gradient: string
  trend?: number[]
}

export default function StatCard({
  title,
  value,
  percent,
  icon,
  gradient,
  trend
}: Props) {

  const options: ApexOptions = {
    chart: {
      type: "area",
      sparkline: {
        enabled: true
      },
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: "smooth",
      width: 2
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0
      }
    },
    tooltip: {
      enabled: false
    }
  }

  return (

    <div
      className="card shadow-sm h-100 text-white"
      style={{ background: gradient }}
    >

      <div className="card-body d-flex flex-column justify-content-between">

        {/* HEADER */}

        <div className="d-flex justify-content-between">

          <div className="fs-7 opacity-75">
            {title}
          </div>

          <div className="fs-2">
            <Icon icon={icon} />
          </div>

        </div>

        {/* VALUE */}

        <div className="mt-3">

          <div className="fs-2hx fw-bold">
            {value.toLocaleString("id-ID")}
          </div>

          {percent !== undefined && (
            <div className="fs-7 opacity-75">
              {percent.toFixed(1)}%
            </div>
          )}

        </div>

        {/* MINI TREND */}

        {trend && (
          <div className="mt-3">

            <ReactApexChart
              options={options}
              series={[{ data: trend }]}
              type="area"
              height={60}
            />

          </div>
        )}

      </div>

    </div>

  )
}