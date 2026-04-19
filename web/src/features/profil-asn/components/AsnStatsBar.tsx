import { AsnStats } from "../hooks/useAsnStats"

export function AsnStatsBar({ stats }: { stats: AsnStats }) {

  return (

    <div className="d-flex gap-6 fw-bold">

      <div>
        Total ASN : {stats.total}
      </div>

      <div className="text-primary">
        PNS : {stats.pns}
      </div>

      <div className="text-success">
        PPPK : {stats.pppk}
      </div>

      <div className="text-warning">
        PPPK Paruh Waktu : {stats.pppkParuhWaktu}
      </div>

    </div>

  )

}