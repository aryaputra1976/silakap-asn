import { useUnorStats } from "../hooks/useUnorStats"

export default function UnorStats({ unitId }: any) {

  const stats = useUnorStats(unitId)

  if (!stats) return null

  return (

    <div className="card p-4 mb-5">

      <div>Total ASN : {stats.total}</div>
      <div>PNS : {stats.pns}</div>
      <div>PPPK : {stats.pppk}</div>

    </div>

  )

}