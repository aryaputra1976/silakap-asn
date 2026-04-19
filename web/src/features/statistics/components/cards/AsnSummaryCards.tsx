import StatCard from "./StatCard"
import type { AsnSummary } from "../../types"

interface Props {
  summary: AsnSummary
}

export default function AsnSummaryCards({ summary }: Props) {

  const total = summary.total
  const pns = summary.pns
  const pppk = summary.pppk
  const pppkParuh = summary.pppkParuhWaktu

  const percent = (value: number) =>
    total ? (value / total) * 100 : 0

  return (

    <div className="row g-5 mb-5">

      {/* TOTAL ASN */}

      <div className="col-md-3">

        <StatCard
          title="Total ASN"
          value={total}
          icon="mdi:account-group"
          gradient="linear-gradient(135deg,#3699FF,#187DE4)"
          trend={[6000,6500,7000,7500,8000,8521]}
        />

      </div>

      {/* PNS */}

      <div className="col-md-3">

        <StatCard
          title="PNS"
          value={pns}
          percent={percent(pns)}
          icon="mdi:account-tie"
          gradient="linear-gradient(135deg,#1BC5BD,#0BB783)"
          trend={[3500,3700,3900,4100,4200,4331]}
        />

      </div>

      {/* PPPK */}

      <div className="col-md-3">

        <StatCard
          title="PPPK"
          value={pppk}
          percent={percent(pppk)}
          icon="mdi:file-document-outline"
          gradient="linear-gradient(135deg,#FFA800,#F64E60)"
          trend={[500,650,800,1000,1200,1411]}
        />

      </div>

      {/* PPPK PARUH */}

      <div className="col-md-3">

        <StatCard
          title="PPPK Paruh Waktu"
          value={pppkParuh}
          percent={percent(pppkParuh)}
          icon="mdi:clock-outline"
          gradient="linear-gradient(135deg,#8950FC,#6993FF)"
          trend={[1500,1700,2000,2300,2500,2779]}
        />

      </div>

    </div>

  )
}
